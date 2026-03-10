#!/bin/sh
set -e

echo "⏳ Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U postgres -q; do
  echo "  DB not ready yet, retrying in 2s..."
  sleep 2
done
echo "✅ Database is ready!"

echo "🔧 Generating Prisma Client..."
node ../../node_modules/prisma/build/index.js generate

echo "🔄 Running migrations..."
node ../../node_modules/prisma/build/index.js migrate deploy

echo "🌱 Running seed..."
node ../../node_modules/ts-node/dist/bin.js prisma/seed.ts

echo "🚀 Starting application..."
exec node ../../node_modules/@nestjs/cli/bin/nest.js start --watch
