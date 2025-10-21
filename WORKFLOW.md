# BTC Price Monitor - Development Workflow

Quick reference for managing code updates between local development and GitHub.

## For You (Project Owner)

### Check Current Branch & Status
```bash
cd "d:\projects\BTC Price Monitor"
git branch
git status
```

### Switch Between Branches
```bash
# See available branches
git branch -a

# Switch to a branch
git checkout branch-name
git checkout main
git checkout claude/add-dark-theme-011CULGg2E2NQu22q4DxEMrb
```

### Pull Latest Changes from GitHub
```bash
git fetch origin
git pull origin branch-name
```

### Merge a Feature Branch into Main
```bash
# First, switch to main
git checkout main

# Merge the feature branch
git merge claude/your-feature-branch-name

# Push to GitHub
git push origin main
```

### Delete a Branch (After Merging)
```bash
# Delete locally
git branch -d branch-name

# Delete on GitHub
git push origin --delete branch-name
```

## For AI Agents (Standard Workflow)

Every agent follows this standardized process:

### 1. Setup
```bash
cd "d:\projects\BTC Price Monitor"
git fetch origin
```

### 2. Create Feature Branch
```bash
git checkout -b claude/feature-description-[session-id]
```

### 3. Make Changes
Edit files as needed.

### 4. Commit & Push
```bash
git add .
git commit -m "$(cat <<'EOF'
[TYPE] Brief description

- Change 1
- Change 2
- Change 3

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

git push -u origin claude/feature-description-[session-id]
```

### 5. Notify User
Agent tells you: "Code pushed to branch `claude/feature-description-[session-id]`. Ready for review."

## Current Branches

```
main                                                          (Stable)
├── claude/add-dark-theme-011CULGg2E2NQu22q4DxEMrb          (Dark/Light theme toggle)
└── claude/fix-btc-data-display-011CULHRTZyWqKWoNDPVrfJp    (API fixes)
```

## Common Tasks

### View What Changed in a Branch
```bash
git diff main..branch-name
```

### See Commit History of a Branch
```bash
git log --oneline branch-name -10
```

### Check What's Different Between Local and GitHub
```bash
git fetch origin
git status
```

### Reset to Last Pushed Version
```bash
git reset --hard origin/branch-name
```

### See All Remote Branches
```bash
git branch -a
```

## Recommended Workflow for You

1. **Keep main branch stable** - Only merge tested, working features
2. **Review feature branches** - Check changes before merging
3. **Test on feature branches** - Verify functionality works
4. **Merge to main** - When ready for production
5. **Delete old branches** - Clean up after merging

## Quick Commands

| Task | Command |
|------|---------|
| Check branch | `git branch` |
| List all branches | `git branch -a` |
| Switch branch | `git checkout branch-name` |
| Create branch | `git checkout -b branch-name` |
| See changes | `git status` |
| Fetch updates | `git fetch origin` |
| Pull changes | `git pull origin branch-name` |
| Push changes | `git push origin branch-name` |
| View history | `git log --oneline -10` |
| Merge branch | `git merge branch-name` |

## When an AI Agent Says "Code Ready"

It means:
✅ Changes committed locally
✅ Branch pushed to GitHub
✅ Ready for you to review and merge

You can then:
1. Check the branch: `git checkout branch-name`
2. Review the changes: `git log --oneline -5`
3. Test locally if needed
4. Merge to main: `git checkout main && git merge branch-name`
5. Push to GitHub: `git push origin main`

---

**Current Status**: You are on branch `claude/fix-btc-data-display-011CULHRTZyWqKWoNDPVrfJp`
