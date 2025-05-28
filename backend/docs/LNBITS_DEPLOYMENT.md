# LNBits Production Deployment Guide

## Problem: Temporary Instances Reset Every Hour
- Demo instances are not suitable for production
- You need a permanent LNBits instance for your business

## Solution: Deploy Your Own Permanent LNBits Instance

### Option 1: Railway.app (Recommended - Easiest)

#### Step 1: Deploy LNBits
1. Go to: https://railway.app
2. Sign up with GitHub account
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Search for: `lnbits/lnbits`
6. Click "Deploy Now"
7. Wait for deployment (5-10 minutes)

#### Step 2: Get Your Permanent URL
- Railway will give you a URL like: `https://lnbits-production-abc123.up.railway.app`
- This URL is permanent and won't change

#### Step 3: Configure Environment Variables
In Railway dashboard, add these environment variables:
```
LNBITS_SITE_TITLE=Sats Jar LNBits
LNBITS_SITE_TAGLINE=Lightning Payments for Sats Jar
LNBITS_THEME_OPTIONS=classic,bitcoin,freedom
```

#### Step 4: Access Your Instance
1. Visit your Railway URL
2. Create a new wallet
3. Copy the API keys (Admin Key, Invoice Key, Wallet ID)

#### Step 5: Update Your App Configuration
Update your `.env` file:
```env
LNBITS_BASE_URL=https://your-railway-url.up.railway.app/api/v1
LNBITS_ADMIN_KEY=your_new_admin_key
LNBITS_INVOICE_KEY=your_new_invoice_key
LNBITS_WALLET_ID=your_new_wallet_id
LNBITS_ENVIRONMENT=production
```

**Cost:** ~$5-10/month
**Reliability:** High
**Setup Time:** 15 minutes

---

### Option 2: DigitalOcean Droplet (More Control)

#### Step 1: Create Droplet
1. Go to: https://digitalocean.com
2. Create account
3. Create new Droplet (Ubuntu 22.04)
4. Choose $10/month plan
5. Add your SSH key

#### Step 2: Install LNBits
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Docker
apt update
apt install docker.io docker-compose git -y

# Clone LNBits
git clone https://github.com/lnbits/lnbits.git
cd lnbits

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Start LNBits
docker-compose up -d
```

#### Step 3: Set Up Domain (Optional)
1. Point your domain to droplet IP
2. Set up SSL with Let's Encrypt
3. Configure nginx reverse proxy

**Cost:** $10-20/month
**Reliability:** Very High
**Setup Time:** 1-2 hours

---

### Option 3: Voltage.cloud (Professional)

#### Step 1: Sign Up
1. Go to: https://voltage.cloud
2. Create account
3. Choose LNBits plan ($20-50/month)

#### Step 2: Deploy
1. Click "Create Node"
2. Choose "LNBits"
3. Configure settings
4. Deploy

#### Step 3: Access
- Get your permanent URL
- Access admin panel
- Copy API keys

**Cost:** $20-50/month
**Reliability:** Enterprise Grade
**Setup Time:** 10 minutes
**Support:** Professional

---

## Comparison Table

| Option | Cost/Month | Setup Time | Reliability | Support | Best For |
|--------|------------|------------|-------------|---------|----------|
| Railway.app | $5-10 | 15 min | High | Community | Quick Start |
| DigitalOcean | $10-20 | 1-2 hours | Very High | Community | Full Control |
| Voltage.cloud | $20-50 | 10 min | Enterprise | Professional | Business |

## Recommended Choice

**For Sats Jar:** Start with **Railway.app**
- Quick to deploy
- Affordable
- Reliable for production
- Easy to manage
- Can migrate later if needed

## After Deployment

1. **Test your instance** with the test script
2. **Fund your wallet** with some sats
3. **Set up webhooks** for real-time payments
4. **Update your app** to use the new instance
5. **Monitor** for any issues

## Important Notes

- ✅ **Permanent URL** - never changes
- ✅ **Your data persists** - no hourly resets
- ✅ **Production ready** - suitable for real customers
- ✅ **Scalable** - can handle growth
- ✅ **Backup options** - data is safe

## Next Steps

1. Choose deployment option
2. Deploy your instance
3. Update app configuration
4. Test thoroughly
5. Go live with confidence!
