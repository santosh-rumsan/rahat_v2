# Routing and Layout Architecture

## TanStack Router — File-Based Routing

Rahat v2 uses TanStack Router with **file-based route generation**. Routes are defined as files in `apps/web/src/routes/`, and a Vite plugin automatically generates the route tree at build time.

## Route File Naming Convention

```
Filename                                    →  URL Path
─────────────────────────────────────────────────────────────
__root.tsx                                  →  (root layout)
_app.tsx                                    →  / (app layout wrapper)
_app.projects.index.tsx                     →  /projects
_app.projects.$id.tsx                       →  /projects/:id (layout)
_app.projects.$id.index.tsx                 →  /projects/:id
_app.projects.$id.benefits.add.tsx          →  /projects/:id/benefits/add
_app.projects.$id.tasks.$taskId.edit.tsx    →  /projects/:id/tasks/:taskId/edit
_app.plugins.tsx                            →  /plugins
```

**Naming rules:**
- `_` prefix = layout route (wraps children, no own URL segment)
- `.` = path separator (`/`)
- `$` = dynamic parameter (`:param`)
- `index` = default route for a path segment

## Layout Hierarchy

```
__root.tsx
│
│  Provides: QueryClientProvider, SDK config, theme scripts
│
└─── _app.tsx
     │
     │  Provides: AppShell layout (sidebar + panel + main)
     │
     ├─── _app.projects.index.tsx          /projects
     │
     ├─── _app.projects.$id.tsx            /projects/:id (layout)
     │    │
     │    │  Provides: ProjectHeader with plugin menu items
     │    │
     │    ├─── _app.projects.$id.index.tsx              Dashboard
     │    ├─── _app.projects.$id.beneficiaries.tsx       Beneficiaries
     │    ├─── _app.projects.$id.benefits.add.tsx        Add benefit
     │    ├─── _app.projects.$id.tasks.index.tsx         Tasks list
     │    ├─── _app.projects.$id.tasks.$taskId.edit.tsx  Edit task
     │    └─── ...
     │
     ├─── _app.users.tsx                   /users
     ├─── _app.funds.tsx                   /funds
     ├─── _app.plugins.tsx                 /plugins
     └─── _app.settings.tsx                /settings
```

## Visual Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│ __root.tsx (QueryClientProvider + SDK + Theme)                      │
│                                                                    │
│ ┌──────┬──────────┬───────────────────────────────────────────────┐│
│ │      │          │                                               ││
│ │ Icon │ Optional │         Main Content Area                     ││
│ │ Side │ Panel    │                                               ││
│ │ bar  │ (list /  │  ┌─────────────────────────────────────────┐  ││
│ │      │  nav)    │  │ Project Header (plugin menu items)      │  ││
│ │ ┌──┐ │          │  ├─────────────────────────────────────────┤  ││
│ │ │🏠│ │          │  │                                         │  ││
│ │ ├──┤ │          │  │  Page Content                           │  ││
│ │ │📁│ │          │  │  (Route component)                      │  ││
│ │ ├──┤ │          │  │                                         │  ││
│ │ │⚙│ │          │  │  Rendered by <Outlet />                  │  ││
│ │ ├──┤ │          │  │                                         │  ││
│ │ │🔌│ │          │  │                                         │  ││
│ │ └──┘ │          │  └─────────────────────────────────────────┘  ││
│ │      │          │                                               ││
│ └──────┴──────────┴───────────────────────────────────────────────┘│
│                                                                    │
│  AppShell: [sidebar] [panel?] [main content (children)]            │
└────────────────────────────────────────────────────────────────────┘
```

## Route Component Pattern

Every route file follows the TanStack Router convention:

```typescript
// apps/web/src/routes/_app.projects.index.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/projects/')({
  component: ProjectsPage,
  // Optional: validateSearch, beforeLoad, loader
})

function ProjectsPage() {
  // Route.useParams(), Route.useSearch(), useNavigate()
  return <div>...</div>
}
```

## Route Features

| Feature | Usage |
|---------|-------|
| Params | `Route.useParams()` → `{ id: string }` |
| Search params | `Route.useSearch()` with `validateSearch` |
| Navigation | `useNavigate()` with type-safe paths |
| Code splitting | Automatic via file-based routes |
| Scroll restoration | Configured in `router.tsx` |
| Pending UI | Loading component while routes resolve |

## How Project Plugins Extend Navigation

When a project is viewed, its plugin provides `menuItems` that populate the project header:

```
Plugin defines:                     Renders as:
─────────────                       ──────────
menuItems: [                        ┌─────────────────────────────────┐
  {                                 │ Project Name                     │
    type: 'link',                   │                                  │
    label: 'Beneficiaries',  ──────▶│ [Dashboard] [Beneficiaries]     │
    href: '/beneficiaries'          │ [Tasks ▼]  [Benefits]           │
  },                                │                                  │
  {                                 └─────────────────────────────────┘
    type: 'dropdown',
    label: 'Tasks',
    items: [...]
  }
]
```
