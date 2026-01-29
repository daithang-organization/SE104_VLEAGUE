#!/bin/bash
set -e

echo "🚀 Setting up VLeague Development Environment..."

# 1. Enable corepack
echo "📦 Enabling corepack..."
corepack enable

# 2. Install dependencies
echo "📥 Installing dependencies..."
pnpm install

# 3. Setup environment files
echo "🔧 Setting up environment files..."

# API env
if [ ! -f "apps/api/.env" ]; then
  if [ -f "apps/api/.env.example" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ Created apps/api/.env from .env.example"
  else
    echo "⚠️  apps/api/.env.example not found, creating basic .env"
    cat > apps/api/.env << EOL
DATABASE_URL="postgresql://vleague:vleague123@localhost:5432/vleague_db?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
EOL
  fi
else
  echo "ℹ️  apps/api/.env already exists, skipping..."
fi

# Web env
if [ ! -f "apps/web/.env" ]; then
  if [ -f "apps/web/.env.example" ]; then
    cp apps/web/.env.example apps/web/.env
    echo "✅ Created apps/web/.env from .env.example"
  else
    echo "⚠️  apps/web/.env.example not found, creating basic .env"
    cat > apps/web/.env << EOL
VITE_API_BASE_URL=http://localhost:8080
EOL
  fi
else
  echo "ℹ️  apps/web/.env already exists, skipping..."
fi

# 4. Start database
echo "🗄️  Starting PostgreSQL database..."
docker compose -f infra/docker-compose.db.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# 5. Run migrations
echo "🔄 Running database migrations..."
cd apps/api
pnpm prisma migrate deploy

# 6. Seed database
echo "🌱 Seeding database..."
pnpm prisma db seed

cd ../..

echo ""
echo "✨ Setup complete! You can now run:"
echo "   pnpm dev"
echo ""
echo "📍 Services will be available at:"
echo "   🌐 Web:      http://localhost:5173"
echo "   🔌 API:      http://localhost:8080"
echo "   🗄️  Database: localhost:5432"
echo ""
