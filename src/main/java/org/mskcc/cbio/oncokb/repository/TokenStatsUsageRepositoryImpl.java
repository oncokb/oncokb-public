package org.mskcc.cbio.oncokb.repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.cbio.oncokb.config.application.ApplicationProperties;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.ResourceUsageAnalysisRow;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageAnalysisInterval;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageAnalysisRow;
import org.mskcc.cbio.oncokb.web.rest.vm.usageAnalysis.UsageResourceName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Repository
public class TokenStatsUsageRepositoryImpl implements TokenStatsUsageRepository {
  private static final Logger log = LoggerFactory.getLogger(TokenStatsUsageRepositoryImpl.class);
  private static final String USER_RESOURCE_ALIAS = "uur";
  private static final String USER_SUMMARY_ALIAS = "uus";
  private static final String RESOURCE_SUMMARY_ALIAS = "urs";
  private static final String RESOURCE_DIM_ALIAS = "urd";
  private static final String TOP_RESOURCE_ALIAS = "top_res";
  private static final String TOP_PUBLIC_RESOURCE_ALIAS = "top_pub_res";
  private static final String USAGE_RESOURCE_DIM_TABLE = "usage_resource_dim";
  private static final String USER_TABLE = "jhi_user";
  private static final String USER_DETAILS_TABLE = "user_details";

  private final String usageSchemaName;

  @PersistenceContext
  private EntityManager entityManager;

  public TokenStatsUsageRepositoryImpl(ApplicationProperties applicationProperties) {
    this.usageSchemaName = normalizeSchemaName(
      applicationProperties.getUsageLiquibase().getSchema()
    );
    log.info("Initialized TokenStatsUsageRepositoryImpl with usage schema: {}", usageSchemaName);
  }

  @Override
  public Page<UsageAnalysisRow> findPagedUserUsageSummary(
    UsageAnalysisInterval interval,
    boolean publicOnly,
    Long companyId,
    Long userId,
    String searchQuery,
    String resourceContainsQuery,
    String fromDate,
    String toDate,
    Pageable pageable
  ) {
    String periodExpression = getPeriodExpression(
      USER_SUMMARY_ALIAS,
      interval
    );
    String usageUserSummaryTable = qualifyTable(getUserSummaryTableName(interval));
    String usageResourceDimTable = qualifyTable(USAGE_RESOURCE_DIM_TABLE);
    String companyFilter = companyId != null
      ? " and " + USER_SUMMARY_ALIAS + ".company_id = :companyId "
      : "";
    String userFilter = userId != null
      ? " and " + USER_SUMMARY_ALIAS + ".user_id = :userId "
      : "";
    String resourcePresenceFilter = publicOnly
      ? " and " + USER_SUMMARY_ALIAS + ".top_public_resource_id is not null "
      : " and " + USER_SUMMARY_ALIAS + ".top_resource_id is not null ";
    String searchFilter = hasSearchFilter(searchQuery)
      ? " and (" + USER_SUMMARY_ALIAS + ".user_email like :searchQuery escape '\\\\' " +
      " or " + getTopResourceAlias(publicOnly) + ".resource_path like :searchQuery escape '\\\\' " +
      " or " + periodExpression + " like :searchQuery escape '\\\\') "
      : "";
    String resourceFilter = hasResourceFilter(resourceContainsQuery)
      ? " and " + getTopResourceAlias(publicOnly) + ".resource_path like :resourceContainsQuery escape '\\\\' "
      : "";
    String timeFromFilter = hasTimeFilter(fromDate)
      ? " and " + periodExpression + " >= :fromDate "
      : "";
    String timeToFilter = hasTimeFilter(toDate)
      ? " and " + periodExpression + " <= :toDate "
      : "";

    String dataSql =
      "select " + USER_SUMMARY_ALIAS + ".user_id as user_id, " +
      USER_SUMMARY_ALIAS + ".user_email as user_email, " +
      getTopResourceIdColumn(publicOnly, USER_SUMMARY_ALIAS) + " as resource_id, " +
      getTopResourceAlias(publicOnly) + ".resource_path as resource, " +
      getUsageColumn(publicOnly, USER_SUMMARY_ALIAS) + " as total_usage, " +
      periodExpression + " as period_key, " +
      getProportionExpression(publicOnly, USER_SUMMARY_ALIAS) + " as max_usage_proportion " +
      " from " + usageUserSummaryTable + " " + USER_SUMMARY_ALIAS + " " +
      getUserSummaryJoins(usageResourceDimTable) +
      " where 1 = 1 " +
      companyFilter +
      userFilter +
      resourcePresenceFilter +
      searchFilter +
      resourceFilter +
      timeFromFilter +
      timeToFilter +
      buildOrderByClause(pageable, getUserUsageOrderMappings()) +
      buildPaginationClause(pageable);

    String countSql =
      "select count(*) from (" +
      " select " + USER_SUMMARY_ALIAS + ".user_id, " +
      periodExpression + " as period_key " +
      " from " + usageUserSummaryTable + " " + USER_SUMMARY_ALIAS + " " +
      getUserSummaryJoins(usageResourceDimTable) +
      " where 1 = 1 " +
      companyFilter +
      userFilter +
      resourcePresenceFilter +
      searchFilter +
      resourceFilter +
      timeFromFilter +
      timeToFilter +
      ") counts";

    Query dataQuery = entityManager.createNativeQuery(dataSql);
    Query totalQuery = entityManager.createNativeQuery(countSql);
    applyCommonParameters(
      dataQuery,
      totalQuery,
      companyId,
      userId,
      null,
      searchQuery,
      resourceContainsQuery,
      fromDate,
      toDate
    );

    @SuppressWarnings("unchecked")
    List<Object[]> rows = dataQuery.getResultList();
    List<UsageAnalysisRow> result = new ArrayList<>();
    for (Object[] row : rows) {
      UsageAnalysisRow item = new UsageAnalysisRow();
      item.setUserId(toStringValue(row[0]));
      item.setUserEmail(toStringValue(row[1]));
      item.setResourceId(toLongValue(row[2]));
      item.setResource(toStringValue(row[3]));
      item.setUsage(toLongValue(row[4]));
      item.setTime(toStringValue(row[5]));
      item.setMaxUsageProportion(toFloatValue(row[6]));
      result.add(item);
    }

    long total = toLongValue(totalQuery.getSingleResult());
    return new PageImpl<>(result, pageable, total);
  }

  @Override
  public Page<ResourceUsageAnalysisRow> findPagedResourceUsageSummary(
    UsageAnalysisInterval interval,
    boolean publicOnly,
    Long userId,
    String searchQuery,
    String resourceContainsQuery,
    String fromDate,
    String toDate,
    Pageable pageable
  ) {
    String periodExpression = getPeriodExpression(
      USER_RESOURCE_ALIAS,
      interval
    );
    String usageUserResourceTable = qualifyTable(getUserResourceTableName(interval));
    String usageResourceDimTable = qualifyTable(USAGE_RESOURCE_DIM_TABLE);
    String userTable = USER_TABLE;
    String userDetailsTable = USER_DETAILS_TABLE;
    String userFilter = userId != null
      ? " and " + USER_RESOURCE_ALIAS + ".user_id = :userId "
      : "";
    String publicFilter = publicOnly
      ? " and " + RESOURCE_DIM_ALIAS + ".is_public = 1 "
      : "";
    String searchFilter = hasSearchFilter(searchQuery)
      ? " and (" + RESOURCE_DIM_ALIAS + ".resource_path like :searchQuery escape '\\\\' " +
      " or " + periodExpression + " like :searchQuery escape '\\\\') "
      : "";
    String resourceFilter = hasResourceFilter(resourceContainsQuery)
      ? " and " + RESOURCE_DIM_ALIAS + ".resource_path like :resourceContainsQuery escape '\\\\' "
      : "";
    String timeFromFilter = hasTimeFilter(fromDate)
      ? " and " + periodExpression + " >= :fromDate "
      : "";
    String timeToFilter = hasTimeFilter(toDate)
      ? " and " + periodExpression + " <= :toDate "
      : "";

    String dataSql =
      "select " + USER_RESOURCE_ALIAS + ".user_id as user_id, " +
      USER_RESOURCE_ALIAS + ".user_email as user_email, " +
      USER_TABLE + ".first_name as first_name, " +
      USER_TABLE + ".last_name as last_name, " +
      USER_DETAILS_TABLE + ".license_type as license_type, " +
      USER_DETAILS_TABLE + ".job_title as job_title, " +
      USER_DETAILS_TABLE + ".company_name as company_name, " +
      USER_RESOURCE_ALIAS + ".resource_id as resource_id, " +
      RESOURCE_DIM_ALIAS + ".resource_path as resource, " +
      USER_RESOURCE_ALIAS + ".usage_count as total_usage, " +
      periodExpression + " as period_key " +
      " from " + usageUserResourceTable + " " + USER_RESOURCE_ALIAS + " " +
      " left join " + userTable + " " + USER_TABLE +
      " on " + USER_TABLE + ".id = " + USER_RESOURCE_ALIAS + ".user_id " +
      " left join " + userDetailsTable + " " + USER_DETAILS_TABLE +
      " on " + USER_DETAILS_TABLE + ".user_id = " + USER_RESOURCE_ALIAS + ".user_id " +
      " join " + usageResourceDimTable + " " + RESOURCE_DIM_ALIAS +
      " on " + RESOURCE_DIM_ALIAS + ".id = " + USER_RESOURCE_ALIAS + ".resource_id " +
      " where 1 = 1 " +
      userFilter +
      publicFilter +
      searchFilter +
      resourceFilter +
      timeFromFilter +
      timeToFilter +
      buildOrderByClause(pageable, getResourceUsageOrderMappings()) +
      buildPaginationClause(pageable);

    String countSql =
      "select count(*) from (" +
      " select " + RESOURCE_DIM_ALIAS + ".resource_path, " +
      periodExpression + " as period_key " +
      " from " + usageUserResourceTable + " " + USER_RESOURCE_ALIAS + " " +
      " left join " + userTable + " " + USER_TABLE +
      " on " + USER_TABLE + ".id = " + USER_RESOURCE_ALIAS + ".user_id " +
      " left join " + userDetailsTable + " " + USER_DETAILS_TABLE +
      " on " + USER_DETAILS_TABLE + ".user_id = " + USER_RESOURCE_ALIAS + ".user_id " +
      " join " + usageResourceDimTable + " " + RESOURCE_DIM_ALIAS +
      " on " + RESOURCE_DIM_ALIAS + ".id = " + USER_RESOURCE_ALIAS + ".resource_id " +
      " where 1 = 1 " +
      userFilter +
      publicFilter +
      searchFilter +
      resourceFilter +
      timeFromFilter +
      timeToFilter +
      ") counts";

    Query dataQuery = entityManager.createNativeQuery(dataSql);
    Query totalQuery = entityManager.createNativeQuery(countSql);
    applyCommonParameters(
      dataQuery,
      totalQuery,
      null,
      userId,
      null,
      searchQuery,
      resourceContainsQuery,
      fromDate,
      toDate
    );

    @SuppressWarnings("unchecked")
    List<Object[]> rows = dataQuery.getResultList();
    List<ResourceUsageAnalysisRow> result = new ArrayList<>();
    for (Object[] row : rows) {
      ResourceUsageAnalysisRow item = new ResourceUsageAnalysisRow();
      item.setUserId(toLongValue(row[0]));
      item.setUserEmail(toStringValue(row[1]));
      item.setUserFirstName(toStringValue(row[2]));
      item.setUserLastName(toStringValue(row[3]));
      item.setLicenseType(toStringValue(row[4]));
      item.setJobTitle(toStringValue(row[5]));
      item.setCompany(toStringValue(row[6]));
      item.setResourceId(toLongValue(row[7]));
      item.setResource(toStringValue(row[8]));
      item.setUsage(toLongValue(row[9]));
      item.setTime(toStringValue(row[10]));
      result.add(item);
    }

    long total = toLongValue(totalQuery.getSingleResult());
    return new PageImpl<>(result, pageable, total);
  }

  @Override
  public Page<ResourceUsageAnalysisRow> findPagedGlobalResourceUsageSummary(
    UsageAnalysisInterval interval,
    boolean publicOnly,
    String searchQuery,
    Long resourceId,
    String fromDate,
    String toDate,
    Pageable pageable
  ) {
    String periodExpression = getPeriodExpression(
      RESOURCE_SUMMARY_ALIAS,
      interval
    );
    String usageResourceSummaryTable = qualifyTable(getResourceSummaryTableName(interval));
    String usageResourceDimTable = qualifyTable(USAGE_RESOURCE_DIM_TABLE);
    String publicFilter = publicOnly
      ? " and " + RESOURCE_DIM_ALIAS + ".is_public = 1 "
      : "";
    String resourceFilter = hasResourceFilter(searchQuery)
      ? " and " + RESOURCE_DIM_ALIAS + ".resource_path like :resourceContainsQuery escape '\\\\' "
      : "";
    String resourceIdFilter = resourceId != null
      ? " and " + RESOURCE_SUMMARY_ALIAS + ".resource_id = :resourceId "
      : "";
    String timeFromFilter = hasTimeFilter(fromDate)
      ? " and " + periodExpression + " >= :fromDate "
      : "";
    String timeToFilter = hasTimeFilter(toDate)
      ? " and " + periodExpression + " <= :toDate "
      : "";

    String dataSql =
      "select " + RESOURCE_SUMMARY_ALIAS + ".resource_id as resource_id, " +
      RESOURCE_DIM_ALIAS + ".resource_path as resource, " +
      RESOURCE_SUMMARY_ALIAS + ".usage_count as total_usage, " +
      periodExpression + " as period_key " +
      " from " + usageResourceSummaryTable + " " + RESOURCE_SUMMARY_ALIAS + " " +
      " join " + usageResourceDimTable + " " + RESOURCE_DIM_ALIAS +
      " on " + RESOURCE_DIM_ALIAS + ".id = " + RESOURCE_SUMMARY_ALIAS + ".resource_id " +
      " where 1 = 1 " +
      publicFilter +
      resourceFilter +
      resourceIdFilter +
      timeFromFilter +
      timeToFilter +
      buildOrderByClause(pageable, getResourceUsageOrderMappings()) +
      buildPaginationClause(pageable);

    String countSql =
      "select count(*) from (" +
      " select " + RESOURCE_DIM_ALIAS + ".resource_path, " +
      periodExpression + " as period_key " +
      " from " + usageResourceSummaryTable + " " + RESOURCE_SUMMARY_ALIAS + " " +
      " join " + usageResourceDimTable + " " + RESOURCE_DIM_ALIAS +
      " on " + RESOURCE_DIM_ALIAS + ".id = " + RESOURCE_SUMMARY_ALIAS + ".resource_id " +
      " where 1 = 1 " +
      publicFilter +
      resourceFilter +
      resourceIdFilter +
      timeFromFilter +
      timeToFilter +
      ") counts";

    Query dataQuery = entityManager.createNativeQuery(dataSql);
    Query totalQuery = entityManager.createNativeQuery(countSql);
    applyCommonParameters(
      dataQuery,
      totalQuery,
      null,
      null,
      resourceId,
      null,
      searchQuery,
      fromDate,
      toDate
    );

    @SuppressWarnings("unchecked")
    List<Object[]> rows = dataQuery.getResultList();
    List<ResourceUsageAnalysisRow> result = new ArrayList<>();
    for (Object[] row : rows) {
      ResourceUsageAnalysisRow item = new ResourceUsageAnalysisRow();
      item.setResourceId(toLongValue(row[0]));
      item.setResource(toStringValue(row[1]));
      item.setUsage(toLongValue(row[2]));
      item.setTime(toStringValue(row[3]));
      result.add(item);
    }

    long total = toLongValue(totalQuery.getSingleResult());
    return new PageImpl<>(result, pageable, total);
  }

  @Override
  public Optional<UsageResourceName> findResourceNameById(Long resourceId) {
    String usageResourceDimTable = qualifyTable(USAGE_RESOURCE_DIM_TABLE);
    String sql =
      "select " + RESOURCE_DIM_ALIAS + ".id as resource_id, " +
      RESOURCE_DIM_ALIAS + ".resource_path as resource " +
      " from " + usageResourceDimTable + " " + RESOURCE_DIM_ALIAS +
      " where " + RESOURCE_DIM_ALIAS + ".id = :resourceId";

    Query query = entityManager.createNativeQuery(sql);
    query.setParameter("resourceId", resourceId);

    @SuppressWarnings("unchecked")
    List<Object[]> rows = query.getResultList();
    if (rows.isEmpty()) {
      return Optional.empty();
    }

    Object[] row = rows.get(0);
    UsageResourceName result = new UsageResourceName();
    result.setResourceId(toLongValue(row[0]));
    result.setResource(toStringValue(row[1]));
    return Optional.of(result);
  }

  private void applyCommonParameters(
    Query dataQuery,
    Query totalQuery,
    Long companyId,
    Long userId,
    Long resourceId,
    String searchQuery,
    String resourceContainsQuery,
    String fromDate,
    String toDate
  ) {
    if (companyId != null) {
      dataQuery.setParameter("companyId", companyId);
      totalQuery.setParameter("companyId", companyId);
    }
    if (userId != null) {
      dataQuery.setParameter("userId", userId);
      totalQuery.setParameter("userId", userId);
    }
    if (resourceId != null) {
      dataQuery.setParameter("resourceId", resourceId);
      totalQuery.setParameter("resourceId", resourceId);
    }
    if (hasSearchFilter(searchQuery)) {
      String searchLikeParameter = toLikeParameter(searchQuery);
      dataQuery.setParameter("searchQuery", searchLikeParameter);
      totalQuery.setParameter("searchQuery", searchLikeParameter);
    }
    if (hasResourceFilter(resourceContainsQuery)) {
      String resourceLikeParameter = toLikeParameter(resourceContainsQuery);
      dataQuery.setParameter("resourceContainsQuery", resourceLikeParameter);
      totalQuery.setParameter("resourceContainsQuery", resourceLikeParameter);
    }
    if (hasTimeFilter(fromDate)) {
      dataQuery.setParameter("fromDate", fromDate.trim());
      totalQuery.setParameter("fromDate", fromDate.trim());
    }
    if (hasTimeFilter(toDate)) {
      dataQuery.setParameter("toDate", toDate.trim());
      totalQuery.setParameter("toDate", toDate.trim());
    }
  }

  private boolean hasSearchFilter(String searchQuery) {
    return StringUtils.isNotBlank(searchQuery);
  }

  private boolean hasResourceFilter(String resourceContainsQuery) {
    return StringUtils.isNotBlank(resourceContainsQuery);
  }

  private boolean hasTimeFilter(String timeValue) {
    return StringUtils.isNotBlank(timeValue);
  }

  private String buildOrderByClause(
    Pageable pageable,
    Map<String, String> allowedOrderMappings
  ) {
    if (pageable == null || pageable.getSort().isUnsorted()) {
      throw new IllegalArgumentException(
        "Paged usage queries require at least one order-by column."
      );
    }

    List<String> orderByParts = new ArrayList<>();
    for (Sort.Order order : pageable.getSort()) {
      String sqlExpression = allowedOrderMappings.get(order.getProperty());
      if (sqlExpression == null) {
        throw new IllegalArgumentException(
          "Unsupported order-by column: " + order.getProperty()
        );
      }
      orderByParts.add(sqlExpression + " " + order.getDirection().name());
    }
    return " order by " + String.join(", ", orderByParts) + " ";
  }

  private String buildPaginationClause(Pageable pageable) {
    if (pageable == null) {
      return "";
    }

    return
      " limit " + pageable.getPageSize() +
      " offset " + pageable.getOffset() + " ";
  }

  private Map<String, String> getUserUsageOrderMappings() {
    Map<String, String> mappings = new LinkedHashMap<>();
    mappings.put("userId", "user_id");
    mappings.put("userEmail", "user_email");
    mappings.put("resource", "resource");
    mappings.put("usage", "total_usage");
    mappings.put("time", "period_key");
    mappings.put("maxUsageProportion", "max_usage_proportion");
    return mappings;
  }

  private Map<String, String> getResourceUsageOrderMappings() {
    Map<String, String> mappings = new LinkedHashMap<>();
    mappings.put("resource", "resource");
    mappings.put("usage", "total_usage");
    mappings.put("time", "period_key");
    return mappings;
  }

  private String getUserSummaryTableName(UsageAnalysisInterval interval) {
    if (interval == UsageAnalysisInterval.DAY) {
      return "usage_user_day_summary";
    }
    if (interval == UsageAnalysisInterval.MONTH) {
      return "usage_user_month_summary";
    }
    return "usage_user_year_summary";
  }

  private String getUserResourceTableName(UsageAnalysisInterval interval) {
    if (interval == UsageAnalysisInterval.DAY) {
      return "usage_user_day_resource";
    }
    if (interval == UsageAnalysisInterval.MONTH) {
      return "usage_user_month_resource";
    }
    return "usage_user_year_resource";
  }

  private String getResourceSummaryTableName(UsageAnalysisInterval interval) {
    if (interval == UsageAnalysisInterval.DAY) {
      return "usage_resource_day_summary";
    }
    if (interval == UsageAnalysisInterval.MONTH) {
      return "usage_resource_month_summary";
    }
    return "usage_resource_year_summary";
  }

  private String getTopResourceAlias(boolean publicOnly) {
    return publicOnly ? TOP_PUBLIC_RESOURCE_ALIAS : TOP_RESOURCE_ALIAS;
  }

  private String getUsageColumn(boolean publicOnly, String tableAlias) {
    return publicOnly
      ? tableAlias + ".total_public_usage"
      : tableAlias + ".total_usage";
  }

  private String getTopResourceIdColumn(boolean publicOnly, String tableAlias) {
    return publicOnly
      ? tableAlias + ".top_public_resource_id"
      : tableAlias + ".top_resource_id";
  }

  private String getProportionExpression(boolean publicOnly, String tableAlias) {
    if (publicOnly) {
      return "round((" + tableAlias + ".top_public_resource_usage * 100.0) / nullif(" +
        tableAlias + ".total_public_usage, 0), 1)";
    }
    return "round((" + tableAlias + ".top_resource_usage * 100.0) / nullif(" +
      tableAlias + ".total_usage, 0), 1)";
  }

  private String getUserSummaryJoins(String usageResourceDimTable) {
    return
      " left join " + usageResourceDimTable + " " + TOP_RESOURCE_ALIAS +
      " on " + TOP_RESOURCE_ALIAS + ".id = " + USER_SUMMARY_ALIAS + ".top_resource_id " +
      " left join " + usageResourceDimTable + " " + TOP_PUBLIC_RESOURCE_ALIAS +
      " on " + TOP_PUBLIC_RESOURCE_ALIAS + ".id = " + USER_SUMMARY_ALIAS + ".top_public_resource_id ";
  }

  private String toLikeParameter(String resourceContainsQuery) {
    String escapedValue = resourceContainsQuery
      .trim()
      .replace("\\", "\\\\")
      .replace("%", "\\%")
      .replace("_", "\\_");
    return "%" + escapedValue + "%";
  }

  private String getPeriodExpression(
    String alias,
    UsageAnalysisInterval interval
  ) {
    if (interval == UsageAnalysisInterval.DAY) {
      return "DATE_FORMAT(" + alias + ".usage_date, '%Y-%m-%d')";
    }
    if (interval == UsageAnalysisInterval.MONTH) {
      return "DATE_FORMAT(" + alias + ".usage_month, '%Y-%m')";
    }
    return "DATE_FORMAT(" + alias + ".usage_year, '%Y')";
  }

  private String qualifyTable(String tableName) {
    return usageSchemaName + "." + tableName;
  }

  private String normalizeSchemaName(String schemaName) {
    if (StringUtils.isBlank(schemaName)) {
      throw new IllegalArgumentException("Usage schema name must not be blank.");
    }
    String normalized = schemaName.trim();
    if (!normalized.matches("[A-Za-z0-9_]+")) {
      throw new IllegalArgumentException(
        "Usage schema name contains unsupported characters: " + normalized
      );
    }
    return normalized;
  }

  private String toStringValue(Object value) {
    return value == null ? null : String.valueOf(value);
  }

  private Long toLongValue(Object value) {
    return value == null ? null : ((Number) value).longValue();
  }

  private Float toFloatValue(Object value) {
    return value == null ? null : ((Number) value).floatValue();
  }
}
