# Quick Workflow Reference

## 1. Create Feature Branch

```bash
git checkout -b claude/[feature-description]-[session-id]
```

**Example:**
```bash
git checkout -b claude/add-price-alerts-011CUL123456
```

## 2. Make Your Changes

Edit files as needed for your feature or fix.

## 3. Commit Changes

```bash
git add .
git commit -m "[TYPE] Brief description

- Change 1
- Change 2
- Change 3

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Commit Types:
- `[FEAT]` - New feature
- `[FIX]` - Bug fix
- `[REFACTOR]` - Code restructuring
- `[STYLE]` - CSS/UI changes
- `[DOCS]` - Documentation
- `[CHORE]` - Maintenance

## 4. Push to Remote

```bash
git push -u origin claude/[feature-description]-[session-id]
```

## 5. Notify for Review

Inform maintainer that code is ready for review. **DO NOT** merge to main.

---

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)
