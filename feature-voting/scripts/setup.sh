#!/bin/bash

echo "🚀 Feature Voting Tool - Setup Script"
echo "======================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo ""
    echo "Please create a .env.local file with your Vercel Postgres credentials:"
    echo ""
    echo "POSTGRES_URL=\"postgres://...\""
    echo "POSTGRES_PRISMA_URL=\"postgres://...\""
    echo "POSTGRES_URL_NO_SSL=\"postgres://...\""
    echo "POSTGRES_URL_NON_POOLING=\"postgres://...\""
    echo "POSTGRES_USER=\"default\""
    echo "POSTGRES_HOST=\"xxxxx.postgres.vercel-storage.com\""
    echo "POSTGRES_PASSWORD=\"xxxxx\""
    echo "POSTGRES_DATABASE=\"verceldb\""
    echo ""
    echo "See .env.local.example for reference."
    exit 1
fi

echo "✅ Environment variables found"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Build the project
echo "🔨 Building project..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Initialize the database: curl -X POST http://localhost:3000/api/init-db"
echo "3. Run tests: npm test"
echo ""



