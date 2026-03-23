# Rahat

## Project structure

```
apps/
  api/     — NestJs backend (OpenAPI spec)
  web/     — React frontend (TanStack Router)
  docs/    — Docusaurus documentation site
packages/  — Shared packages (UI, config, etc.)
projects/  — Project plugins (CVA, AA, etc.)
plugins/   — Core Rahat plugins (project management, tasks)
```

when creating add edit feature in ui, do not create in popup format, unless I specifically ask for it. Instead, create a new page for the feature.

## LLMDEX — Semantic Search

This project can be searched using `llmdex` — a local semantic search tool.
Use it **instead of Grep** for broad code searches. Use Grep only for precise, targeted lookups within files found by llmdex.

### Search workflow

1. Run `llmdex query "your question"` to find relevant files and code sections
2. Use Grep or Read on the found files for detailed analysis

```bash
llmdex query "your question"
llmdex query -k 10 "your question"   # more results
```

`llmdex query` will exit with an error if this project is not indexed. If that happens, fall back to Grep/Glob.
