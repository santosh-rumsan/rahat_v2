# Component Architecture

## Component Layers

Components are organized in a layered hierarchy across multiple packages:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Layer 1: Route Pages                          │
│                    (apps/web/src/routes/)                        │
│                                                                 │
│    Page-level components that compose shared components          │
│    One file per route, minimal logic                            │
└──────────────────────────────┬──────────────────────────────────┘
                               │ imports
┌──────────────────────────────▼──────────────────────────────────┐
│                    Layer 2: Shared Domain Components             │
│                    (packages/projects-shared/src/)               │
│                                                                 │
│    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│    │ Beneficiary  │ │    Task      │ │  Benefits    │          │
│    │              │ │              │ │              │          │
│    │ • List       │ │ • Form       │ │ • FormPage   │          │
│    │ • Form       │ │ • Edit       │ │ • TokenAssign│          │
│    │ • Detail     │ │ • Preview    │ │ • TypeSelect │          │
│    │ • Import     │ │ • Status     │ │              │          │
│    └──────────────┘ └──────────────┘ └──────────────┘          │
│    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│    │Communication │ │   Trigger    │ │   Vendor     │          │
│    │              │ │              │ │              │          │
│    │ • Campaign   │ │ • Statement  │ │ • List       │          │
│    │   Form       │ │   Detail     │ │ • Detail     │          │
│    │ • Campaign   │ │ • Config     │ │              │          │
│    │   Detail     │ │              │ │              │          │
│    │ • Module     │ │              │ │              │          │
│    └──────────────┘ └──────────────┘ └──────────────┘          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ imports
┌──────────────────────────────▼──────────────────────────────────┐
│                    Layer 3: Plugin Components                    │
│                    (projects/*/src/frontend/)                    │
│                    (plugins/*/src/frontend/)                     │
│                                                                 │
│    Plugin-specific pages: SetupPage, DashboardPage              │
│    Task designers, Comm type UIs, Benefit type UIs              │
└──────────────────────────────┬──────────────────────────────────┘
                               │ imports
┌──────────────────────────────▼──────────────────────────────────┐
│                    Layer 4: UI Primitives                        │
│                    (packages/ui/src/)                            │
│                                                                 │
│    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│    │ Button │ │ Input  │ │ Select │ │ Dialog │ │  Card  │     │
│    └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
│    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│    │  Tabs  │ │ Badge  │ │ Table  │ │Tooltip │ │ Form   │     │
│    └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
│                                                                 │
│    Built with: Radix UI + Tailwind CSS + CVA                    │
└─────────────────────────────────────────────────────────────────┘
```

## Layout Components

The app layout is composed of three core components in `apps/web/src/components/layout/`:

```
┌─────────────────────────────────────────────────────────────────┐
│                        AppShell                                  │
│                (app-shell.tsx)                                    │
│                                                                 │
│  Props: sidebar, panel?, children                                │
│  CSS: flex h-screen, 3-column layout                            │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐  │
│  │IconSidebar│  │  Panel   │  │     Main Content             │  │
│  │           │  │(optional)│  │                              │  │
│  │icon-      │  │          │  │  ┌────────────────────────┐  │  │
│  │sidebar.tsx│  │          │  │  │   ProjectHeader        │  │  │
│  │           │  │          │  │  │   (project-header.tsx)  │  │  │
│  │ • Logo    │  │          │  │  │                        │  │  │
│  │ • Nav     │  │          │  │  │   Dynamic menu from    │  │  │
│  │   items   │  │          │  │  │   active plugin        │  │  │
│  │ • Settings│  │          │  │  └────────────────────────┘  │  │
│  │ • Plugins │  │          │  │                              │  │
│  │           │  │          │  │  ┌────────────────────────┐  │  │
│  │           │  │          │  │  │   <Outlet />           │  │  │
│  │           │  │          │  │  │   (Route content)      │  │  │
│  │           │  │          │  │  └────────────────────────┘  │  │
│  └──────────┘  └──────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Styling Architecture

```
┌─────────────────────────────────────────────┐
│              Tailwind CSS                    │
│                                             │
│  Base layer         → Global resets         │
│  Component layer    → CVA variants          │
│  Utility layer      → Inline classes        │
│                                             │
│  Theme: data-theme="orange" on <html>       │
│  Font:  data-font="outfit" on <html>        │
│                                             │
│  Available themes:                          │
│  orange │ violet │ sky │ rose │             │
│  emerald │ fuchsia                          │
│                                             │
│  Available fonts:                           │
│  outfit │ inter │ plus-jakarta-sans │       │
│  josefin-sans │ lora                        │
└─────────────────────────────────────────────┘
```

## Component Reuse Pattern

Shared components in `packages/projects-shared` are designed to be reused across multiple project plugins:

```
                    projects/cva/
                         │
                         │  uses
                         ▼
            packages/projects-shared/
            ┌────────────────────────┐
            │  BeneficiaryList       │◀──── projects/aa/
            │  BeneficiaryForm       │
            │  TaskForm              │◀──── projects/beneficiary/
            │  CampaignFormPage      │
            │  BenefitFormPage       │◀──── projects/microlearning/
            └────────────────────────┘
```

Each project plugin imports shared components and composes them with project-specific logic. The shared components accept props and configuration to adapt to different project types.
