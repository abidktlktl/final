# How to Sign In to GitHub from VS Code (Step-by-Step)

## The Easiest Way: Using VS Code Command Palette

### Step 1: Open Command Palette
Press these keys together: **Ctrl + Shift + P**

You'll see a search box appear at the top of VS Code that says "Command Palette"

### Step 2: Search for Git Sign In
Type this in the search box:
```
Git: Sign in with GitHub
```

As you type, you should see options appear below. Look for the option that says **"Git: Sign in with GitHub"** and click on it (or press Enter).

### Step 3: Allow VS Code to Access GitHub
A popup appears asking "Allow 'Visual Studio Code' to open external URL?"

Click the **"Open"** button.

A browser window will automatically open.

### Step 4: Log In to GitHub in the Browser
In the browser window that opened:
1. You see a GitHub login page
2. Enter your GitHub username: **abidktlktl**
3. Enter your GitHub password
4. If you have 2FA (two-factor authentication), complete that step

### Step 5: Authorize VS Code
After logging in, you see a page asking to authorize VS Code to access GitHub.

Click the green **"Authorize github"** button (or similar authorization button).

### Step 6: Success!
The browser will show "Success!" or a confirmation message.

Go back to VS Code - you're now signed in!

---

## Verify You're Signed In

1. Look at the **Source Control** panel in VS Code (left sidebar, it looks like a Git branch icon)
2. If it shows your **abidktlktl** account name, you're signed in!

Or in the terminal, run:
```powershell
gh auth status
```

You should see something like:
```
✓ Logged in to github.com as abidktlktl
```

---

## Configure Your Git Identity

After signing in, open the VS Code terminal (Ctrl + `) and run these two commands:

```powershell
git config --global user.name "abidktlktl"
git config --global user.email "your-email@example.com"
```

Replace `your-email@example.com` with the email address associated with your GitHub account.

---

## Test If It Works

In VS Code terminal, run:
```powershell
git status
```

If you see your repository status without errors, it works!

To test pushing:
```powershell
git push origin main
```

If it pushes successfully, you're all set!

---

## If It Didn't Work

### The sign-in popup didn't appear
- Try again: Ctrl + Shift + P → **Git: Sign in with GitHub**
- Make sure you click "Open" when asked to allow external URL

### "Permission denied" when pushing
- You might be using the wrong authentication
- Restart VS Code (Ctrl + Shift + P → "Reload Window")
- Try signing in again

### Still getting errors
- Try using GitHub CLI instead:
  - Open terminal: Ctrl + `
  - Run: `gh auth login`
  - Follow the prompts

---

## Alternative Method: Using GitHub CLI

If the above method doesn't work, use GitHub CLI:

### Step 1: Open VS Code Terminal
Press: **Ctrl + `** (backtick, same key as tilde ~)

A terminal appears at the bottom of VS Code.

### Step 2: Check if GitHub CLI is installed
Type:
```powershell
gh --version
```

If you see a version number, it's installed. Skip to Step 4.

If you see "command not found", continue to Step 3.

### Step 3: Install GitHub CLI
Type:
```powershell
winget install GitHub.cli
```

Wait for it to finish installing.

### Step 4: Sign In
Type:
```powershell
gh auth login
```

Follow the prompts in the terminal:

1. **What is your preferred protocol for Git operations?**
   - Select: `HTTPS`

2. **Authenticate Git with your GitHub credentials?**
   - Select: `Yes`

3. **How would you like to authenticate GitHub CLI?**
   - Select: `Login with a web browser`

4. A browser window opens
   - Log in with **abidktlktl**
   - Authorize the application

5. Return to VS Code terminal
   - You're now signed in!

### Step 5: Verify
Type:
```powershell
gh auth status
```

You should see your **abidktlktl** account is authenticated.

---

## Summary

**3 Simple Steps:**
1. Press **Ctrl + Shift + P**
2. Type **"Git: Sign in with GitHub"** and press Enter
3. Log in with your **abidktlktl** account in the browser that opens

That's it! You're now signed into GitHub from VS Code.

After signing in, configure your Git identity and you can push/pull without any permission issues.
