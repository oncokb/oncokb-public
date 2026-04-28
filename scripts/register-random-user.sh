#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:9000}"
PASSWORD="test"

usage() {
  cat <<'EOF'
Usage: scripts/register-random-user.sh <LICENSE_TYPE>

Valid license types:
  ACADEMIC
  COMMERCIAL
  RESEARCH_IN_COMMERCIAL
  HOSPITAL
EOF
}

if [[ $# -ne 1 ]]; then
  usage >&2
  exit 1
fi

LICENSE_TYPE="$1"

case "$LICENSE_TYPE" in
  ACADEMIC|COMMERCIAL|RESEARCH_IN_COMMERCIAL|HOSPITAL)
    ;;
  *)
    echo "Invalid license type: $LICENSE_TYPE" >&2
    usage >&2
    exit 1
    ;;
esac

random_suffix() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 4
  else
    date +%s%N | tail -c 9
  fi
}

SUFFIX="$(random_suffix)"
EMAIL="test-user-${SUFFIX}@example.org"
LOGIN="$EMAIL"
FIRST_NAME="Test${SUFFIX}"
LAST_NAME="User${SUFFIX}"

PAYLOAD="$(cat <<EOF
{
  "login": "$LOGIN",
  "password": "$PASSWORD",
  "firstName": "$FIRST_NAME",
  "lastName": "$LAST_NAME",
  "email": "$EMAIL",
  "licenseType": "$LICENSE_TYPE",
  "companyName": "Test Org",
  "city": "NY",
  "country": "US",
  "langKey": "en"
}
EOF
)"

TMP_BODY="$(mktemp)"
HTTP_STATUS="$(
  curl -sS -o "$TMP_BODY" -w '%{http_code}' \
    -X POST "${BASE_URL}/api/register" \
    -H 'Content-Type: application/json' \
    -H 'g-recaptcha-response: faketoken' \
    --data "$PAYLOAD"
)"

if [[ "$HTTP_STATUS" != "201" ]]; then
  echo "Registration failed with HTTP $HTTP_STATUS" >&2
  cat "$TMP_BODY" >&2
  rm -f "$TMP_BODY"
  exit 1
fi

rm -f "$TMP_BODY"

echo "Registration successful."
echo "email: $EMAIL"
echo "password: $PASSWORD"
echo "Go to http://localhost:8082"
echo "If that port isn't working, run: docker compose -f src/main/docker/smtp-server.yml up"
