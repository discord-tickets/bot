#!/bin/sh

echo "Checking environment..."
node scripts/preinstall

echo "Preparing the database..."
node scripts/postinstall

echo "Starting..."
node src/