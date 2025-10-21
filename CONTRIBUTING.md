# Contributing to BTC Price Monitor

Thank you for contributing to the BTC Price Monitor project! This guide outlines our standards and workflow.

## Branch Naming Convention

All branches should follow this format:

```
claude/[feature-description]-[session-id]
```

**Examples:**
- `claude/add-price-alerts-011CUL123456`
- `claude/fix-api-integration-011CUL789012`
- `claude/add-dark-theme-011CULGg2E2NQu22q4DxEMrb`

## Commit Message Format

All commits must follow this standardized format:

```
[TYPE] Brief description

- Change 1
- Change 2
- Change 3

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types

Use one of the following types for your commits:

- **[FEAT]** - New feature or functionality
- **[FIX]** - Bug fix
- **[REFACTOR]** - Code restructuring without changing functionality
- **[STYLE]** - CSS/UI styling changes
- **[DOCS]** - Documentation updates
- **[CHORE]** - Maintenance tasks, dependency updates, etc.

### Commit Message Examples

**Feature:**
```
[FEAT] Add price alert notifications

- Implement notification API integration
- Add user preference settings
- Create alert threshold configuration

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Bug Fix:**
```
[FIX] Correct Bitcoin price display formatting

- Fix decimal precision for price display
- Update currency formatting function
- Add error handling for API failures

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Workflow Steps

After making changes, ALWAYS follow these steps:

1. **Stage your changes:**
   ```bash
   git add .
   ```

2. **Commit with proper format:**
   ```bash
   git commit -m "[TYPE] Brief description

   - Change 1
   - Change 2
   - Change 3

   🤖 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Push to your branch:**
   ```bash
   git push -u origin branch-name
   ```

4. **Notify for review:**
   - Inform the project maintainer when code is pushed and ready for review
   - DO NOT merge to main - maintainer will handle merges after review

## Pull Request Guidelines

- Ensure your code is pushed to the correct branch
- Wait for code review before merging
- Address any feedback from code review
- Maintainer will merge approved PRs to main

## Code Quality

- Write clean, readable code
- Follow existing code style in the project
- Test your changes thoroughly
- Ensure responsive design for UI changes
- Verify API integrations work correctly

## Questions?

If you have questions about the contribution process, please reach out to the project maintainer.

Thank you for helping improve BTC Price Monitor!
