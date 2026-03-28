---
name: manage-skills-skill
description: Proactively create, update, or delete project skills in .claude/skills/ — after completing tasks or on user request
---

Manage project skills in `.claude/skills/`. This skill covers the full lifecycle: create, update, and delete.

## Step 1 — Determine the action

- **Create** — a new repeatable pattern or workflow emerged that would benefit from a skill.
- **Update** — an existing skill is inaccurate, incomplete, or needs new steps.
- **Delete** — a skill is obsolete or replaced.

If triggered automatically after a task, review what was learned and decide if any skill needs changes. If nothing needs updating, skip.

## Step 2 — Find relevant skills

Read the list of existing skills in `.claude/skills/` and determine if any existing skill covers the topic.

- If a matching skill exists → update it.
- If no matching skill exists → create a new one.

## Step 3 — Apply the change

### Creating a new skill

1. Ask the user for the following (skip any fields already known from context):
   - **Skill name** — short, kebab-case identifier with `-skill` suffix (e.g., `review-pr-skill`, `run-tests-skill`). Used as directory name under `.claude/skills/`.
   - **Display name** — human-readable name for the `name` frontmatter field.
   - **Description** — one-line summary for the `description` frontmatter field.
   - **Skill prompt** — what the skill should do when invoked (steps, triggers, expected behavior).

2. Create the file at `.claude/skills/<skill-name>-skill/SKILL.md` with this structure:

```markdown
---
name: <Display name>
description: <One-line description>
---

<Skill prompt body in markdown>
```

3. Requirements:
   - The file **must** start with YAML frontmatter delimited by `---` lines.
   - The frontmatter **must** contain both `name` and `description` fields.
   - The body should clearly describe what the skill does, when it should be triggered, and what steps it performs.
   - Follow the format defined in `ai-skill-file-rule.md`.

### Updating an existing skill

1. Read the existing skill file.
2. Identify what needs updating.
3. Edit the skill, preserving the frontmatter format.

### Deleting a skill

1. Confirm with the user before deleting.
2. Remove the skill directory from `.claude/skills/`.

## Step 4 — Verify

Read back the changed file and confirm the update is correct. Show the user a brief summary of what was changed.

## When to trigger

- **Automatically** after completing any task where a new repeatable pattern was discovered.
- **On user request** via `/manage-skills-skill`.
- Do NOT interrupt the main task — always manage skills after the work is done.
