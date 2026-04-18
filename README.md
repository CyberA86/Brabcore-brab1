# Brabcore BRAB-1 — Public Lead Intake Agent

Licensed NYC Locksmith lead capture app. Deploys to Vercel in under 30 minutes.

## What it does
- Walks clients through a 5-step intake conversation
- Generates a real-time quote estimate
- On confirmation, writes the lead directly to your Brabcore OS Google Sheet
- Make.com picks it up automatically and fires your email alert

## Setup Instructions

### Step 1 — Get your Google Sheet ID
1. Open your Brabcore OS Google Sheet
2. Look at the URL: docs.google.com/spreadsheets/d/XXXXXXXXXX/edit
3. Copy the long string between /d/ and /edit — that's your Sheet ID
4. Save it — you'll need it later

### Step 2 — Create Google Service Account
1. Go to console.cloud.google.com
2. Create a new project called "Brabcore"
3. Click "Enable APIs" → search "Google Sheets API" → Enable it
4. Go to "Credentials" → "Create Credentials" → "Service Account"
5. Name it "brabcore-sheets" → click Create
6. Click the service account → "Keys" tab → "Add Key" → "JSON"
7. A JSON file downloads — open it, you need:
   - client_email (looks like brabcore-sheets@...iam.gserviceaccount.com)
   - private_key (long string starting with -----BEGIN RSA PRIVATE KEY-----)

### Step 3 — Share your Google Sheet with the service account
1. Open Brabcore OS in Google Sheets
2. Click Share (top right)
3. Paste the client_email from Step 2
4. Set permission to "Editor"
5. Click Send

### Step 4 — Deploy to Vercel
1. Go to github.com → create a new repository called "brabcore-brab1"
2. Upload all these files to that repository
3. Go to vercel.com → sign up free → "New Project"
4. Import your GitHub repository
5. Before deploying, click "Environment Variables" and add:
   - GOOGLE_CLIENT_EMAIL = (paste client_email from JSON file)
   - GOOGLE_PRIVATE_KEY = (paste private_key from JSON file, include the BEGIN/END lines)
   - GOOGLE_SHEET_ID = (paste your Sheet ID from Step 1)
6. Click Deploy

### Step 5 — Test it
1. Vercel gives you a URL like brabcore-brab1.vercel.app
2. Open it on your phone
3. Go through the full intake flow
4. Check your Brabcore OS Leads tab — the lead should appear within seconds
5. Check bracorenyc@gmail.com — Make.com alert should fire within 15 minutes

### Step 6 — Replace placeholders
In pages/index.js, replace:
- [YOUR NUMBER] with your actual Brabcore phone number

Then redeploy on Vercel (it auto-deploys when you push to GitHub).

## Your public URL
Share this URL everywhere once deployed:
- Google Business Profile website field
- Nextdoor business bio
- Instagram bio link
- Text reply to inquiries: "Get a free quote here: [your URL]"
