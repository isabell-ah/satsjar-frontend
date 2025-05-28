# Deploy LNBits to Render.com - Step by Step Guide

## Prerequisites
- GitHub account
- Render.com account (free)

## Step 1: Fork LNBits Repository

1. Go to https://github.com/lnbits/lnbits
2. Click "Fork" button (top right)
3. Create fork in your GitHub account

## Step 2: Deploy to Render

1. **Login to Render.com**
   - Go to https://render.com
   - Sign up/login with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account if not already connected
   - Select your forked `lnbits` repository

3. **Configure Build Settings**
   ```
   Name: your-lnbits-app (choose unique name)
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python -m uvicorn lnbits.app:app --host 0.0.0.0 --port $PORT
   ```

4. **Set Environment Variables**
   Click "Advanced" → "Add Environment Variable"
   
   **Required Variables:**
   ```
   LNBITS_BACKEND_WALLET_CLASS=VoidWallet
   LNBITS_DATA_FOLDER=./data
   LNBITS_DATABASE_URL=sqlite:///data/database.sqlite3
   HOST=0.0.0.0
   PORT=10000
   DEBUG=false
   LNBITS_SITE_TITLE=Sats Jar LNBits
   LNBITS_SITE_TAGLINE=Lightning Network Wallet
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your app URL: `https://your-lnbits-app.onrender.com`

## Step 3: Initial LNBits Setup

1. **Access Your LNBits Instance**
   - Open `https://your-lnbits-app.onrender.com`
   - You should see LNBits interface

2. **Create Your First Wallet**
   - Click "Add a new wallet"
   - Enter wallet name: "Sats Jar Main Wallet"
   - Copy the wallet URL and keys that are generated

3. **Get Your API Keys**
   - Admin Key: Found in wallet settings
   - Invoice Key: Found in wallet settings  
   - Wallet ID: Part of the wallet URL

## Step 4: Update Your Sats Jar Configuration

Update your `backend/.env` file:

```env
# Replace these with your actual values from Step 3
LNBITS_BASE_URL=https://your-lnbits-app.onrender.com/api/v1
LNBITS_ADMIN_KEY=your_actual_admin_key_from_lnbits
LNBITS_INVOICE_KEY=your_actual_invoice_key_from_lnbits
LNBITS_WALLET_ID=your_actual_wallet_id_from_lnbits
LNBITS_WEBHOOK_URL=https://your-sats-jar-domain.com/api/webhooks/lnbits
LNBITS_WEBHOOK_SECRET=generate_random_secret_string
LNBITS_ENVIRONMENT=production
```

## Step 5: Test Your Setup

Run the test script:
```bash
cd backend
node scripts/testNewLNBits.js
```

## Important Notes

### Free Tier Limitations
- **Sleep after 15 minutes** of inactivity
- **750 hours/month** (sufficient for low traffic)
- **Automatic wake-up** when accessed

### Backup Strategy
- **Export wallet data** regularly from LNBits interface
- **Document your API keys** securely
- **Keep your GitHub fork** updated

### Monitoring
- Check Render.com logs for errors
- Monitor wallet balance regularly
- Set up health check endpoints

### Security
- **Never commit API keys** to GitHub
- **Use environment variables** only
- **Generate strong webhook secrets**
- **Enable HTTPS only** (automatic on Render)

## Troubleshooting

### Common Issues
1. **Build fails**: Check Python requirements
2. **App won't start**: Verify start command
3. **Database errors**: Check data folder permissions
4. **API errors**: Verify environment variables

### Getting Help
- Render.com documentation
- LNBits GitHub issues
- Lightning Network community forums

## Next Steps
1. Complete deployment following this guide
2. Test with small amounts first
3. Set up monitoring and alerts
4. Plan for scaling when needed

## Scaling Up Later
- Upgrade to Render paid plan ($7/month)
- Add PostgreSQL database
- Implement proper backup strategy
- Add monitoring and alerting
