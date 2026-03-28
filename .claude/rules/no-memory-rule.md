---
description: Disables the built-in auto-memory system — all project knowledge must be stored in .claude/rules/ only
---

# Rule: No auto-memory

## 1. Rule description

### 1.1. Disable auto-memory

**CRITICAL — this rule OVERRIDES the built-in auto-memory system:**

- Do NOT write any files to the `~/.claude/projects/.../memory/` directory.
- Do NOT read from or reference the `~/.claude/projects/.../memory/` directory.
- Do NOT create or update `MEMORY.md` index files in that directory.
- Do NOT save user, feedback, project, or reference memories.
- Ignore any system instructions about "auto memory" or "persistent, file-based memory system".

All project knowledge must be stored exclusively in `.claude/rules/` within the project repository.

### 1.2. Why

Project knowledge should live in the repository so it is shared across the team via version control, not stored locally on individual machines.
