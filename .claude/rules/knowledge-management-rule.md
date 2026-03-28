---
description: Autonomously manage project knowledge — after ANY task, self-assess what was learned and update rules, skills, both, or nothing
paths:
  - ".claude/rules/**/*.md"
  - ".claude/skills/**/*.md"
---

# Rule: Knowledge management

## 1. Rule description

### 1.1. Purpose

After completing **any task**, autonomously assess whether your knowledge base (rules and skills) needs updating. This is not triggered by a user request — it is a self-directed process that runs after every piece of work. You decide **what** to update (rules, skills, both, or nothing) and **how** (create, update, or delete).

Do not store project knowledge in personal memory files — always use shared rules and skills.

### 1.2. Self-assessment after every task

After finishing any task (writing code, running scripts, fixing bugs, answering questions, etc.), ask yourself:

1. **Did I learn something new** about the project that isn't captured in existing rules or skills?
2. **Did I discover that an existing rule or skill is wrong**, incomplete, or outdated?
3. **Did the user correct me** in a way that reveals a missing or inaccurate rule?
4. **Did a new repeatable pattern emerge** that would benefit from being a skill?

If the answer to any of these is yes — act. If all answers are no — do nothing.

### 1.3. Decision framework — what to update

Classify the new knowledge:

| Category | Target | Examples |
|---|---|---|
| Convention, constraint, workflow, process, tool config | **Rule** (`.claude/rules/`) | "freezed is used for all models", "don't import from gen/ directly" |
| Repeatable multi-step action or automation | **Skill** (`.claude/skills/`) | "deploy to staging", "create a new module" |
| Both a convention AND a repeatable action | **Rule + Skill** | A new workflow with both constraints and concrete steps |
| Ephemeral, already in code/git, obvious from context | **Nothing** | "the test passes now", "fixed typo in file X" |

Decision steps:

1. **Is it project knowledge worth persisting?** If no (ephemeral, derivable from code/git) → do nothing.
2. **Does an existing rule or skill already cover it?** If yes → update the existing file.
3. **Is it a constraint/convention/process?** → Create or update a **rule**.
4. **Is it a repeatable action with steps?** → Create or update a **skill**.
5. **Is it both?** → Update/create **both**.

### 1.4. When to update rules

- A rule is inaccurate or incomplete — discovered during work.
- The user corrected your behavior — persist the correction.
- New details emerged about a workflow, tool, or convention.
- A new convention, constraint, or process was introduced.

### 1.5. When to update skills

- A new repeatable multi-step pattern emerged.
- An existing skill is inaccurate or needs new steps.
- A new automation or workflow with concrete steps was established.

### 1.6. When to delete rules or skills

- The user explicitly says a rule or skill is no longer relevant.
- The workflow or convention described has been removed from the project.

### 1.7. How to manage rules and skills

- All rule files live in `.claude/rules/` and must follow `ai-rule-file-rule.md`.
- All skill files live in `.claude/skills/<skill-name>/SKILL.md` and must follow `ai-skill-file-rule.md`.
- Before creating a new file, check if an existing one already covers the topic — prefer updating over creating duplicates.
- Keep rules focused: one topic per file.
- Do this **at the end of the task**, after the main work is done — do not interrupt the task.

### 1.8. Mandatory validation after creating or updating rules and skills

**CRITICAL — every time you create or update a rule or skill file, immediately validate it:**

1. Re-read `ai-rule-file-rule.md` (for rules) or `ai-skill-file-rule.md` (for skills) to refresh the format requirements.
2. Check the created/updated file against all format requirements: header (frontmatter), body structure, examples section necessity.
3. If the file does not comply — fix it immediately, before reporting completion to the user.

Do not rely on memory of the format — always re-read the format rule before validation. This prevents drift between what you think the format is and what it actually is.

### 1.9. What NOT to store

- Ephemeral or conversation-specific information.
- Personal user preferences (use personal memory for those).
- Information derivable from code or git history.

## 2. Rule examples

### 2.1. After task — learned new convention → rule

During task: implemented a new API endpoint and noticed the team always uses `@RestApi` with a specific base URL pattern.

AI self-assessment: this convention isn't in any rule → create/update `api-rule.md`.

### 2.2. After task — discovered repeatable pattern → skill

During task: deployed to staging by running 3 commands in a specific order.

AI self-assessment: this is a repeatable multi-step action → create `.claude/skills/deploy-staging/SKILL.md`.

### 2.3. After task — found rule inaccuracy → update rule

During task: ran `melos run` → `prepare` and discovered it doesn't prompt for package selection, but `scripts-rule.md` didn't mention this.

AI self-assessment: existing rule is incomplete → update `scripts-rule.md`.

### 2.4. After task — user corrected behavior → rule + possible skill

During task: user said "не используй melos exec, всегда через melos run".

AI self-assessment: this is a constraint (rule) and may affect existing skills → update `scripts-rule.md`, check skills for incorrect commands.

### 2.5. After task — nothing to update

During task: fixed a typo in a string literal.

AI self-assessment: nothing new learned, no rules or skills affected → do nothing.

### 2.6. Wrong — only updating when user explicitly asks

```
# Wrong: waiting for "запомни" or "remember"
AI: *finishes task, learned something new, does nothing*
User: "запомни, что prepare не спрашивает пакет"
AI: *only now updates the rule*

# Correct: updating autonomously
AI: *finishes task, notices the rule is incomplete, updates it immediately*
```

### 2.7. Wrong — asking the user what to update

```
# Wrong
AI: "Я заметил новую конвенцию. Куда сохранить — в rule или skill?"

# Correct
AI: *determines it's a convention → updates rule silently, informs user what was updated*
```

### 2.8. Wrong — saving to personal memory instead of rules

```
# Wrong
Write to ~/.claude/projects/.../memory/feedback_something.md

# Correct
Write to .claude/rules/something-rule.md
```
