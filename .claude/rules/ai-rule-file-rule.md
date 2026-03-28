---
description: This rule applies to AI rule files and ensures that they follow the specified format and guidelines
paths:
  - ".claude/rules/**/*.md"
---

# Rule: AI rule file

## 1. Rule description

### 1.1. AI rule file content

AI rule file must contain the following sections:

- header section
- body section
- examples section (optional — see 1.5)

### 1.2. AI rule file header section

AI rule file header section must contain the following lines:

```
---
description: Short summary of the rule
paths: File patterns that the rule applies to, as a YAML list. Like **/*.dart, **/*.kt, **/*.swift and others
---
```

Supported frontmatter attributes: `description`, `paths`. Do NOT use `name` or any other attributes — they are not supported.

### 1.2.1. When to use paths and when to omit

The `paths` field controls **when** the rule is loaded into context:

- **With paths** — the rule is loaded only when the user works with files matching the glob patterns. Use this for rules scoped to specific file types or directories.
- **Without paths** — the rule is **always loaded** into every conversation. Use this for critical system-wide rules that must always be active (e.g., language settings, memory policy, conversation-start checks).

**Decision framework:**

1. Is the rule about **code conventions, patterns, or structure** tied to specific file types? → Add `paths` with the relevant globs (e.g., `"**/*.dart"`, `"**/pubspec.yaml"`).
2. Is the rule about **a specific layer, directory, or module**? → Add `paths` scoped to that location (e.g., `"modules/feature/**/lib/src/presentation/**/*.dart"`).
3. Is the rule about **AI behavior, process, tooling, or system-wide policy** not tied to specific files? → Omit `paths` (always loaded).
4. Is the rule a **meta-rule** about other rule/skill files? → Add `paths` pointing to those files (e.g., `".claude/rules/**/*.md"`).

**How to determine the right glob patterns:**

- Use the **narrowest pattern** that covers all files the rule applies to. Avoid `"**/*.dart"` if the rule only applies to presentation layer — use `"modules/feature/**/lib/src/presentation/**/*.dart"` instead.
- Combine multiple patterns when the rule applies to different file types (e.g., `"**/*.dart"` + `"**/translations/*.json"` for localization).
- Never include paths to files that are not edited manually (e.g., `.fvm/**`, `lib/gen/**`) — rules trigger on files the user works with.
- `"**/*.dart"` is appropriate for broad Dart conventions (code style, DI, API patterns) that apply across the entire codebase.

### 1.3. AI rule file body section

AI rule file body section must contain a detailed description of the rule, including examples and explanations. The body section should be written in markdown format and can include headings, lists, code blocks, and other markdown elements to enhance readability and clarity.

The body section must begin with the rule name as a top-level heading (e.g., `# Rule: Rule name`).
It must then contain a numbered section `## 1. Rule description` with further numbered subsections (e.g., `### 1.1.`, `### 1.2.`, etc.) to describe the rule in detail.

```
# Rule: Rule name

## 1. Rule description

### 1.1. Rule section 1

Description of section 1.

### 1.2. Rule section 2

Description of section 2.
```

### 1.4. AI rule file examples section

The examples section is **optional**. Before adding it, analyze whether the rule actually benefits from examples (see 1.5).

When included, the examples section must contain code examples that illustrate the rule in practice. The examples should be relevant to the rule and should demonstrate both correct usage and incorrect usage (optional) of the rule. The examples should be written in the programming languages specified in the `paths` field of the header section, and should be formatted as code blocks in markdown. Each example should be placed in its own numbered subsection (e.g., `### 2.1.`, `### 2.2.`, etc.), grouped by use case. Subsections can also be grouped by language if the rule applies to multiple languages — this is just one possible case.

### 1.5. When examples are needed and when they are not

Always analyze whether a rule needs examples. Include examples when:

- The rule defines **code patterns or conventions** (naming, structure, API usage) — examples show the exact expected format.
- The rule has **right vs wrong** ways of doing things — examples clarify the boundary.
- The rule involves **non-obvious commands or workflows** with specific syntax — examples prevent mistakes.

Omit examples when:

- The rule is a **simple policy or toggle** (enable/disable something) — the description alone is sufficient.
- The rule is **purely declarative** with no ambiguity in how to follow it.
- Adding examples would just **restate the description** in a different form without adding clarity.

````
## 2. Rule examples

### 2.1. Use case 1

```language
// code example
```

### 2.2. Use case 2

```language
// code example
```
````

## 2. Rule examples

### 2.1. Full ai rule file example

This example demonstrates the complete structure of a ai rule file with header, body, and examples sections.

````md
---
description: This is an example of a Rule file
paths:
  - "**/*.dart"
  - "**/*.kt"
  - "**/*.swift"
---

# Rule: Example

## 1. Rule description

### 1.1. Example rule section 1

This is an example of a Rule file. It contains a section with metadata about the rule and a body section with a detailed description of the rule.

### 1.2. Example rule section 2

The rule states that all variable names must be in camelCase format. This means that the first letter of the variable name should be lowercase, and each subsequent word should start with an uppercase letter. For example, `myVariableName` is a valid variable name, while `MyVariableName` is not.

## 2. Examples

### 2.1. Valid variable name

```dart
var myVariableName = 'Hello, World!';
```

### 2.2. Invalid variable name

```dart
// Wrong: first letter is uppercase
var MyVariableName = 'Hello, World!';
```
````