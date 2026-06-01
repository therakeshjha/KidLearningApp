# Changelog System

This directory tracks all changes made to the NOVA Quest project.

## Structure

- **One file per day**: `CHANGELOG-YYYY-MM-DD.md`
- **Chronological order**: Newest entries at the top of each file
- **Organized by change type**: Added, Modified, Removed, Fixed, etc.

## File Naming Convention

```
CHANGELOG-YYYY-MM-DD.md
```

Examples:
- `CHANGELOG-2026-05-19.md`
- `CHANGELOG-2026-05-20.md`
- `CHANGELOG-2026-12-25.md`

## Template

Each daily changelog follows this structure:

```markdown
# Changelog - [Month Day, Year]

## Summary
Brief overview of the day's work.

---

## Changes

### Added
- New features, files, or functionality

### Modified
- Changes to existing features or files

### Fixed
- Bug fixes and corrections

### Removed
- Deleted features, files, or functionality

### Refactored
- Code improvements without behavior changes

---

## Files Modified
List of all files changed with brief descriptions.

---

## Files Created
List of all new files.

---

## Files Deleted
List of all removed files.

---

## Notes
Important context, decisions, or observations.

---

## Next Steps
Planned work or outstanding tasks.
```

## Usage

### For Claude Code

When making changes:
1. Check if today's changelog exists (`CHANGELOG-YYYY-MM-DD.md`)
2. If not, create it using the template above
3. Document all changes under appropriate sections
4. Update the summary at the top
5. Add relevant notes about decisions or context

### For Developers

- Review daily changelogs to understand recent work
- Use as reference for code reviews
- Track project evolution over time
- Identify patterns in bugs or feature additions

## Guidelines

- **Be specific**: Include file paths and line numbers when relevant
- **Be concise**: One line per change with enough context
- **Include context**: Why a change was made, not just what
- **Link related changes**: Reference other files or changes when connected
- **Note breaking changes**: Highlight anything that affects existing functionality
- **Track decisions**: Document important architectural or design choices

## Example Entry

```markdown
### Added
- **src/components/NewFeature.jsx** - Added countdown timer component
  - Displays remaining time for speed rounds
  - Auto-submits when timer reaches zero
  - Animated visual feedback at 10-second mark

### Modified  
- **src/screens/SpeedRoundScreen.jsx:45-67** - Integrated countdown timer
  - Replaced manual time tracking with NewFeature component
  - Fixed bug where time could go negative
```

## Integration with Git

If using git, these changelogs complement commit messages:
- **Commit messages**: What changed (technical)
- **Changelogs**: Why it changed (context)

Consider reviewing the day's changelog before committing to ensure all work is documented.
