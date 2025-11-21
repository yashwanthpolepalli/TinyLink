#!/bin/bash

# TinyLinker Deployment Readiness Check
# This script checks if your app is ready for deployment

echo "🔍 TinyLinker Deployment Readiness Check"
echo "========================================"
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed. Run: npm install"
    exit 1
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    
    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL=" .env && ! grep -q "DATABASE_URL=postgresql://user:password" .env; then
        echo "✅ DATABASE_URL appears to be configured"
    else
        echo "⚠️  DATABASE_URL needs to be updated in .env"
        echo "   Get your connection string from https://neon.tech"
    fi
else
    echo "⚠️  .env file not found (OK for deployment, required for local dev)"
fi

# Check if .gitignore includes .env
if grep -q "^\.env$" .gitignore 2>/dev/null; then
    echo "✅ .env is in .gitignore"
else
    echo "⚠️  .env should be in .gitignore"
fi

# Test build
echo ""
echo "🔨 Testing production build..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Production build successful"
    
    # Check if dist directory exists
    if [ -d "dist" ] && [ -d "dist/public" ]; then
        echo "✅ Build output verified"
    else
        echo "❌ Build output missing"
        exit 1
    fi
else
    echo "❌ Production build failed"
    echo "   Run 'npm run build' to see errors"
    exit 1
fi

# Check git status
echo ""
echo "📦 Git Status:"
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo "✅ Git repository initialized"
    
    # Check if there are uncommitted changes
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "✅ All changes committed"
    else
        echo "⚠️  You have uncommitted changes"
        echo "   Run: git add . && git commit -m 'Ready for deployment'"
    fi
    
    # Check if remote is set
    if git remote -v | grep -q "origin"; then
        echo "✅ Git remote configured"
    else
        echo "⚠️  No git remote set"
        echo "   Create a GitHub repo and run:"
        echo "   git remote add origin https://github.com/YOUR_USERNAME/tinylinker.git"
    fi
else
    echo "⚠️  Not a git repository"
    echo "   Run: git init"
fi

echo ""
echo "========================================"
echo "📋 Deployment Checklist:"
echo ""
echo "1. ✅ Create Neon database at https://neon.tech"
echo "2. ✅ Copy DATABASE_URL connection string"
echo "3. ✅ Push code to GitHub"
echo "4. ✅ Deploy to Railway or Render"
echo "5. ✅ Add DATABASE_URL to environment variables"
echo "6. ✅ Run 'npm run db:push' to initialize database"
echo ""
echo "📖 See QUICK_DEPLOY.md for detailed instructions"
echo ""

