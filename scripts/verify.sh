#!/bin/bash
set -e

current_directory="$PWD"

cd "$(dirname "$0")"

time {
    ./build.sh
    ./acceptance-test.sh
}

cd "$current_directory"