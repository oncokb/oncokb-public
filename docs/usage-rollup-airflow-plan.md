# Usage Rollup Airflow Plan

## Goal

Build a scalable usage-analytics pipeline where:

- the Java backend continues to emit daily `token_stats` exports to S3
- Airflow ingests those daily files
- Airflow populates rollup tables optimized for admin usage pages
- the application queries rollup tables instead of scanning raw `token_stats`

This plan assumes the S3 export job already exists in the Java backend and remains the system of record for raw usage events.

## Source Data

The Java backend currently writes daily token stats files to S3 and clears older `token_stats` rows from the application database afterward.

Expected raw fields from the exported file:

- `email`
- `accessIp`
- `accessTime`
- `usageCount`
- `UUID`
- `resource`

For the rollup use case:

- `email`, `accessTime`, `usageCount`, and `resource` are the key fields
- `accessIp` and `UUID` are not required for the summary rollups

## Target Schema

Use a separate analytics schema for rollups. Example schema name:

- `oncokb_metrics`

Recommended tables:

### `usage_ingest_run`

Tracks idempotency and run status per source file / bucket date.

Suggested columns:

- `id`
- `s3_key`
- `bucket_date`
- `status` (`PENDING`, `RUNNING`, `SUCCEEDED`, `FAILED`)
- `source_row_count`
- `imported_at`
- `error_message`
- `created_at`
- `updated_at`

Constraints:

- unique on `s3_key`
- unique on `bucket_date`

### `usage_resource_dim`

Normalizes resources and precomputes whether a resource is public.

Suggested columns:

- `id`
- `resource_path`
- `is_public`
- `created_at`

Constraints / indexes:

- unique on `resource_path`
- index on `(is_public, resource_path)`

Rule:

- `is_public = resource_path NOT LIKE '/api/private/%'`

### `usage_user_bucket_resource`

Canonical aggregated detail grain used for drill-downs and as the source for higher-order summaries.

One row per:

- `bucket_granularity`
- `bucket_start_date`
- `user_email`
- `resource`

Suggested columns:

- `bucket_granularity` (`DAY`, `WEEK`, `YEAR`)
- `bucket_start_date`
- `user_id`
- `user_email`
- `company_id`
- `resource_id`
- `usage_count`
- `created_at`
- `updated_at`

Purpose:

- user detail pages
- resource detail pages
- source for rebuilding weekly / yearly rollups

### `usage_user_bucket_summary`

Summary table for `/usage/summary/users`.

One row per:

- `bucket_granularity`
- `bucket_start_date`
- `user_email`

Suggested columns:

- `bucket_granularity`
- `bucket_start_date`
- `user_id`
- `user_email`
- `company_id`
- `total_usage`
- `total_public_usage`
- `top_resource_id`
- `top_resource_usage`
- `top_public_resource_id`
- `top_public_resource_usage`
- `created_at`
- `updated_at`

Purpose:

- paged server-side user usage summary
- fast filter by `companyId`
- fast toggle for public-only vs all usage

### `usage_resource_bucket_summary`

Summary table for `/usage/summary/resources`.

One row per:

- `bucket_granularity`
- `bucket_start_date`
- `resource_id`

Suggested columns:

- `bucket_granularity`
- `bucket_start_date`
- `resource_id`
- `usage_count`
- `created_at`
- `updated_at`

Purpose:

- paged server-side resource usage summary

## Why This Shape

This schema avoids runtime aggregation over a very large raw events table.

The application should query:

- `usage_user_bucket_summary` for the users summary tab
- `usage_resource_bucket_summary` for the resources summary tab
- `usage_user_bucket_resource` for user/resource drill-downs

That keeps the expensive work in Airflow and leaves the app doing indexed lookup + paging only.

## Airflow DAG Plan

### DAG Inputs

- S3 bucket
- S3 object key pattern for daily token stats exports
- database connection for the analytics schema
- database connection or read access for resolving current user/company mappings if needed

### DAG Schedule

Run once per day after the Java export job finishes.

The cleanest contract is:

- Java job writes one file for usage date `D`
- Airflow DAG ingests usage date `D`

### DAG Steps

#### 1. Wait for S3 object

Wait for the daily zipped token stats file to exist.

Example:

- `public-website/usage-analysis/...` for summaries is not the source here
- the source should be the raw token-stats export written by the backend cron

#### 2. Register ingest run

Insert or upsert a row in `usage_ingest_run`:

- `status = PENDING` then `RUNNING`
- associate it with `bucket_date`

If a successful run already exists for the same `bucket_date` or `s3_key`, stop unless this is an explicit reprocess.

#### 3. Extract and parse source file

Stream the file from S3, unzip, and parse TSV.

At this stage:

- validate required columns
- reject malformed rows
- count total source rows

You can stage the raw parsed rows temporarily in:

- an Airflow temp file
- a temp table
- a transient staging table

This plan does not require permanently storing raw events in the analytics schema.

#### 4. Resolve user and company metadata

For each distinct `email` in the file, resolve:

- `jhi_user.id`
- `user_details.company_id`

Recommended behavior:

- store the resolved `user_id` / `company_id` snapshot into rollup tables at ingest time

That is important because:

- the source file contains `email`, not `user_id`
- user/company mappings can change over time

This makes historical rollups stable and queryable without repeated expensive joins.

#### 5. Upsert resource dimension

For each distinct `resource`, upsert into `usage_resource_dim`:

- `resource_path`
- `is_public`

#### 6. Build day-level aggregates

Aggregate the parsed file by day and load:

- `usage_user_bucket_resource` with `bucket_granularity = DAY`
- `usage_user_bucket_summary` with `bucket_granularity = DAY`
- `usage_resource_bucket_summary` with `bucket_granularity = DAY`

This should be idempotent for a given `bucket_date`.

Recommended approach:

- delete and rebuild the affected day before insert
- or use deterministic upserts keyed by bucket + entity grain

#### 7. Rebuild affected week

Recompute the ISO week containing `bucket_date`.

Important:

- rebuild weekly rows from the day rollup
- do not reread all historical raw event files to make week rollups

This limits recomputation to one week at a time.

#### 8. Rebuild affected year

Recompute the year containing `bucket_date`.

Again:

- rebuild yearly rows from the day rollup
- do not rebuild from raw source files if it can be avoided

#### 9. Validate totals

Validate that totals reconcile.

Minimum checks:

- raw file `SUM(usageCount)`
- day-level `usage_user_bucket_resource` total
- day-level `usage_user_bucket_summary.total_usage` total
- day-level `usage_resource_bucket_summary.usage_count` total

These should all match for the same day.

Additional checks:

- `top_resource_usage <= total_usage`
- `top_public_resource_usage <= total_public_usage`
- public usage totals exclude `/api/private/%`

#### 10. Mark run successful

Update `usage_ingest_run`:

- `status = SUCCEEDED`
- `source_row_count`
- `imported_at`

#### 11. Failure handling

On failure:

- mark `status = FAILED`
- store `error_message`
- alert via normal Airflow notification paths

## Idempotency and Reprocessing

This pipeline should support safe reprocessing.

Recommended strategy:

- use `bucket_date` as the reprocessing unit
- rebuild all day rows for that date
- rebuild the derived week and year that contain that date

That keeps the DAG simple and avoids partial merge logic across grains.

## Query Contract for the App

The backend usage summary endpoints should query the rollups, not raw `token_stats`.

### Users summary

Filters:

- `interval = DAY | WEEK | YEAR`
- `publicOnly = true | false`
- `companyId` optional
- `search` optional
- paging params

Backed by:

- `usage_user_bucket_summary`
- `usage_resource_dim` for top resource names

### Resources summary

Filters:

- `interval = DAY | WEEK | YEAR`
- `publicOnly = true | false`
- `search` optional
- paging params

Backed by:

- `usage_resource_bucket_summary`
- `usage_resource_dim`

### Detail pages

Backed by:

- `usage_user_bucket_resource`

## Search Guidance

For paged summary tables, search must also be server-side.

Otherwise the current search bar becomes misleading because it would only search the current page.

Recommended summary search semantics:

- user summary: search displayed summary rows by `user_email` and top resource path
- resource summary: search by `resource_path`

Avoid scanning raw events for free-text summary search.

## Indexing Guidance

Design indexes around the summary screens, not the raw ingest flow.

Recommended index patterns:

- user summary: `(bucket_granularity, bucket_start_date, company_id, user_email)`
- resource summary: `(bucket_granularity, bucket_start_date, resource_id)`
- resource dimension: `(is_public, resource_path)`

If search grows expensive:

- prefer prefix search over `%term%`
- consider a normalized search column

## Partitioning Guidance

If volumes continue to grow:

- partition day-grain rollup tables by `bucket_start_date`
- optionally partition summary tables by year or month

That is a second-stage optimization. The first-order win is moving aggregation out of request time.

## Liquibase Plan For a Separate Schema

Yes, you can keep using Liquibase even if the rollups live in a different schema.

Recommended approach:

- create a second Liquibase changelog tree for the analytics schema
- run it with a second `SpringLiquibase` bean
- give it its own `defaultSchema`
- give it its own `DATABASECHANGELOG` and `DATABASECHANGELOGLOCK` tables

This is the cleanest option for development because it keeps:

- app schema migrations separate from analytics schema migrations
- rollback / diff behavior simpler
- change ownership explicit

### Recommended layout

Add a second changelog root, for example:

- `src/main/resources/config/liquibase-usage/master.xml`
- `src/main/resources/config/liquibase-usage/changelog/...`

Keep the current app changelog tree untouched:

- `src/main/resources/config/liquibase/master.xml`

### Recommended Spring setup

Add a second configuration bean similar to the existing one in `LiquibaseConfiguration`.

That second bean should set:

- `changeLog = classpath:config/liquibase-usage/master.xml`
- `defaultSchema = oncokb_metrics`
- `liquibaseSchema = oncokb_metrics`
- `databaseChangeLogTable = DATABASECHANGELOG_USAGE`
- `databaseChangeLogLockTable = DATABASECHANGELOGLOCK_USAGE`

Using distinct changelog tables matters. Without that, the two Liquibase runners will step on each other.

### Why not put the analytics tables into the current master changelog?

You technically can, using `schemaName` on the changesets or a different default schema.

I do not recommend that here because:

- it mixes operational concerns
- it makes local development more fragile
- it makes it easier to accidentally point analytics DDL at the app schema
- it couples analytics rollout to unrelated app schema migrations

### Dev workflow benefit

With a separate Liquibase runner:

- developers can bootstrap both schemas locally from the app
- schema history stays versioned in this repo
- Airflow can assume the schema exists already

If needed, you can also disable the usage Liquibase bean independently by property.

## Recommended Next Steps

1. Add the analytics Liquibase changelog tree.
2. Add a second `SpringLiquibase` bean for the analytics schema.
3. Create the four rollup tables plus resource dimension and ingest-run tracking.
4. Implement the Airflow DAG against the S3 token stats export.
5. Repoint the usage summary endpoints to the rollup tables.
