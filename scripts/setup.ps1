# VLeague Development Environment Setup Script for Windows
# Run with: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Setting up VLeague Development Environment..." -ForegroundColor Cyan

# 1. Enable corepack
Write-Host "`n📦 Enabling corepack..." -ForegroundColor Yellow
corepack enable

# 2. Install dependencies
Write-Host "`n📥 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# 3. Setup environment files
Write-Host "`n🔧 Setting up environment files..." -ForegroundColor Yellow

# API env
if (-not (Test-Path "apps\api\.env")) {
    if (Test-Path "apps\api\.env.example") {
        Copy-Item "apps\api\.env.example" "apps\api\.env"
        Write-Host "✅ Created apps\api\.env from .env.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  apps\api\.env.example not found, creating basic .env" -ForegroundColor Yellow
        @"
DATABASE_URL="postgresql://vleague:vleague123@localhost:5432/vleague_db?schema=public"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
"@ | Out-File -FilePath "apps\api\.env" -Encoding UTF8
    }
} else {
    Write-Host "ℹ️  apps\api\.env already exists, skipping..." -ForegroundColor Gray
}

# Web env
if (-not (Test-Path "apps\web\.env")) {
    if (Test-Path "apps\web\.env.example") {
        Copy-Item "apps\web\.env.example" "apps\web\.env"
        Write-Host "✅ Created apps\web\.env from .env.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  apps\web\.env.example not found, creating basic .env" -ForegroundColor Yellow
        @"
VITE_API_BASE_URL=http://localhost:8080
"@ | Out-File -FilePath "apps\web\.env" -Encoding UTF8
    }
} else {
    Write-Host "ℹ️  apps\web\.env already exists, skipping..." -ForegroundColor Gray
}

# 4. Start database
Write-Host "`n🗄️  Starting PostgreSQL database..." -ForegroundColor Yellow
docker compose -f infra\docker-compose.db.yml up -d

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 5. Run migrations
Write-Host "`n🔄 Running database migrations..." -ForegroundColor Yellow
Push-Location apps\api
pnpm prisma migrate deploy

# 6. Seed database
Write-Host "`n🌱 Seeding database..." -ForegroundColor Yellow
pnpm prisma db seed
pnpm exec tsx prisma/setup-vleague-2024.ts
pnpm exec tsx prisma/setup-vleague-2025.ts
pnpm exec tsx prisma/seed-invitation-rule-cases.ts
pnpm exec tsx prisma/seed-report-demo.ts
pnpm exec tsx prisma/seed-promotion-candidates.ts

Pop-Location

Write-Host "`n✨ Setup complete! You can now run:" -ForegroundColor Green
Write-Host "   pnpm dev" -ForegroundColor White
Write-Host "`n📍 Services will be available at:" -ForegroundColor Cyan
Write-Host "   🌐 Web:      http://localhost:5173" -ForegroundColor White
Write-Host "   🔌 API:      http://localhost:8080" -ForegroundColor White
Write-Host "   🗄️  Database: localhost:5432" -ForegroundColor White
Write-Host ""
