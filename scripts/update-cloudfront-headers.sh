#!/usr/bin/env bash
set -euo pipefail

DIST_ID="${CLOUDFRONT_DISTRIBUTION_ID:?CLOUDFRONT_DISTRIBUTION_ID is required}"
POLICY_FILE="${1:-cloudfront-security-policy.json}"
POLICY_NAME="zachoco-security-headers-v3"

if [[ ! -f "$POLICY_FILE" ]]; then
  echo "Policy file not found: $POLICY_FILE" >&2
  exit 1
fi

echo "Looking for response headers policy: ${POLICY_NAME}"
POLICY_ID="$(
  aws cloudfront list-response-headers-policies --type custom \
    --query "ResponseHeadersPolicyList.Items[?ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name=='${POLICY_NAME}'].ResponseHeadersPolicy.Id | [0]" \
    --output text
)"

if [[ -z "$POLICY_ID" || "$POLICY_ID" == "None" ]]; then
  echo "Creating response headers policy..."
  POLICY_ID="$(
    aws cloudfront create-response-headers-policy \
      --response-headers-policy-config "file://${POLICY_FILE}" \
      --query "ResponseHeadersPolicy.Id" \
      --output text
  )
else
  echo "Updating existing policy: ${POLICY_ID}"
  ETAG="$(
    aws cloudfront get-response-headers-policy --id "$POLICY_ID" \
      --query "ETag" \
      --output text
  )"
  aws cloudfront update-response-headers-policy \
    --id "$POLICY_ID" \
    --if-match "$ETAG" \
    --response-headers-policy-config "file://${POLICY_FILE}"
fi

echo "Attaching policy ${POLICY_ID} to distribution ${DIST_ID}"
TMP="$(mktemp)"
aws cloudfront get-distribution-config --id "$DIST_ID" >"${TMP}.json"
ETAG="$(jq -r '.ETag' "${TMP}.json")"
jq --arg policy_id "$POLICY_ID" \
  '.DistributionConfig.DefaultCacheBehavior.ResponseHeadersPolicyId = $policy_id | .DistributionConfig' \
  "${TMP}.json" >"${TMP}-config.json"

aws cloudfront update-distribution \
  --id "$DIST_ID" \
  --if-match "$ETAG" \
  --distribution-config "file://${TMP}-config.json"

echo "CloudFront security headers policy applied."
