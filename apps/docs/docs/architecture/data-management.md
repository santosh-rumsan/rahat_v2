# Data Management Architecture

Rahat v2 uses a layered data architecture: **React Query** for server state, **SDK service factories** for data access, and **LocalStorage** for client preferences.

## Data Flow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Components                            │
│                                                                     │
│   Route Pages    Shared Components    Plugin Components             │
│       │                │                     │                      │
│       └────────────────┴──────────┬──────────┘                      │
│                                   │                                 │
│                          useQuery / useMutation                     │
│                          (custom hooks)                             │
└───────────────────────────────────┬─────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────┐
│              React Query Layer    │                                  │
│                                   │                                  │
│  ┌──────────────────┐  ┌─────────▼──────────┐  ┌────────────────┐  │
│  │ apps/web/src/lib/ │  │packages/projects-  │  │  Query Client  │  │
│  │                   │  │shared/src/         │  │                │  │
│  │ • user/queries.ts │  │ • beneficiary/     │  │ Provided in    │  │
│  │ • fund/queries.ts │  │   queries.ts       │  │ __root.tsx     │  │
│  │                   │  │ • task-management/ │  │                │  │
│  │                   │  │   queries.ts       │  │ Auto-caching   │  │
│  │                   │  │ • trigger-mgmt/    │  │ Background     │  │
│  │                   │  │   queries.ts       │  │ refetch        │  │
│  │                   │  │ • communication/   │  │ Optimistic     │  │
│  │                   │  │   hooks.ts         │  │ updates        │  │
│  └──────────────────┘  └─────────┬──────────┘  └────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────┐
│                SDK Layer          │                                  │
│                (@rahataid/sdk)    │                                  │
│                                   │                                  │
│   configureSDK({ apiUrl, isDev }) │                                  │
│                                   │                                  │
│   ┌───────────────────────────────▼──────────────────────────────┐  │
│   │              Service Factories                                │  │
│   │                                                               │  │
│   │  createBeneficiaryService()   createProjectService()         │  │
│   │  createUserService()          createVendorService()          │  │
│   │  createFundService()          createTaskService()            │  │
│   │  createBenefitService()       createCampaignService()        │  │
│   │  createTokenService()         createTriggerService()         │  │
│   └──────────────────┬────────────────────────┬──────────────────┘  │
│                       │                        │                     │
│              ┌────────▼──────┐        ┌────────▼──────┐             │
│              │   REST API    │        │   IndexedDB   │             │
│              │   adapter     │        │   adapter     │             │
│              └────────┬──────┘        └───────────────┘             │
└───────────────────────┼─────────────────────────────────────────────┘
                        │
               ┌────────▼────────┐
               │  NestJS Backend │
               │  (apps/api)     │
               └─────────────────┘
```

## Query Hook Pattern

All data access follows a consistent pattern using **query key factories** and **custom hooks**:

```typescript
// Example: apps/web/src/lib/user/queries.ts

// 1. Define query keys
export const userKeys = {
  all: ['users'],
  detail: (id: string) => ['users', id],
}

// 2. Define query hooks
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => createUserService().list(),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => createUserService().get(id),
  })
}

// 3. Define mutation hooks with cache invalidation
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => createUserService().create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
```

## Query Key Strategy

Keys are structured hierarchically for targeted cache invalidation:

```
                     ['users']                    ← invalidates all user queries
                        │
            ┌───────────┴───────────┐
     ['users', 'abc']        ['users', 'xyz']    ← individual user detail

             ['beneficiaries', projectId]         ← scoped to project
                        │
            ┌───────────┴───────────┐
  ['beneficiaries',        ['beneficiaries',
   projectId, 'abc']        projectId, 'xyz']

             ['tasks', projectId]                 ← scoped to project
             ['tasks', 'detail', taskId]          ← individual task
```

**Scope patterns:**
- **Global entities** — `['users']`, `['funds']`
- **Project-scoped entities** — `['beneficiaries', projectId]`, `['tasks', projectId]`
- **Detail views** — `['users', id]`, `['tasks', 'detail', id]`

## Where Queries Live

Queries are split between two locations based on scope:

| Location | What | Example |
|----------|------|---------|
| `apps/web/src/lib/` | App-level entities (users, funds) | `lib/user/queries.ts` |
| `packages/projects-shared/src/` | Project-scoped entities (beneficiaries, tasks, triggers, campaigns) | `beneficiary/queries.ts` |

This split allows `projects-shared` hooks to be reused across multiple project plugins without depending on `apps/web`.

## Client State (LocalStorage)

Minimal client-side state is stored in LocalStorage for user preferences:

```
┌─────────────────────────────────────────┐
│            LocalStorage Keys            │
│                                         │
│  rahat:plugin-states   → { id: bool }   │
│  rahat:color-theme     → "orange"       │
│  rahat:font            → "outfit"       │
│  rahat:settings        → { ... }        │
│                                         │
└─────────────────────────────────────────┘
```

| Store | File | Keys |
|-------|------|------|
| Plugin state | `plugins/plugin-state.ts` | `rahat:plugin-states` |
| Color theme | `lib/color-theme-store.ts` | Theme name (orange, violet, sky, rose, emerald, fuchsia) |
| Font | `lib/font-store.ts` | Font family (outfit, inter, plus-jakarta-sans, etc.) |
| Settings | `lib/settings-store.ts` | `enabledProjectTypes`, `enabledBlockchains` |

## SDK Configuration

The SDK is initialized once at the root layout:

```typescript
// apps/web/src/routes/__root.tsx
configureSDK({ apiUrl: import.meta.env.VITE_API_URL, isDev: true })
```

The SDK provides **dual adapters** — REST API (default) and IndexedDB — through a unified service factory interface. Components never interact with HTTP or storage directly.

## Data Flow Example: Creating a Beneficiary

```
User fills form
       │
       ▼
BeneficiaryForm component
       │
       ▼
useCreateBeneficiary()           ← custom hook (projects-shared)
       │
       ▼
useMutation({
  mutationFn: (data) =>
    createBeneficiaryService()   ← SDK factory
      .create(projectId, data)
})
       │
       ▼
POST /api/projects/:id/beneficiaries   ← REST API call
       │
       ▼
onSuccess: invalidateQueries(['beneficiaries', projectId])
       │
       ▼
React Query refetches list       ← UI updates automatically
```
