#!/usr/bin/env bash

set -euo pipefail

MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_DATABASE="${MYSQL_DATABASE:-oncokb_public}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-rootroot}"
TOKEN_VALID_DAYS="${TOKEN_VALID_DAYS:-3650}"
TOKEN_NAME="${TOKEN_NAME:-Local dev bootstrap token}"

# Reuse the seeded "user" hash so these accounts exist for local auth records.
# The intended login flow for these fixtures is Keycloak plus the generated bearer token.
PASSWORD_HASH="${PASSWORD_HASH:-\$2a\$10\$VEjxo0jq2YG9Rbk2HmX9S.k1uZBGYUHdUcid3g/vfiEl7lwWgOH/K}"

usage() {
  cat <<'EOF'
Usage: scripts/bootstrap-local-test-users.sh

Seeds two local development users and one long-lived bearer token for each:
  - dev@mskcc.org
  - test@myorg.org

Optional environment variables:
  MYSQL_HOST
  MYSQL_PORT
  MYSQL_DATABASE
  MYSQL_USER
  MYSQL_PASSWORD
  TOKEN_VALID_DAYS   Defaults to 3650 (10 years)
  TOKEN_NAME         Defaults to "Local dev bootstrap token"
  PASSWORD_HASH      Defaults to the existing seeded local user hash
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if ! command -v mysql >/dev/null 2>&1; then
  echo "mysql client is required to run this script." >&2
  exit 1
fi

if ! [[ "$TOKEN_VALID_DAYS" =~ ^[0-9]+$ ]] || [[ "$TOKEN_VALID_DAYS" -le 0 ]]; then
  echo "TOKEN_VALID_DAYS must be a positive integer." >&2
  exit 1
fi

MYSQL_PWD="$MYSQL_PASSWORD" mysql \
  --host="$MYSQL_HOST" \
  --port="$MYSQL_PORT" \
  --user="$MYSQL_USER" \
  --database="$MYSQL_DATABASE" \
  --batch \
  --raw <<EOF
SET @token_valid_days := ${TOKEN_VALID_DAYS};
SET @token_name := '${TOKEN_NAME}';
SET @password_hash := '${PASSWORD_HASH}';
SET @created_by := 'bootstrap-local-test-users';

SET @dev_msk_email := 'dev@mskcc.org';
SET @test_myorg_email := 'test@myorg.org';

INSERT INTO jhi_user (
  login,
  password_hash,
  first_name,
  last_name,
  email,
  activated,
  lang_key,
  activation_key,
  reset_key,
  reset_date,
  created_by,
  created_date,
  last_modified_by,
  last_modified_date
)
VALUES
  (
    @dev_msk_email,
    @password_hash,
    'Dev',
    'MSKCC',
    @dev_msk_email,
    TRUE,
    'en',
    NULL,
    NULL,
    NULL,
    @created_by,
    UTC_TIMESTAMP(6),
    @created_by,
    UTC_TIMESTAMP(6)
  ),
  (
    @test_myorg_email,
    @password_hash,
    'Test',
    'MyOrg',
    @test_myorg_email,
    TRUE,
    'en',
    NULL,
    NULL,
    NULL,
    @created_by,
    UTC_TIMESTAMP(6),
    @created_by,
    UTC_TIMESTAMP(6)
  )
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name),
  email = VALUES(email),
  activated = VALUES(activated),
  lang_key = VALUES(lang_key),
  activation_key = VALUES(activation_key),
  reset_key = VALUES(reset_key),
  reset_date = VALUES(reset_date),
  last_modified_by = VALUES(last_modified_by),
  last_modified_date = VALUES(last_modified_date);

SET @dev_msk_user_id := (SELECT id FROM jhi_user WHERE login = @dev_msk_email LIMIT 1);
SET @test_myorg_user_id := (SELECT id FROM jhi_user WHERE login = @test_myorg_email LIMIT 1);

INSERT INTO jhi_user_authority (user_id, authority_name)
VALUES
  (@dev_msk_user_id, 'ROLE_USER'),
  (@test_myorg_user_id, 'ROLE_USER')
ON DUPLICATE KEY UPDATE authority_name = VALUES(authority_name);

INSERT INTO user_details (
  user_id,
  license_type,
  company_name,
  city,
  country,
  account_request_status
)
VALUES
  (
    @dev_msk_user_id,
    'HOSPITAL',
    'MSKCC',
    'New York',
    'US',
    'APPROVED'
  ),
  (
    @test_myorg_user_id,
    'COMMERCIAL',
    'MyOrg',
    'New York',
    'US',
    'APPROVED'
  )
ON DUPLICATE KEY UPDATE
  license_type = VALUES(license_type),
  company_name = VALUES(company_name),
  city = VALUES(city),
  country = VALUES(country),
  account_request_status = VALUES(account_request_status);

SET @target_expiration := DATE_ADD(UTC_TIMESTAMP(6), INTERVAL @token_valid_days DAY);

SET @dev_msk_token_id := NULL;
SET @test_myorg_token_id := NULL;

SELECT id INTO @dev_msk_token_id
FROM token
WHERE user_id = @dev_msk_user_id AND name = @token_name
ORDER BY id DESC
LIMIT 1;

SELECT id INTO @test_myorg_token_id
FROM token
WHERE user_id = @test_myorg_user_id AND name = @token_name
ORDER BY id DESC
LIMIT 1;

UPDATE token
SET expiration = @target_expiration,
    renewable = TRUE,
    current_usage = 0,
    usage_limit = NULL,
    name = @token_name
WHERE id IN (@dev_msk_token_id, @test_myorg_token_id);

INSERT INTO token (
  token,
  creation,
  expiration,
  usage_limit,
  current_usage,
  renewable,
  name,
  user_id
)
SELECT UUID(), UTC_TIMESTAMP(6), @target_expiration, NULL, 0, TRUE, @token_name, @dev_msk_user_id
WHERE @dev_msk_token_id IS NULL;

INSERT INTO token (
  token,
  creation,
  expiration,
  usage_limit,
  current_usage,
  renewable,
  name,
  user_id
)
SELECT UUID(), UTC_TIMESTAMP(6), @target_expiration, NULL, 0, TRUE, @token_name, @test_myorg_user_id
WHERE @test_myorg_token_id IS NULL;

SELECT
  u.email,
  t.token,
  t.expiration,
  t.renewable,
  t.name
FROM jhi_user u
JOIN token t ON t.user_id = u.id
WHERE u.email IN (@dev_msk_email, @test_myorg_email)
  AND t.name = @token_name
ORDER BY u.email;
EOF
