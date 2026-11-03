#!/bin/bash
set -e

current_directory="$PWD"

cd "$(dirname "$0")"

time {
    mise run build
    ./acceptance-test.sh
}

cd "$current_directory"