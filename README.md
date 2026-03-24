# Rahat v2

Rahat is an open-source humanitarian aid distribution platform built as a plugin-based monorepo. It supports multiple project types (CVA, AA, etc.) and is designed to be modular — you only run what you need.

## Project Structure

```
apps/
  api/     — NestJS backend (REST/OpenAPI)
  web/     — React frontend (TanStack Router + Vite)
  docs/    — Docusaurus documentation site

packages/
  db/               — Database client and schema
  plugin-sdk/       — SDK for building plugins
  projects-shared/  — Shared utilities across project plugins
  sdk/              — Core Rahat SDK
  ui/               — Shared UI components (shadcn/ui)
  validators/       — Shared validation schemas

plugins/            — Core feature plugins (always available)
  core-dashboard/
  core-fund-management/
  core-vendors/
  core-forecast/
  core-reports/
  benefits-*/       — Benefit type plugins (cash, food, NFI, etc.)
  comms-*/          — Communication plugins (SMS, WhatsApp, Slack, etc.)
  task-*/           — Task plugins (benefits, call, SMS, etc.)

projects/           — Project-type plugins (domain-specific)
  cva/              — Cash and Voucher Assistance
  aa/               — Anticipatory Action
  beneficiary/      — Beneficiary management
  microlearning/
  microloans/
```

## Plugin Architecture

Rahat uses a plugin-based architecture. Both `plugins/` and `projects/` are Turborepo workspace packages loaded selectively at runtime.

- **Core plugins** (`plugins/`) provide reusable features like dashboards, vendor management, fund tracking, communication channels, and task types.
- **Project plugins** (`projects/`) implement domain-specific project logic (e.g., CVA distributes vouchers, AA responds to forecast triggers).

Plugins are scoped under `@rahataid/plugin-*` and consumed by the `api` and `web` apps.

## Development

### Requirements

- Node.js `^23.7.0`
- pnpm `^10.19.0`

### Setup

```bash
pnpm install
cp .env.example .env
# Fill in your environment variables
```

### Running Dev (Selective — Recommended)

Rather than starting every package, use the selective dev command which reads from `dev.config.json`:

```bash
pnpm dev:select
```

This starts only the packages listed in the `active` array of `dev.config.json`.

#### `dev.config.json`

Located at the repo root, this file controls which packages are started during development:

```json
{
  "active": [
    "api",
    "web",
    "@rahataid/plugin-core-dashboard",
    "@rahataid/plugin-core-fund-management",
    "@rahataid/plugin-core-vendors",
    "@rahataid/plugin-project-cva",
    "@rahataid/plugin-core-forecast"
  ],
  "available": {
    "core": ["api", "web"],
    "projects": [
      "@rahataid/plugin-project-aa",
      "@rahataid/plugin-project-beneficiary",
      "@rahataid/plugin-project-cva",
      "@rahataid/plugin-project-microlearning",
      "@rahataid/plugin-project-microloans"
    ],
    "plugins": []
  }
}
```

- **`active`** — packages that will be started when you run `pnpm dev:select`
- **`available`** — reference list of all known packages grouped by type

To add or remove a plugin from your dev session, edit the `active` array and re-run `pnpm dev:select`.

### Running All Packages

To start everything (not recommended for most workflows):

```bash
pnpm dev
```

### Individual Apps

```bash
pnpm dev:api   # API only
pnpm dev:web   # Web only
```

## Other Commands

```bash
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm lint:fix     # Auto-fix lint issues
pnpm typecheck    # Run TypeScript checks
pnpm ui-add       # Add a new shadcn/ui component
pnpm clean        # Remove all node_modules, dist, .turbo, .cache
```

## Docs

```bash
cd apps/docs
pnpm dev
```

Documentation is built with Docusaurus and covers project setup, plugin development, and API references.
