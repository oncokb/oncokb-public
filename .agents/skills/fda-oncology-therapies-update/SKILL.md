---
name: fda-oncology-therapies-update
description: Use ONLY for oncokb-public FDA-approved oncology therapies updates. Ask for the oncokb-pipeline repo location and for the path to the new curator xlsx, point python/.env at that file, ask for the "Content current as of" date, run create-oncology-therapies-json.py, strip all highlighting from the xlsx, publish both files to src/main/webapp/content/files/oncologyTherapies/, and update the date in oncologyTherapiesPage.tsx.
---

# FDA-Approved Oncology Therapies Update (oncokb-public)

Run this skill from **this repository (`oncokb-public`)**. The conversion script
still lives in the `oncokb-pipeline` repo, but the work and the resulting commit
belong here.

## Goal

Publish a new curator spreadsheet as both files, with these exact names:

- `src/main/webapp/content/files/oncologyTherapies/fda_approved_oncology_therapies.xlsx`
- `src/main/webapp/content/files/oncologyTherapies/fda_approved_oncology_therapies.json`

and update the "Content current as of" date rendered by
`src/main/webapp/app/pages/oncologyTherapiesPage/oncologyTherapiesPage.tsx`.

## Required workflow

### 1. Ask the user where their `oncokb-pipeline` repo is

Always ask — do not guess or hardcode a path. Expect something like
`/Users/<user>/MSK/oncokb/oncokb-pipeline`. Verify that
`<pipeline>/python/create-oncology-therapies-json.py` exists before continuing.

### 2. Ask the user where the new curator xlsx is

Always ask — do not guess, and do not assume it is already in the pipeline repo.
Accept an absolute path anywhere on disk (`~/Downloads/...` is common, since the
file usually arrives by email or Slack). Expand `~` and quote the path; curator
filenames often contain spaces.

Curator files are named like `fda_approved_oncology_therapies_MMDDYY_XX.xlsx`
(e.g. `fda_approved_oncology_therapies_082526_KC.xlsx`, where `XX` are the
curator's initials), but do not rely on the name — use whatever path the user
gives you.

Before continuing, verify the file:

- It exists and opens as a workbook.
- It has a sheet named exactly `FDA-Approved Oncology Therapies`.

If the user points at a directory, or the path does not exist, ask again rather
than searching around for a likely candidate.

If the user prefers to keep working files in the pipeline repo, copy the xlsx to
`<pipeline>/python/` first and use that path from here on. Nothing later in this
skill requires it to live there.

### 3. Ask the user for the "Content current as of" date

The page shows a `Content current as of M/D/YYYY` link above the table. Ask the
user what that date should be for this release — it is the date the FDA approval
list was reviewed through, which is **not** the same as the date in the curator
filename and cannot be inferred from the spreadsheet. Accept common formats and
normalize to `M/D/YYYY` with no leading zeros (e.g. `5/28/2026`, not
`05/28/2026`).

Ask this now, alongside the other two questions, so the whole run is unattended
from here on.

### 4. Update `<pipeline>/python/.env`

Both variables are absolute paths. The xlsx path is whatever the user gave in
step 2; the JSON path stays inside the pipeline repo as a scratch output:

```
FDA_APPROVED_ONCOLOGY_THERAPIES_XLSX_PATH="<absolute path the user gave in step 2>"
FDA_APPROVED_ONCOLOGY_THERAPIES_JSON_PATH="<pipeline>/python/fda_approved_oncology_therapies.json"
```

Write `.env` inside `python/`, not at the pipeline repo root.

### 5. Generate the JSON

```sh
cd <pipeline>/python
source .venv/bin/activate   # if the venv exists
python3 create-oncology-therapies-json.py
```

Sanity-check the output before publishing:

- Keys are exactly `year, tx, biomarker, agentClass, drugTarget, targetedTx, pxTx, ngsTest`
  (the script renames the spreadsheet headers; a header change upstream silently
  leaves the raw column name in the JSON — treat that as a failure, not a warning).
- No records with an empty `tx`.
- Row count is >= the currently published JSON. A drop means the wrong sheet or a
  truncated file.

The script reads the sheet named `FDA-Approved Oncology Therapies`. The second
sheet, `Footnotes`, is not converted.

### 6. Strip all highlighting from the xlsx

The published spreadsheet must carry **no** curator markup. Check for both:

- **Cell fills** — background highlighting.
- **Red font (`FFFF0000`)** — how curators mark new/changed rows. This is the
  usual offender; cell fills are typically already absent.

Red text lives in two places inside the xlsx zip, and both must be patched:

- `xl/styles.xml` — the `<fonts>` table.
- `xl/sharedStrings.xml` — `<rPr>` runs inside rich-text cells.

Patch a **copy**, leaving the curator's original file untouched:

```sh
cp "<curator xlsx>" /tmp/out.xlsx
cd /tmp && unzip -o -q out.xlsx xl/styles.xml xl/sharedStrings.xml
python3 - <<'PY'
for p in ('xl/styles.xml', 'xl/sharedStrings.xml'):
    s = open(p, encoding='utf-8').read()
    s = s.replace('<color rgb="FFFF0000"/>', '<color theme="1"/>')
    assert 'FFFF0000' not in s, p
    open(p, 'w', encoding='utf-8').write(s)
PY
zip -q out.xlsx xl/styles.xml xl/sharedStrings.xml
```

Editing the zip entries in place preserves the rest of the workbook byte-for-byte.
Do **not** round-trip the workbook through `openpyxl.save()` — that rewrites
formatting and merged cells.

Then verify zero highlighting remains:

```sh
python3 -c "
import openpyxl
wb = openpyxl.load_workbook('/tmp/out.xlsx')
for sn in wb.sheetnames:
    ws = wb[sn]
    red = [c.coordinate for r in ws.iter_rows() for c in r
           if c.font and c.font.color and c.font.color.rgb == 'FFFF0000']
    fills = [c.coordinate for r in ws.iter_rows() for c in r
             if c.fill and c.fill.fill_type not in (None, 'none')]
    print(sn, 'red:', len(red), 'fills:', len(fills))
"
```

Both counts must be `0` on every sheet.

### 7. Confirm cleaning did not change the data

Re-run the conversion against the cleaned copy and diff it against the JSON from
step 5. The two files must be identical. If they differ, the patch damaged the
workbook — start over from the curator's original.

### 8. Publish into this repo

```sh
cp /tmp/out.xlsx  src/main/webapp/content/files/oncologyTherapies/fda_approved_oncology_therapies.xlsx
cp <pipeline>/python/fda_approved_oncology_therapies.json \
                  src/main/webapp/content/files/oncologyTherapies/fda_approved_oncology_therapies.json
```

Both destination filenames are fixed — the dated, initialed curator name is
dropped here, and the files overwrite the previous release.

### 9. Update the "Content current as of" date on the page

Edit `src/main/webapp/app/pages/oncologyTherapiesPage/oncologyTherapiesPage.tsx`
and replace the date in the `Linkout` near the top of the page body:

```tsx
<Linkout
  link={
    'https://www.fda.gov/drugs/resources-information-approved-drugs/oncology-cancer-hematologic-malignancies-approval-notifications'
  }
>
  Content current as of 5/28/2026
</Linkout>
```

Change only the date text to the value from step 3 — leave the `Linkout` and its
FDA URL alone. This is the only hardcoded date on the page; the table itself is
rendered from the JSON imported at the top of the same file.

Then confirm the wiring still compiles:

```sh
npx tsc --noEmit -p tsconfig.json
```

### 10. Report

Show `git status` / `git diff --stat` for
`src/main/webapp/content/files/oncologyTherapies/` and
`oncologyTherapiesPage.tsx`, plus the old and new record counts and the new
"Content current as of" date.

## Guardrails

- Never modify the curator's original xlsx, wherever it lives. Patch a copy.
- Never commit the dated curator filename into `oncokb-public`.
- Do not commit or push unless the user asks.
- The pipeline repo's `python/.env` is local config — updating it is expected, but
  do not commit it there.
- Do not hand-edit the generated JSON. Fix the spreadsheet and re-run the script.
- Do not change the "Content current as of" date to today's date by default. It is
  a curation fact — always use the date the user gives you.
