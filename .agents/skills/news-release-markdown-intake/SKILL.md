---
name: news-release-markdown-intake
description: Use ONLY for oncokb-public News release intake. Ask for the release date, find the source markdown file, require the user to add it to the repo if missing, then move/rename it to src/main/webapp/app/pages/newsPage/markdown/NewsContentMMYYYY.md.
---

# News Release Markdown Intake (oncokb-public)

Use this skill only in this repository (`oncokb-public`) when preparing a new
News release markdown file.

## Goal

Place the release markdown file at:

`src/main/webapp/app/pages/newsPage/markdown/NewsContentMMYYYY.md`

where `MMYYYY` is derived from the release date.

## Required workflow

1. Ask the user for the release date.
   - Accept common formats: `MM/DD/YYYY`, `YYYY-MM-DD`, or `Month DD, YYYY`.
2. Normalize date values.
   - Compute `MMYYYY` for filename.
   - Compute `MMDDYYYY` for later wiring steps (if needed).
3. Check whether target file already exists in:
   - `src/main/webapp/app/pages/newsPage/markdown/NewsContentMMYYYY.md`
4. Find the source markdown file in the repo.
   - Search for likely candidates like `*.md` containing release content.
   - Prefer the file the user explicitly mentions.
5. If no source markdown file is found in the repo:
   - Tell the user to add the markdown file to the repo first.
     Let them know you'll put it in the right place and rename it once it's added.
   - Stop and wait.
6. When source file exists, move/rename it to the target path.
   - Final filename must be exactly `NewsContentMMYYYY.md`.
7. Clean up Google Docs export artifacts in the markdown.
   - Remove a leading month/year heading line (e.g. `**August 2026**`) and the
     blank line after it. The title is rendered from the date key by
     `getNewsTitle` in `NewsList.tsx`, so a heading in the markdown duplicates it.
     No other `NewsContentMMYYYY.md` file has one.
   - Fix flattened trademark superscripts: `OncoKBTM` should be `OncoKB™`.
8. Verify and report:
   - Confirm the final file path exists.
   - Confirm the source file is no longer at the old path.

## Guardrails

- Do not manually create or edit generated TSX files.
- Do not manually edit TSX for markdown content changes.
- Keep HTML formatting like `<br/>` in the markdown source when needed for line breaks.
- Do not add a title/heading to the markdown; the News page generates it from the date.
- If target file already exists, do not overwrite silently. Ask the user how to proceed.

## After intake (optional follow-up)

If user asks to continue with full News update, follow project README steps:

Ask the user for the release day and the version number first — both are needed
and neither can be inferred reliably from the markdown.

1. `yarn run buildNewsPages`
   - There is a `.nvmrc` file you can use to set the Node version for this command.
   - Re-run this after any later edit to the markdown.
2. Add release to `DATA_RELEASES` in `constants.tsx`, newest first:
   `{ date: 'MMDDYYYY', version: 'vX.X' }`
3. Add `NewsList` entry in `NewsPage.tsx`, newest first: `<NewsList date={'MMDDYYYY'} />`
4. Add `NEWS_BY_DATE` mapping in `NewsPageContent.tsx`, newest first, plus the
   matching `import NewsContentMMYYYY from './code-generated/NewsContentMMYYYY';`
5. Run `npx tsc --noEmit -p tsconfig.json` to confirm the wiring compiles.
