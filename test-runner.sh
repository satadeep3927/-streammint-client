#!/bin/bash

echo "Running tests with verbose output..."
cd /home/bit11007/Documents/Projects/streammint/client

echo "Type checking..."
npx tsc --noEmit

echo "Running crypto service tests..."
npx vitest run src/services/crypto.service.test.ts --reporter=verbose

echo "Running pulse service tests..."
npx vitest run src/services/pulse.service.test.ts --reporter=verbose

echo "Running utils tests..."
npx vitest run src/lib/utils.test.ts --reporter=verbose

echo "Running all tests..."
npx vitest run --reporter=verbose
