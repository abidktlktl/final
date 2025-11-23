# Git GitHub Account Setup Guide for abidktlktl

Due to terminal execution constraints, please follow these manual steps to set up your new GitHub account and update Railway configuration.

## Step 1: Configure Git with New GitHub Account

Open PowerShell or Command Prompt and run these commands:

```powershell
git config --global user.name "abidktlktl"
git config --global user.email "your-email@example.com"
```

Replace `your-email@example.com` with your actual GitHub email address.

## Step 2: Verify Git Configuration

Check that your configuration is set correctly:

```powershell
git config --global user.name
git config --global user.email
```

You should see:
- user.name: abidktlktl
- user.email: your-email@example.com

## Step 3: Set Up GitHub Authentication

### Option A: Using Personal Access Token (Recommended)

1. Go to GitHub.com and log in to your **abidktlktl** account
2. Navigate to: **Settings → Developer settings → Personal access tokens → Tokens (classic)**
3. Click **"Generate new token (classic)"**
4. Give it a name like "Git CLI Access"
5. Select scopes: `repo`, `gist`
6. Click **"Generate token"**
7. Copy the token (you won't see it again)

### Option B: Using GitHub CLI (gh)

If you have GitHub CLI installed:

```powershell
gh auth login
```

Follow the prompts to authenticate with your **abidktlktl** account.

## Step 4: Update Repository Remote (if needed)

If you're switching to a different repository under the new account:

```powershell
# View current remote
git remote -v

# Update remote URL
git remote set-url origin https://github.com/abidktlktl/fastify.git
```

Replace `abidktlktl/fastify.git` with your actual repository path under the new account.

## Step 5: Test Git Authentication

Try pushing a small change to verify authentication works:

```powershell
# Create a test commit (optional)
git status

# If you have changes, push them
git push origin main
```

## Current Railway Configuration

Your `railway.json` is already properly configured:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && cd .. && npm install"
  },
  "deploy": {
    "startCommand": "cd backend && node server-redis.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30
  },
  "services": [
    {
      "name": "redis",
      "image": "redis:7-alpine",
      "volumes": ["/data"]
    }
  ]
}
```

## Step 6: Update Railway Deployment

1. Log in to [railway.app](https://railway.app)
2. Select your project
3. Go to **Settings → Source**
4. Disconnect the old GitHub account
5. Connect your new **abidktlktl** account
6. Select the repository `fastify` under your new account
7. Redeploy if needed

## Step 7: Verify Everything Works

After completing all steps, verify:

```powershell
# Check git configuration
git config --global --list | findstr user

# Check remote URL
git remote -v

# Test a push
git push origin main
```

## Troubleshooting

### "Permission denied" when pushing
- Ensure your Personal Access Token is valid and copied correctly
- Re-authenticate with `git config --global user.password` if using HTTPS
- Or set up SSH keys for passwordless access

### "Repository not found"
- Verify the repository exists under your new account
- Check the URL is correct: `https://github.com/abidktlktl/your-repo.git`

### Railway still shows old account
- Clear browser cache and re-login to Railway
- Disconnect old GitHub authorization: Settings → Connected Apps
- Reconnect with new account

## Need Help?

- GitHub Docs: https://docs.github.com
- Railway Docs: https://docs.railway.app
- Git Docs: https://git-scm.com/doc
