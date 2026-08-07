#!/bin/bash
set -e

current_directory="$PWD"

cd $(dirname $0)/..

bun install
bunx prettier --write "tests/**/*.{ts,tsx}"

cd js-sdk
bun install
bunx prettier --write "src/**/*.{ts,tsx}"

cd ../react-sdk
bun install
bunx prettier --write "src/**/*.{ts,tsx}"

cd ../example-app
bun install
bunx prettier --write "src/**/*.{ts,tsx}"

result=$?

cd "$current_directory"

exit $result