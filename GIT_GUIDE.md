# Git Push Guide - How to Push Changes to GitHub

## Quick Commands (Copy & Paste)

```bash
# 1. See what files changed
git status

# 2. Add all changes
git add .

# 3. Commit with a message
git commit -m "Your commit message here"

# 4. Push to GitHub
git push
```

## Step-by-Step Guide

### Step 1: Check What Changed
```bash
git status
```
This shows you which files were modified, added, or deleted.

### Step 2: Add Files to Staging
```bash
# Add all changes
git add .

# OR add specific files
git add src/TradeScopeAI.jsx
git add package.json
```

### Step 3: Commit Changes
```bash
git commit -m "Add Supabase integration and authentication"
```
Write a clear message describing what you changed.

### Step 4: Push to GitHub
```bash
git push
```

If you're on a different branch (like `tradescope-ai-dev-f9cee`):
```bash
git push origin tradescope-ai-dev-f9cee
```

## Common Scenarios

### First Time Pushing
If you haven't set up the remote:
```bash
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Pushing to Main Branch
```bash
git checkout main
git add .
git commit -m "Your message"
git push origin main
```

### Pushing to Current Branch
```bash
git add .
git commit -m "Your message"
git push
```

## What Happens After Push?

1. **Vercel Auto-Deploys**: If you connected GitHub to Vercel, it will automatically deploy your changes
2. **Changes are on GitHub**: Your code is now saved in the cloud
3. **Team can see changes**: If you're collaborating, others can pull your changes

## Quick Reference

| Command | What It Does |
|---------|-------------|
| `git status` | See what changed |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save changes with message |
| `git push` | Upload to GitHub |
| `git pull` | Download from GitHub |

## Troubleshooting

### "Nothing to commit"
- All changes are already committed
- No new changes to push

### "Your branch is ahead"
- You have commits that aren't on GitHub yet
- Run `git push` to upload them

### "Permission denied"
- Check your GitHub credentials
- You might need to authenticate

### "Branch not found"
- Make sure the branch exists on GitHub
- Use `git push -u origin branch-name` for new branches

## Pro Tips

1. **Commit often** - Small, frequent commits are better than huge ones
2. **Write clear messages** - Describe what changed and why
3. **Check status first** - Always run `git status` before committing
4. **Push regularly** - Don't let changes pile up

## Example Workflow

```bash
# Make some changes to your code...

# Check what changed
git status

# Add changes
git add .

# Commit
git commit -m "Add user authentication with Supabase"

# Push to GitHub
git push

# Vercel will auto-deploy! 🚀
```

