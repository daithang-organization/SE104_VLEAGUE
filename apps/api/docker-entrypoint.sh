#!/bin/sh
set -e

echo "🔧 Generating Prisma Client..."
node ../../node_modules/prisma/build/index.js generate

echo "🔄 Running migrations..."
node ../../node_modules/prisma/build/index.js migrate deploy

echo "🌱 Running seed..."
node ../../node_modules/ts-node/dist/bin.js prisma/seed.ts

echo "🚀 Starting application..."
exec node ../../node_modules/@nestjs/cli/bin/nest.js start --watch
