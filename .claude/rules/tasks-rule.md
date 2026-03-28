## Task Workflow

Tasks are stored as .md files in the `tasks/` folder:
- `tasks/todo/` — tasks to be done
- `tasks/done/` — completed tasks

### When working on a task:
1. Read the task file from `tasks/todo/`
2. Execute the work described
3. Update the task: set **Status** to DONE, check off acceptance criteria
4. Move the file from `tasks/todo/` to `tasks/done/`

### Task file format:
```markdown
# Task Title

**Status**: TODO | IN_PROGRESS | DONE
**Priority**: P0 | P1 | P2
**Category**: security | ux | feature | infra | quality

## Description
## Acceptance Criteria
## Notes
```
