---
description: Ensures Claude skill files follow the required frontmatter format with name and description fields
paths:
  - ".claude/skills/**/*.md"
---

# Rule: Claude skill file

## 1. Rule description

### 1.1. Skill file content

Claude skill file must start with a YAML frontmatter block containing `name` and `description` fields. The frontmatter is delimited by `---` lines. After the frontmatter, the file body contains the skill prompt or instructions in markdown format.

### 1.2. Skill file header section

The header section must contain the following lines:

```
---
name: skill-name-skill
description: Short summary of the skill
---
```

- `name` — a human-readable name for the skill.
- `description` — a concise one-line summary of what the skill does.

### 1.3. Skill directory naming

Skill directories must use the `-skill` suffix: `.claude/skills/<skill-name>-skill/SKILL.md`. For example: `manage-rules-skill`, `deploy-staging-skill`, `review-pr-skill`.

### 1.4. Skill file body section

The body section contains the skill prompt or instructions. It should be written in markdown format and describe what the skill does, when it should be triggered, and what steps it performs.

## 2. Rule examples

### 2.1. Valid skill file

```md
---
name: review-code-skill
description: Reviews code changes for quality, security, and best practices
---

Review the staged changes and provide feedback on:
- Code quality and readability
- Potential security issues
- Adherence to project conventions
```

### 2.2. Invalid skill file — missing frontmatter

```md
Review the staged changes and provide feedback on code quality.
```

### 2.3. Invalid skill file — missing description

```md
---
name: review-code-skill
---

Review the staged changes.
```
