#!/bin/bash

# Setup Production LNBits - Interactive Script
echo "🚀 Sats Jar - Production LNBits Setup"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: Please run this script from the Sats_Jar root directory"
    echo "💡 Current directory should contain backend/.env file"
    exit 1
fi

echo "📋 This script will help you:"
echo "1. Deploy LNBits to Render.com"
echo "2. Configure your production environment"
echo "3. Test your setup"
echo ""

read -p "Continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "🔧 Step 1: Deploy LNBits to Render.com"
echo "======================================="
echo ""
echo "Please follow these steps manually:"
echo ""
echo "1. Go to https://github.com/lnbits/lnbits"
echo "2. Click 'Fork' to create your own copy"
echo "3. Go to https://render.com and sign up/login"
echo "4. Click 'New +' → 'Web Service'"
echo "5. Connect your GitHub and select your forked lnbits repo"
echo ""
echo "Build Settings:"
echo "  Name: your-lnbits-app (choose unique name)"
echo "  Runtime: Python 3"
echo "  Build Command: pip install -r requirements.txt"
echo "  Start Command: python -m uvicorn lnbits.app:app --host 0.0.0.0 --port \$PORT"
echo ""
echo "Environment Variables (click Advanced):"
echo "  LNBITS_BACKEND_WALLET_CLASS=VoidWallet"
echo "  LNBITS_DATA_FOLDER=./data"
echo "  LNBITS_DATABASE_URL=sqlite:///data/database.sqlite3"
echo "  HOST=0.0.0.0"
echo "  PORT=10000"
echo "  DEBUG=false"
echo ""

read -p "Have you completed the Render.com deployment? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the deployment first, then run this script again."
    exit 0
fi

echo ""
echo "🔑 Step 2: Configure Your Environment"
echo "===================================="
echo ""

# Get LNBits URL
echo "Enter your LNBits details:"
read -p "LNBits URL (e.g., https://your-app.onrender.com): " LNBITS_URL
if [ -z "$LNBITS_URL" ]; then
    echo "❌ LNBits URL is required"
    exit 1
fi

# Add /api/v1 if not present
if [[ ! $LNBITS_URL == */api/v1 ]]; then
    LNBITS_API_URL="${LNBITS_URL}/api/v1"
else
    LNBITS_API_URL="$LNBITS_URL"
fi

echo ""
echo "Now go to your LNBits instance: $LNBITS_URL"
echo "1. Create a new wallet called 'Sats Jar Main Wallet'"
echo "2. Copy the Admin Key, Invoice Key, and Wallet ID"
echo ""

read -p "Admin Key: " ADMIN_KEY
read -p "Invoice Key: " INVOICE_KEY  
read -p "Wallet ID: " WALLET_ID

if [ -z "$ADMIN_KEY" ] || [ -z "$INVOICE_KEY" ] || [ -z "$WALLET_ID" ]; then
    echo "❌ All keys are required"
    exit 1
fi

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "$(date +%s)_$(whoami)_secret_$(shuf -i 1000-9999 -n 1)")

echo ""
echo "🔧 Step 3: Update Configuration"
echo "==============================="

# Backup current .env
cp backend/.env backend/.env.backup.$(date +%s)
echo "✅ Backed up current .env file"

# Update .env file
sed -i.bak "s|LNBITS_BASE_URL=.*|LNBITS_BASE_URL=$LNBITS_API_URL|" backend/.env
sed -i.bak "s|LNBITS_ADMIN_KEY=.*|LNBITS_ADMIN_KEY=$ADMIN_KEY|" backend/.env
sed -i.bak "s|LNBITS_INVOICE_KEY=.*|LNBITS_INVOICE_KEY=$INVOICE_KEY|" backend/.env
sed -i.bak "s|LNBITS_WALLET_ID=.*|LNBITS_WALLET_ID=$WALLET_ID|" backend/.env
sed -i.bak "s|LNBITS_WEBHOOK_SECRET=.*|LNBITS_WEBHOOK_SECRET=$WEBHOOK_SECRET|" backend/.env
sed -i.bak "s|LNBITS_ENVIRONMENT=.*|LNBITS_ENVIRONMENT=production|" backend/.env

echo "✅ Updated .env configuration"

echo ""
echo "🧪 Step 4: Test Your Setup"
echo "=========================="

# Test the configuration
echo "Running production tests..."
cd backend

if command -v node &> /dev/null; then
    echo "Testing LNBits connection..."
    node scripts/testProductionLNBits.js
    TEST_RESULT=$?
    
    if [ $TEST_RESULT -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Your production LNBits is ready!"
        echo "==========================================="
        echo ""
        echo "✅ LNBits instance: $LNBITS_URL"
        echo "✅ Wallet configured and accessible"
        echo "✅ Invoice creation working"
        echo "✅ Environment variables set"
        echo ""
        echo "🔧 Next Steps:"
        echo "1. Set up webhook URL when you deploy Sats Jar"
        echo "2. Test with small amounts first"
        echo "3. Monitor using: npm run monitor:lnbits"
        echo "4. Create regular backups"
        echo ""
        echo "📝 Important Notes:"
        echo "- Your LNBits may sleep after 15 minutes (free tier)"
        echo "- Keep your API keys secure and never commit them"
        echo "- Monitor your wallet balance regularly"
        echo "- Upgrade to paid tier when you need 24/7 uptime"
        echo ""
    else
        echo ""
        echo "❌ Setup incomplete - please check the errors above"
        echo "💡 Common issues:"
        echo "- Wrong API keys"
        echo "- LNBits instance not accessible"
        echo "- Network connectivity issues"
        echo ""
        echo "Try running the test again: node scripts/testProductionLNBits.js"
    fi
else
    echo "⚠️  Node.js not found - please test manually:"
    echo "cd backend && node scripts/testProductionLNBits.js"
fi

echo ""
echo "📚 Documentation:"
echo "- Deployment guide: scripts/deploy-lnbits-render.md"
echo "- Monitoring: backend/scripts/lnbits-monitor.js"
echo "- Testing: backend/scripts/testProductionLNBits.js"
echo ""
echo "🆘 Need help? Check the troubleshooting section in the deployment guide."
