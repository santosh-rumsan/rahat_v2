---
sidebar_position: 1
---

# User Roles Overview

Rahat v2 uses five roles to enforce access control across the platform.

## Roles

| Role | Description |
|------|-------------|
| **Admin** | Full platform access. Manages users, projects, funds, vendors, and services. |
| **Manager** | Operational role. Creates and edits projects and vendors. Views fund data but cannot move money. |
| **Field** | Field-worker role. Views assigned projects and records aid distributions on the ground. |
| **Finance** | Financial oversight. Full access to Fund Management. Read-only on other modules. |
| **Viewer** | Read-only access across all modules. Suitable for observers or auditors. |

## Permissions Matrix

| Module | Admin | Manager | Field | Finance | Viewer |
|--------|:-----:|:-------:|:-----:|:-------:|:------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Projects (view) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Projects (create/edit) | ✓ | ✓ | — | — | — |
| Services (view) | ✓ | ✓ | — | — | ✓ |
| Services (configure) | ✓ | — | — | — | — |
| Fund Management (view) | ✓ | ✓ | — | ✓ | ✓ |
| Fund Management (distribute) | ✓ | — | — | ✓ | — |
| Vendors (view) | ✓ | ✓ | ✓ | — | ✓ |
| Vendors (create/edit) | ✓ | ✓ | — | — | — |
| Users (view) | ✓ | ✓ | — | — | — |
| Users (create/edit/deactivate) | ✓ | — | — | — | — |

## Assigning Roles

Roles are assigned by **Admins** from the [Users](../features/users) module. A user's role can be updated at any time from their detail view.
