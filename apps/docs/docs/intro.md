---
sidebar_position: 1
---

# Introduction

**Rahat v2** is a humanitarian aid distribution management platform built for relief organizations coordinating disaster response across Nepal and similar contexts.

## What Rahat Does

Rahat helps organizations manage the full lifecycle of aid distribution:

- Track **projects** with budgets, beneficiaries, and timelines
- Disburse funds using **digital tokens** (QR/NFC), **SMS**, and **IVR** communications
- Manage **vendors** who redeem tokens and receive project allocations
- Administer **users** with role-based access across the organization
- Monitor the **treasury** — total funds, allocations, and spending per project

## Core Modules

| Module | Description |
|--------|-------------|
| [Dashboard](./features/dashboard) | Real-time KPIs and project activity overview |
| [Projects](./features/projects) | Create and monitor disaster relief projects |
| [Services](./features/services) | Configure SMS, IVR, and token distribution services |
| [Fund Management](./features/fund-management) | Treasury, allocations, and transaction history |
| [Vendors](./features/vendors) | Manage vendors participating in distributions |
| [Users](./features/users) | Administer staff accounts and role-based access |

## API Reference

| Endpoint Group | Description |
|----------------|-------------|
| [Projects](./api/projects) | CRUD operations for relief projects |
| [Users](./api/users) | Manage staff accounts and role assignments |
| [Vendors](./api/vendors) | Manage vendors in distributions |
| [Services](./api/services) | Configure SMS, IVR, and token services |
| [Fund Management](./api/fund-management) | Treasury, allocations, and transactions |

## User Roles

Rahat uses five roles to control access across the platform. See [User Roles Overview](./user-roles/overview) for details.

## Tech Stack

- **Frontend**: React (TanStack Router), Tailwind CSS, `@rs/ui` component library
- **Backend**: TBD (API layer not yet documented)
- **Monorepo**: Turborepo with pnpm workspaces
