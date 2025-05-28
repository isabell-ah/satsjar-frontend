# LNBits Deployment on Render.com

## Free Plan Deployment (Testing/Development)

### Step 1: Prepare Repository
1. Fork LNBits repository: https://github.com/lnbits/lnbits
2. Or create new repo with LNBits code

### Step 2: Deploy on Render
1. Go to: https://render.com
2. Sign up with GitHub account
3. Click "New +" → "Web Service"
4. Connect your LNBits repository
5. Configure deployment:

```
Name: lnbits-satsjar
Environment: Python
Build Command: pip install -r requirements.txt
Start Command: python -m uvicorn lnbits.app:app --host 0.0.0.0 --port $PORT
```

### Step 3: Environment Variables
Add these in Render dashboard:

```
LNBITS_SITE_TITLE=Sats Jar LNBits
LNBITS_SITE_TAGLINE=Lightning Payments
LNBITS_THEME_OPTIONS=classic,bitcoin
LNBITS_BACKEND_WALLET_CLASS=VoidWallet
LNBITS_DATA_FOLDER=./data
```

### Step 4: Database Setup
1. Create PostgreSQL database (free 90 days)
2. Add database URL to environment variables:
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### Step 5: Access Your Instance
- URL: https://your-app-name.onrender.com
- Create wallet and get API keys
- Update your Sats Jar .env file

## Limitations of Free Plan

### Sleep Mode Issues
- App sleeps after 15 minutes of inactivity
- Customer payments may fail during sleep
- 30+ second wake-up time

### Solutions for Sleep Mode

#### Option 1: Keep-Alive Service
Create a simple ping service to keep app awake:

```javascript
// keep-alive.js
setInterval(() => {
  fetch('https://your-lnbits.onrender.com/health')
    .then(() => console.log('Ping successful'))
    .catch(err => console.log('Ping failed:', err));
}, 14 * 60 * 1000); // Every 14 minutes
```

#### Option 2: External Monitoring
Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

Set them to ping your app every 10 minutes.

## Upgrade to Paid Plan

### Render Paid Plans
- **Starter:** $7/month
  - No sleep mode
  - 24/7 availability
  - Better performance
  
- **Standard:** $25/month
  - More resources
  - Better for production

### When to Upgrade
Upgrade when you:
- Have real customers
- Need 24/7 reliability
- Process real payments
- Want professional service

## Production Considerations

### Free Plan: Good For
✅ Development and testing
✅ Learning LNBits
✅ Proof of concept
✅ Demo purposes

### Free Plan: Not Good For
❌ Production business
❌ Real customer payments
❌ 24/7 availability needs
❌ High reliability requirements

## Alternative Free Options

### 1. Railway.app
- $5/month (not free, but very cheap)
- No sleep mode
- Better for production

### 2. Heroku
- Free plan discontinued
- Paid plans start at $7/month

### 3. Self-Hosted
- DigitalOcean: $6/month
- Linode: $5/month
- Full control

## Recommended Strategy

### Phase 1: Start with Render Free
1. Deploy LNBits on Render free plan
2. Test integration with Sats Jar
3. Verify everything works
4. Use for development only

### Phase 2: Upgrade for Production
1. Upgrade to Render paid plan ($7/month)
2. Or migrate to Railway.app ($5/month)
3. Or self-host on VPS ($5-10/month)

## Sample Deployment Commands

### Deploy LNBits on Render
```bash
# 1. Fork LNBits repo
git clone https://github.com/yourusername/lnbits.git
cd lnbits

# 2. Create render.yaml (optional)
cat > render.yaml << EOF
services:
  - type: web
    name: lnbits
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python -m uvicorn lnbits.app:app --host 0.0.0.0 --port \$PORT
    envVars:
      - key: LNBITS_SITE_TITLE
        value: Sats Jar LNBits
EOF

# 3. Push to GitHub
git add .
git commit -m "Deploy to Render"
git push origin main

# 4. Connect to Render dashboard
```

## Testing Your Deployment

### Test Script for Render
```bash
# Test if your Render LNBits is working
curl https://your-app.onrender.com/health

# Test API access
curl -H "X-Api-Key: your-key" \
     https://your-app.onrender.com/api/v1/wallet
```

## Conclusion

Render free plan is:
- ✅ **Great for testing** LNBits integration
- ✅ **Perfect for development** and learning
- ⚠️ **Not suitable for production** due to sleep mode
- 💰 **Upgrade to paid plan** ($7/month) for real business

Start with free plan to test, then upgrade when ready for customers.
