# Contributing Guide for AI Agents

This guide outlines the standardized workflow for AI agents contributing to the BTC Price Monitor project.

## Workflow Overview

1. **Create/checkout a feature branch**
2. **Make code changes**
3. **Commit with standardized format**
4. **Push to GitHub**
5. **Notify user for review/merge**

## Branch Naming Convention

Use descriptive branch names with this format:

```
claude/[feature-description]-[session-id]
```

Examples:
- `claude/add-dark-theme-011CULGg2E2NQu22q4DxEMrb`
- `claude/fix-api-integration-011CULHRTZyWqKWoNDPVrfJp`
- `claude/add-price-alerts-011CULHRTZyWqKWoNDPVrfJp`

## Standardized Commit Message Format

All commits MUST follow this format:

```
[TYPE] Brief description of changes

- Bullet point 1: Specific change or addition
- Bullet point 2: Another specific change
- Bullet point 3: Bug fix or improvement

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types

- **[FEAT]** - New feature or functionality
- **[FIX]** - Bug fix
- **[REFACTOR]** - Code refactoring without changing functionality
- **[STYLE]** - CSS/styling changes only
- **[DOCS]** - Documentation updates
- **[CHORE]** - Build, dependencies, or configuration changes

### Examples

```
[FEAT] Add light/dark theme toggle

- Add theme toggle button in header
- Implement localStorage for theme persistence
- Create light theme CSS variables
- Smooth theme transition animations

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

```
[FIX] Fix BTC dominance and 24h range display

- Update API endpoint for more reliable data
- Correct dominance percentage calculation
- Fix 24h high/low price extraction

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Step-by-Step Workflow

### 1. Create a New Feature Branch

```bash
cd "d:\projects\BTC Price Monitor"
git fetch origin
git checkout -b claude/your-feature-description-[session-id]
```

### 2. Make Your Changes

Edit files as needed. Example:
- Modify `index.html`, `styles.css`, `script.js`, etc.

### 3. Stage Changes

```bash
git add .
```

Or stage specific files:
```bash
git add index.html styles.css
```

### 4. Commit with Standardized Format

```bash
git commit -m "$(cat <<'EOF'
[FEAT] Brief description of what was added

- Change 1: Description
- Change 2: Description
- Change 3: Description

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 5. Push to GitHub

```bash
git push -u origin claude/your-feature-description-[session-id]
```

The `-u` flag sets the upstream branch (only needed first time).

### 6. Verify Push Success

```bash
git log --oneline -3
git remote -v
```

## Complete Example Workflow

```bash
# 1. Navigate to project
cd "d:\projects\BTC Price Monitor"

# 2. Fetch latest changes
git fetch origin

# 3. Create feature branch
git checkout -b claude/add-price-alerts-011CUL123456789

# 4. Make changes to files (edit index.html, script.js, etc.)

# 5. Stage changes
git add .

# 6. Commit with standardized message
git commit -m "$(cat <<'EOF'
[FEAT] Add price alert notifications

- Add alert threshold input fields
- Implement browser notification API integration
- Store alert preferences in localStorage
- Add visual indicator when alerts are enabled

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# 7. Push to GitHub
git push -u origin claude/add-price-alerts-011CUL123456789

# 8. Verify success
git log --oneline -3
```

## Git Commands Reference

```bash
# Check current branch
git branch

# List all branches (local and remote)
git branch -a

# Switch to existing branch
git checkout branch-name

# Create and switch to new branch
git checkout -b new-branch-name

# See uncommitted changes
git status

# See what changed in files
git diff

# See commit history
git log --oneline -10

# Add all changes
git add .

# Add specific file
git add filename.ext

# Commit changes
git commit -m "message"

# Push to GitHub
git push origin branch-name

# Push and set upstream
git push -u origin branch-name

# Fetch latest from GitHub
git fetch origin

# Pull latest changes
git pull origin branch-name
```

## Important Notes

- ✅ Always fetch before creating a new branch: `git fetch origin`
- ✅ Use descriptive commit messages - include the "why" not just the "what"
- ✅ Test changes locally before pushing
- ✅ Create separate commits for unrelated changes
- ✅ Keep commits focused and atomic (one feature per commit if possible)
- ✅ Include the co-authored-by footer in all commits

## After Pushing

Once code is pushed to a feature branch:

1. **Notify the user** that changes are ready for review
2. **Provide a summary** of what was changed
3. **Wait for user approval** before merging to `main`
4. User can then merge the branch to `main` via GitHub or locally

## Troubleshooting

### Changes not showing on GitHub?
```bash
git push origin branch-name
```

### Forgot to push?
```bash
git log --oneline -1
git push origin branch-name
```

### On wrong branch?
```bash
git checkout correct-branch-name
```

### Made changes but need to start fresh?
```bash
git reset --hard HEAD
git clean -fd
```

## Questions?

If you encounter any issues:
1. Check `git status` to see current state
2. Check `git log --oneline -5` to see recent commits
3. Use `git branch -a` to see all branches
4. Contact the project owner for assistance

---

Thank you for contributing to BTC Price Monitor! 🚀
