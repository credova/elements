#!/bin/bash
set -e

current_directory="$PWD"

cd $(dirname $0)/..

bun install

cd js-sdk

rm -rf node_modules
bun install
bun run build

cd ../react-sdk

rm -rf node_modules
bun install
bun run link:js-sdk
bun run build

cd ../example-app

echo "Building project..."

rm -rf node_modules
bun install
bun run link:js-sdk
bun run link:react-sdk
bun run build

result=$?

cd "$current_directory"

exit $result