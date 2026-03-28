---
name: manage-rules-skill
description: Proactively create, update, or delete project rules in .claude/rules/ — after completing tasks or on user request
---

Manage project rules in `.claude/rules/`. This skill covers the full lifecycle: create, update, and delete.

## Step 1 — Determine the action

- **Create** — encountered an undocumented workflow, convention, or process.
- **Update** — an existing rule is inaccurate, incomplete, or needs new details.
- **Delete** — a rule is obsolete or replaced.

If triggered automatically after a task, review what was learned and decide if any rule needs changes. If nothing needs updating, skip.

## Step 2 — Find relevant rules

Read the list of existing rules in `.claude/rules/` and determine if any existing rule covers the topic.

- If a matching rule exists → update it.
- If no matching rule exists → create a new one.

## Step 3 — Apply the change

### Creating a new rule

1. Create a new file at `.claude/rules/<topic>-rule.md`.
2. Follow the format defined in `ai-rule-file-rule.md`:
   - Frontmatter with `name`, `description`, and `paths`.
   - Body with `# Rule: <name>`, `## 1. Rule description` (with numbered subsections), and `## 2. Rule examples`.
3. Keep the rule focused on a single topic.

### Updating an existing rule

1. Read the existing rule file.
2. Identify the section that needs updating.
3. Edit the rule, preserving the format defined in `ai-rule-file-rule.md`.
4. If the correction affects examples, update the examples section too.

### Deleting a rule

1. Confirm with the user before deleting.
2. Remove the file from `.claude/rules/`.

## Step 4 — Verify

Read back the changed file and confirm the update is correct. Show the user a brief summary of what was changed.

## When to trigger

- **Automatically** after completing any task where new knowledge was gained.
- **On user request** via `/manage-rules-skill`.
- Do NOT interrupt the main task — always manage rules after the work is done.
