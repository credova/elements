#!/bin/bash
set -e

current_directory="$PWD"

cd $(dirname $0)/..

echo "Building project..."

bun install
bunx playwright test

result=$?

cd "$current_directory"

exit $result