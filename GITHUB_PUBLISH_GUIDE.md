# 📤 GitHub Publishing Guide for SkillMirror

Follow these step-by-step instructions to initialize Git, create a clean repository, and publish **SkillMirror** to GitHub.

---

## 🚀 Quick Publishing (Recommended)

### Step 1: Initialize Git Repository

Open your terminal in the project root (`/Users/jesminpatel/Desktop/SkillMirror`) and run:

```bash
# Navigate to project root
cd /Users/jesminpatel/Desktop/SkillMirror

# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SkillMirror - AI-Powered Career Development Platform"
```

### Step 2: Create a GitHub Repository

1. Go to [GitHub - Create a New Repository](https://github.com/new).
2. Set the following options:
   - **Repository name:** `skillmirror` or `skillmirror-ai-platform`
   - **Description:** "AI-powered career development platform with interview prep, resume optimization, and learning tools"
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README (we already have one)
5. Click "Create repository"

### Step 5: Connect to GitHub

Copy the commands from GitHub (they will look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/careerspyke.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 6: Push to GitHub

```bash
git push -u origin main
```

---

## ⚠️ IMPORTANT: Security Checklist

Before pushing, verify these files are in `.gitignore`:

- ✅ `.env.local` (contains API keys)
- ✅ `.env` (backend environment)
- ✅ `node_modules/` (dependencies)
- ✅ `*.db` (database files)
- ✅ `.next/` (build files)

### Verify .gitignore is Working

```bash
git status
```

Make sure you DON'T see:
- ❌ `.env.local`
- ❌ `.env`
- ❌ `node_modules/`
- ❌ `nucareer.db`

If you see these files, they will be uploaded! Stop and fix .gitignore first.

---

## 📝 After Publishing

### 1. Add Repository Description

On GitHub, click "About" (gear icon) and add:
- **Description:** AI-powered career development platform
- **Website:** Your deployment URL (if deployed)
- **Topics:** `ai`, `career`, `interview-prep`, `nextjs`, `react`, `gemini-ai`, `education`

### 2. Create a LICENSE File

Add a LICENSE file (MIT recommended):

```bash
# On GitHub, go to your repository
# Click "Add file" > "Create new file"
# Name it "LICENSE"
# Choose "MIT License" from the template dropdown
# Commit the file
```

### 3. Add Screenshots (Optional)

Create a `screenshots/` folder and add images:
- Home page
- Dashboard
- Interview page
- Code explainer
- Resume upload

Update README.md with actual screenshot paths.

### 4. Enable GitHub Pages (Optional)

For documentation hosting:
1. Go to Settings > Pages
2. Select source: `main` branch
3. Choose folder: `/docs` or `/root`
4. Save

---

## 🔄 Future Updates

### To Push New Changes:

```bash
# Check what changed
git status

# Add specific files
git add filename.js

# Or add all changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push
```

### Common Git Commands:

```bash
# Check status
git status

# View commit history
git log

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Pull latest changes
git pull

# View remote URL
git remote -v
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Frontend)

1. Go to https://vercel.com
2. Import your GitHub repository
3. Configure:
   - Framework: Next.js
   - Root Directory: `frontend`
   - Environment Variables: Add all from `.env.local`
4. Deploy!

### Option 2: Heroku (For Backend)

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create careerspyke-backend

# Add environment variables
heroku config:set JWT_SECRET=your_secret

# Deploy
git subtree push --prefix backend heroku main
```

### Option 3: Railway (Full Stack)

1. Go to https://railway.app
2. Connect GitHub repository
3. Deploy both frontend and backend
4. Add environment variables

---

## 📊 Repository Settings

### Recommended Settings:

1. **Branch Protection:**
   - Settings > Branches > Add rule
   - Require pull request reviews
   - Require status checks

2. **Security:**
   - Enable Dependabot alerts
   - Enable secret scanning
   - Add SECURITY.md file

3. **Issues:**
   - Enable issue templates
   - Add labels (bug, enhancement, documentation)

4. **Actions:**
   - Set up CI/CD (optional)
   - Auto-deploy on push

---

## 🎯 Best Practices

### Commit Messages:

```bash
# Good commit messages:
git commit -m "feat: Add code explainer feature"
git commit -m "fix: Resolve API key authentication issue"
git commit -m "docs: Update README with installation steps"
git commit -m "style: Format code with Prettier"
git commit -m "refactor: Optimize database queries"

# Bad commit messages:
git commit -m "update"
git commit -m "fix bug"
git commit -m "changes"
```

### Branch Naming:

```bash
feature/code-explainer
bugfix/api-authentication
hotfix/security-patch
docs/readme-update
```

---

## ❓ Troubleshooting

### Problem: "Permission denied (publickey)"

**Solution:**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub
# Copy the key
cat ~/.ssh/id_ed25519.pub

# Go to GitHub > Settings > SSH Keys > Add new
```

### Problem: "Large files detected"

**Solution:**
```bash
# Remove large files from git
git rm --cached large-file.zip

# Add to .gitignore
echo "large-file.zip" >> .gitignore

# Commit
git commit -m "Remove large file"
```

### Problem: "Accidentally committed .env file"

**Solution:**
```bash
# Remove from git but keep locally
git rm --cached frontend/.env.local

# Add to .gitignore
echo ".env.local" >> .gitignore

# Commit
git commit -m "Remove sensitive files"

# IMPORTANT: Regenerate all API keys!
```

---

## 📞 Need Help?

- GitHub Docs: https://docs.github.com
- Git Docs: https://git-scm.com/doc
- Stack Overflow: https://stackoverflow.com/questions/tagged/git

---

## ✅ Checklist Before Publishing

- [ ] `.gitignore` file created
- [ ] No sensitive data in code (API keys, passwords)
- [ ] README.md is complete
- [ ] All dependencies listed in package.json
- [ ] Code is tested and working
- [ ] Documentation is up to date
- [ ] License file added
- [ ] Repository description added
- [ ] Topics/tags added

---

**Ready to publish? Follow the steps above and your project will be live on GitHub! 🎉**
