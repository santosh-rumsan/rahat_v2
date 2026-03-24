# Frontend Architecture Overview

This document describes the frontend architecture of Rahat v2 — a plugin-based monorepo built with React, TanStack Router, and React Query.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          apps/web (Vite + React 19)                 │
│                                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │   Routes    │  │   Layouts    │  │        Plugin System         │ │
│  │ (TanStack   │  │ (AppShell,   │  │  ┌────────┐ ┌────────────┐  │ │
│  │  Router)    │  │  Sidebar,    │  │  │Project │ │   App      │  │ │
│  │             │  │  Headers)    │  │  │Plugins │ │  Plugins   │  │ │
│  └──────┬─────┘  └──────┬───────┘  │  └────────┘ └────────────┘  │ │
│         │               │          │  ┌────────┐ ┌────────────┐  │ │
│         │               │          │  │ Task   │ │   Comms    │  │ │
│         │               │          │  │Plugins │ │  Plugins   │  │ │
│         │               │          │  └────────┘ └────────────┘  │ │
│         │               │          │  ┌────────────────────────┐  │ │
│         │               │          │  │   Benefit Plugins      │  │ │
│         │               │          │  └────────────────────────┘  │ │
│         │               │          └──────────────────────────────┘ │
│         │               │                                           │
│  ┌──────┴───────────────┴──────────────────────────────────────┐   │
│  │                    Data Layer (React Query)                  │   │
│  │     apps/web/src/lib/  +  packages/projects-shared/         │   │
│  └─────────────────────────┬───────────────────────────────────┘   │
│                             │                                       │
│  ┌──────────────────────────┴──────────────────────────────────┐   │
│  │                     SDK (@rahataid/sdk)                      │   │
│  │        Service factories → REST API / IndexedDB              │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                     ┌─────────┴─────────┐
                     │   NestJS Backend   │
                     │   (apps/api)       │
                     └───────────────────┘
```

## Monorepo Package Dependency Graph

```
apps/web
  ├── @rs/ui                          (UI primitives — Radix + Tailwind)
  ├── @rahataid/plugin-sdk            (Plugin interfaces & types)
  ├── @rahataid/sdk                   (Data access layer)
  ├── @rahataid/projects-shared       (Shared project UI components & hooks)
  │
  ├── Project Plugins (projects/)
  │   ├── plugin-project-cva
  │   ├── plugin-project-aa
  │   ├── plugin-project-beneficiary
  │   ├── plugin-project-microlearning
  │   └── plugin-project-microloans
  │
  ├── App Plugins (plugins/)
  │   ├── plugin-core-dashboard
  │   ├── plugin-core-vendors
  │   ├── plugin-core-fund-management
  │   ├── plugin-core-forecast
  │   └── plugin-core-reports
  │
  ├── Task Plugins (plugins/)
  │   ├── plugin-task-sms
  │   ├── plugin-task-voice
  │   └── plugin-task-benefits
  │
  ├── Communication Plugins (plugins/)
  │   ├── plugin-comms-sms
  │   ├── plugin-comms-whatsapp
  │   ├── plugin-comms-voice
  │   └── plugin-comms-slack
  │
  └── Benefit Plugins (plugins/)
      ├── plugin-benefits-cash
      ├── plugin-benefits-food
      ├── plugin-benefits-wash
      ├── plugin-benefits-nfi
      └── plugin-benefits-service
```

## Technology Stack

| Concern | Technology |
|---------|-----------|
| Framework | React 19 |
| Build tool | Vite |
| Routing | TanStack Router (file-based) |
| Server state | TanStack Query (React Query) |
| Client state | LocalStorage + custom events |
| UI components | Radix UI + shadcn (via `@rs/ui`) |
| Styling | Tailwind CSS + CVA |
| Icons | Lucide React |
| Monorepo | Turborepo with workspace packages |

## Key Principles

1. **Plugin-first** — All domain features (project types, tasks, communications, benefits) are self-contained plugins
2. **Layered composition** — Clear separation: routes → shared components → SDK → API
3. **Type-safe routing** — TanStack Router provides compile-time route safety
4. **Server state as source of truth** — React Query manages all server data; minimal client-side state
5. **No global store** — No Redux/Zustand; React Query + LocalStorage covers all needs
