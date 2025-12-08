# Hardcoded Korean Texts Status

All UI-related hardcoded Korean texts have been successfully refactored to use `texts.json`.

## Remaining Items (Safe to Ignore)

The following occurrences detected by `grep` are either:
1.  **Internal identifiers:** `types.ts`, `filters.ts` (e.g., `"시기"`) - These are used for logic, not display.
2.  **Comments:** `HomeScreen.tsx`, `PriorityMark.tsx`, `TypeLabel.tsx`
3.  **Examples:** `StyledComponentsExample.tsx`

**No further action is required.**
