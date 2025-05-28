# LNBits Switch Guide

## Quick Switch (Using Existing LNBits SaaS)

### Step 1: Switch Provider
```bash
# In backend/.env file
LIGHTNING_PROVIDER=lnbits  # Change from 'opennode' to 'lnbits'
```

### Step 2: Restart Backend
```bash
cd backend
npm run dev  # or node server.js
```

### Step 3: Test the Switch
```bash
cd backend
node scripts/testLightningService.js
```

## Setting Up New LNBits Instance

### Option A: LNBits SaaS (Recommended for Testing)
1. **Visit**: https://lnbits.com/
2. **Sign up** for SaaS account
3. **Create wallet** and get credentials
4. **Update .env** with new credentials

### Option B: Self-Hosted LNBits (Production)

#### Using Render.com (Free Hosting)
1. **Fork LNBits repo**: https://github.com/lnbits/lnbits
2. **Deploy to Render**:
   - Connect GitHub repo
   - Set environment variables
   - Deploy automatically

#### Using Docker (Local Development)
```bash
# Clone LNBits
git clone https://github.com/lnbits/lnbits.git
cd lnbits

# Run with Docker
docker run -d \
  --name lnbits \
  -p 5000:5000 \
  -e LNBITS_BACKEND_WALLET_CLASS=FakeWallet \
  lnbits/lnbits:latest
```

#### Manual Installation
```bash
# Install dependencies
git clone https://github.com/lnbits/lnbits.git
cd lnbits
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your settings

# Run
python -m uvicorn lnbits.app:app --host 0.0.0.0 --port 5000
```

## Configuration Examples

### Demo/Testing Configuration
```bash
# Demo LNBits (for testing only)
LNBITS_BASE_URL=https://demo.lnbits.com/api/v1
LNBITS_ADMIN_KEY=your_demo_admin_key
LNBITS_INVOICE_KEY=your_demo_invoice_key
LNBITS_WALLET_ID=your_demo_wallet_id
LNBITS_ENVIRONMENT=demo
```

### Production SaaS Configuration
```bash
# Production LNBits SaaS
LNBITS_BASE_URL=https://yourdomain.lnbits.com/api/v1
LNBITS_ADMIN_KEY=your_production_admin_key
LNBITS_INVOICE_KEY=your_production_invoice_key
LNBITS_WALLET_ID=your_production_wallet_id
LNBITS_ENVIRONMENT=production
```

### Self-Hosted Configuration
```bash
# Self-hosted LNBits
LNBITS_BASE_URL=https://your-lnbits-domain.com/api/v1
LNBITS_ADMIN_KEY=your_admin_key
LNBITS_INVOICE_KEY=your_invoice_key
LNBITS_WALLET_ID=your_wallet_id
LNBITS_ENVIRONMENT=production
```

## Funding Source Options

LNBits supports multiple funding sources:

### 1. FakeWallet (Testing Only)
- No real Bitcoin
- Perfect for development
- Instant "payments"

### 2. LND (Lightning Network Daemon)
- Full Lightning node
- Real Bitcoin
- Requires technical setup

### 3. OpenNode (via LNBits)
- Use OpenNode as funding source
- Real Bitcoin through OpenNode
- Best of both worlds

### 4. LN Pay
- Another Lightning service provider
- Real Bitcoin
- Easy setup

### 5. Voltage
- Hosted Lightning nodes
- Real Bitcoin
- Professional service

## Migration Considerations

### Money Location
- **OpenNode**: Money stays in OpenNode wallet
- **LNBits**: Money goes to LNBits wallet
- **Important**: Different wallets = split funds

### Database Updates
Your existing invoices will still reference OpenNode IDs. New invoices will use LNBits IDs.

### Webhook URLs
Update webhook URLs if switching to self-hosted:
```bash
LNBITS_WEBHOOK_URL=https://your-domain.com/api/webhooks/lnbits
```

## Testing the Switch

### Test Script
```bash
cd backend
node -e "
require('dotenv').config();
const lightningService = require('./services/lightningService');

async function testSwitch() {
  console.log('Current provider:', process.env.LIGHTNING_PROVIDER);
  
  const invoice = await lightningService.createInvoice(null, 10, 'Test switch');
  console.log('Invoice created:', invoice.id);
  
  const status = await lightningService.getInvoiceStatus(invoice.id);
  console.log('Status check:', status.status);
}

testSwitch().catch(console.error);
"
```

## Rollback Plan

If issues occur, quickly rollback:
```bash
# In .env file
LIGHTNING_PROVIDER=opennode  # Switch back to OpenNode
```

Then restart your backend server.

## Best Practices

1. **Test First**: Always test with small amounts
2. **Backup Config**: Keep backup of working .env file
3. **Monitor Logs**: Watch backend logs during switch
4. **Gradual Migration**: Consider running both providers temporarily
5. **User Communication**: Inform users of any maintenance windows
