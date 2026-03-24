# Plugin System Architecture

Rahat v2 uses a multi-tier plugin system that allows domain features to be developed, registered, and toggled independently.

## Plugin Types

There are **5 distinct plugin categories**, each with its own registry and interface:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Plugin Categories                          │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │ PROJECT PLUGINS  │  │  APP PLUGINS    │  │ TASK PLUGINS  │  │
│  │                  │  │                 │  │               │  │
│  │ • CVA            │  │ • Dashboard     │  │ • SMS         │  │
│  │ • AA             │  │ • Vendors       │  │ • Voice       │  │
│  │ • Beneficiary    │  │ • Fund Mgmt     │  │ • Benefits    │  │
│  │ • Microlearning  │  │ • Forecast      │  │               │  │
│  │ • Microloans     │  │ • Reports       │  │               │  │
│  └─────────────────┘  └─────────────────┘  └───────────────┘  │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │ COMMUNICATION PLUGINS   │  │    BENEFIT PLUGINS          │  │
│  │                          │  │                             │  │
│  │ • SMS                    │  │ • Cash                      │  │
│  │ • WhatsApp               │  │ • Food                      │  │
│  │ • Voice                  │  │ • WASH                      │  │
│  │ • Slack                  │  │ • NFI                       │  │
│  │                          │  │ • Service                   │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Registration Flow

All plugins are registered in `apps/web/src/plugins/index.ts`:

```
                    apps/web/src/plugins/index.ts
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                     │
    ┌────▼─────┐      ┌──────▼──────┐     ┌───────▼──────┐
    │ Explicit  │      │  Explicit   │     │ Self-Register│
    │ Register  │      │  Register   │     │  (side-      │
    │           │      │             │     │   effect     │
    │registerPl │      │registerApp  │     │   imports)   │
    │ugin()     │      │Plugin()     │     │              │
    └────┬──────┘      └──────┬──────┘     └──────┬───────┘
         │                    │                    │
   ┌─────▼──────┐   ┌────────▼───────┐   ┌───────▼────────┐
   │  registry   │   │  app-registry  │   │ Task, Comms,   │
   │  .ts        │   │  .ts           │   │ Benefit        │
   │             │   │                │   │ registries     │
   │ Project[]   │   │ AppPlugin[]    │   │ (in packages/  │
   │             │   │                │   │ projects-      │
   │             │   │                │   │ shared)        │
   └─────────────┘   └────────────────┘   └────────────────┘
```

### Project Plugins — Explicit Registration

```typescript
// apps/web/src/plugins/registry.ts
const plugins: ProjectFrontendPlugin[] = []
export function registerPlugin(plugin: ProjectFrontendPlugin): void {
  plugins.push(plugin)
}
```

Each project plugin provides:
- `projectType` — unique identifier (e.g., `"CVA"`, `"ANTICIPATORY_ACTION"`)
- `SetupPage` — React component for project creation
- `DashboardPage` — React component for project dashboard
- `menuItems` — navigation items for the project sidebar
- `taskGroups` — available task groups
- `triggerPhases` — trigger pipeline phases

### App Plugins — Explicit Registration

```typescript
// apps/web/src/plugins/app-registry.ts
const appPlugins: AppFrontendPlugin[] = []
export function registerAppPlugin(plugin: AppFrontendPlugin): void {
  appPlugins.push(plugin)
}
```

Each app plugin provides:
- `id` — unique identifier (e.g., `"dashboard"`, `"vendors"`)
- `route` — URL path for the page
- `PageComponent` — React component to render
- `group: 'core'` — plugin category

### Task / Communication / Benefit Plugins — Self-Registration

These plugins self-register via side-effect imports:

```typescript
// Example: plugins/task-sms/src/index.ts
import { registerTaskType } from '@rahataid/projects-shared'
registerTaskType({ type: 'sms', designer: SmsDesigner, designerTabLabel: 'SMS' })
```

Simply importing the package triggers registration:

```typescript
// apps/web/src/plugins/index.ts
import '@rahataid/plugin-task-sms'      // self-registers
import '@rahataid/plugin-comms-sms'     // self-registers
import '@rahataid/plugin-benefits-cash' // self-registers
```

## Plugin State Management

Plugin enable/disable state is managed via **LocalStorage** with custom events:

```
┌──────────────┐     ┌────────────────────┐     ┌──────────────┐
│  Plugins UI  │────▶│  plugin-state.ts    │────▶│ localStorage │
│  (toggle)    │     │                    │     │              │
│              │◀────│  setPluginEnabled() │     │ Key:         │
│              │     │  isPluginEnabled()  │     │ rahat:       │
│              │     │                    │     │ plugin-      │
│              │     │  Dispatches event:  │     │ states       │
│              │     │  'rahat:plugin-     │     └──────────────┘
│              │     │   state-change'     │
└──────────────┘     └─────────┬──────────┘
                               │
                               │ CustomEvent
                               ▼
                     ┌──────────────────┐
                     │  PluginGate      │
                     │  component       │
                     │                  │
                     │  Listens for     │
                     │  state changes   │
                     │  Shows/hides     │
                     │  route content   │
                     └──────────────────┘
```

- Default: all plugins **enabled**
- State stored as: `{ "pluginId": true/false }`
- Changes broadcast via `window.dispatchEvent(new Event('rahat:plugin-state-change'))`
- `PluginGate` component wraps routes and shows a disabled screen when the plugin is off

## Plugin Interface Definitions

All plugin interfaces are defined in `packages/plugin-sdk/src/index.ts`:

```typescript
interface ProjectFrontendPlugin {
  projectType: string
  label: string
  description?: string
  icon?: string
  menuItems?: MenuItem[]
  taskGroups?: string[]
  triggerPhases?: string[]
  SetupPage: (props: SetupPageProps) => unknown
  DashboardPage?: (props: DashboardPageProps) => unknown
}

interface AppFrontendPlugin {
  id: string
  label: string
  description?: string
  icon?: string
  group: 'core'
  route: string
  PageComponent: () => unknown
}
```

## Adding a New Plugin

### New Project Plugin

1. Create a new package in `projects/my-project/`
2. Implement `ProjectFrontendPlugin` interface in `src/frontend/index.ts`
3. Register in `apps/web/src/plugins/index.ts`:
   ```typescript
   import { MyProjectPlugin } from '@rahataid/plugin-project-my-project/frontend'
   registerPlugin(MyProjectPlugin)
   ```

### New Task/Comms/Benefit Plugin

1. Create a new package in `plugins/task-my-type/` (or `comms-*`, `benefits-*`)
2. Call the appropriate `register*()` function at module level
3. Add the side-effect import in `apps/web/src/plugins/index.ts`:
   ```typescript
   import '@rahataid/plugin-task-my-type'
   ```
