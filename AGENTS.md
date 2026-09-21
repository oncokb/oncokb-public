# API Client Regeneration Playbook

Use this when changing backend request parameters or response schemas that affect generated TypeScript clients.

## Preconditions

- Use Node from `.nvmrc` (`12.16.1`).
- Ensure the expected backend services are running before fetch steps:
  - Main app docs: `http://localhost:9090/v2/api-docs`
  - OncoKB docs: `http://localhost:8080/app/api/v1/v2/api-docs?group=Private%20APIs` and `http://localhost:8080/app/api/private/v2/api-docs`

## Standard Commands

1. Switch Node version:
   - `export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 12.16.1`
2. Refresh and build main API client:
   - `yarn run fetchAPI`
   - `yarn run buildAPI`
3. Refresh and build OncoKB API clients:
   - `yarn run fetchOncoKbAPI`
   - `yarn run buildOncoKbAPI`

## If fetch fails

- If `curl` cannot connect, start the required backend(s) and rerun fetch.
- Do not leave `*-docs.json` files empty; restore them from git if a failed fetch truncated them.

## Java Test Execution

- For Java code and Java test execution in this repository, always use Java 8.
- Before running Maven commands, set Java 8 explicitly:
  - `export JAVA_HOME="$(/usr/libexec/java_home -v 1.8)" && export PATH="$JAVA_HOME/bin:$PATH"`

### Preferred command for targeted Java tests (low-noise)

- Use this command format to reduce Maven/frontend/log noise during backend test runs:
  - `./mvnw -ntp -q -P'!webpack' -Dspring.profiles.active=test -Djacoco.skip=true -Dlogging.level.root=WARN -Dlogging.level.io.netty=ERROR -Dlogging.level.io.lettuce=ERROR -Dlogging.level.reactor=ERROR -Dtest=<TestClassOrMethodPattern> test`

### Notes

- `-P'!webpack'` disables the default webpack profile so Java tests do not trigger frontend build steps.
- Keep this low-noise command for local, targeted test validation.
