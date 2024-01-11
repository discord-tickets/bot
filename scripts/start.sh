#!/usr/bin/env bash

source="${BASH_SOURCE}"
base_dir=$(dirname $(dirname "$source"))

echo "Checking environment..."
script=scripts/preinstall
node "$base_dir/$script"

echo "Preparing the database..."
script=scripts/postinstall
node "$base_dir/$script"

echo "Starting..."
script=src/
node "$base_dir/$script"
