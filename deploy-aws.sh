#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./deploy-aws.sh <s3-bucket-name> <cloudfront-distribution-id>
#
# Example:
#   ./deploy-aws.sh zachoco.com E123ABC456DEF

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 <s3-bucket-name> <cloudfront-distribution-id>"
  exit 1
fi

BUCKET="$1"
DIST_ID="$2"

echo "Deploying website to s3://$BUCKET ..."

# HTML/entry files: short cache so content updates quickly.
aws s3 sync . "s3://$BUCKET" --delete \
  --exclude ".git/*" \
  --exclude ".DS_Store" \
  --exclude "deploy-aws.sh" \
  --exclude "assets/*" \
  --cache-control "max-age=60,public"

# Static assets: long immutable cache for performance.
aws s3 sync ./assets "s3://$BUCKET/assets" --delete \
  --cache-control "max-age=31536000,public,immutable"

echo "Creating CloudFront invalidation on distribution $DIST_ID ..."
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"

echo "Done."
