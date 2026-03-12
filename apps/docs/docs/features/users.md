---
sidebar_position: 6
---

# Users

The Users module lets Admins and Managers manage staff accounts, roles, and access within the platform.

## User List

The left panel shows all users in a searchable, filterable list. Each entry displays:

- User avatar and full name
- Role badge
- Status indicator (green dot = Active, gray = Inactive)

Use the **search input** to find users by name, or filter by **role** using the dropdown.

## User Detail

Selecting a user opens their detail view in the right panel:

| Field | Description |
|-------|-------------|
| **Full name** | User's display name |
| **Email** | Login and contact email |
| **Phone** | Optional contact phone |
| **Role** | Assigned system role |
| **Status** | Active or Inactive |
| **Last login** | Timestamp of most recent session |
| **Joined** | Account creation date |
| **Projects assigned** | Number of projects the user is linked to |
| **Total actions** | Audit count of actions performed |

## User Roles

| Role | Access Level |
|------|--------------|
| **Admin** | Full access — manage users, projects, funds, vendors |
| **Manager** | Create/edit projects and vendors; view fund data |
| **Field** | View projects; record distributions in the field |
| **Finance** | Full access to Fund Management; read-only on other modules |
| **Viewer** | Read-only access across all modules |

See [User Roles Overview](../user-roles/overview) for a detailed permissions matrix.

## User Actions

From the detail panel:

- **Edit** — update name, phone, role, or status
- **Reset password** — trigger a password reset email

:::caution
Only **Admins** can change a user's role or deactivate accounts.
:::
