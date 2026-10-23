#!/bin/bash
set -e

script_directory="$PWD"

# get bundle source
cd "$(dirname "$0")"/../js-sdk
dist_directory="$PWD"/dist

# back to script directory
cd "$script_directory"

JS_HOST="js.publicsquare.com"
MAJOR_VERSION=$(node -p -e "require('./package.json').version")
BUNDLE_PATH=$dist_directory/publicsquare-js.bundle.js
BLOB_DIR=v$MAJOR_VERSION
INDEX_JS_NAME=$BLOB_DIR/index.js
VERSIONED_JS_NAME=$(cat package.json | jq -r '.version')

JS_BUCKET_NAME="psqpayments-prd-web-elements-js"

# Upload Content
if [[ ! $VERSIONED_JS_NAME =~ "beta" ]]; then
  echo "Uploading new default version to $JS_BUCKET_NAME/$INDEX_JS_NAME"
  gsutil cp "$BUNDLE_PATH" gs://"${JS_BUCKET_NAME}"/index.js
elif [[ $VERSIONED_JS_NAME =~ "beta" ]]; then
  echo "Uploading new beta version to $JS_BUCKET_NAME/beta/index.js"
  gsutil cp "$BUNDLE_PATH" gs://"${JS_BUCKET_NAME}"/beta/index.js
fi
echo "Uploading bundle to $JS_HOST/$INDEX_JS_NAME"
gsutil cp "$BUNDLE_PATH" gs://"${JS_BUCKET_NAME}"/"${INDEX_JS_NAME}"

result=$?

cd "$script_directory"

exit $result