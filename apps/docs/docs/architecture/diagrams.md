# Architecture Diagrams

Visual diagrams of the Rahat v2 frontend architecture.

---

## 1. High-Level Frontend Architecture

Shows how `apps/web` connects to shared packages, plugin packages, and the backend.

![High-Level Architecture](/img/architecture/01-high-level.svg)

---

## 2. Plugin Registration Flow

Shows the boot-time sequence: how all 5 plugin categories get registered in `plugins/index.ts`.

![Plugin Registration Flow](/img/architecture/02-plugin-registration.svg)

---

## 3. Data Flow Architecture

Shows the data path from React components through React Query hooks, SDK service factories, and down to the API.

![Data Flow](/img/architecture/03-data-flow.svg)

---

## 4. Route Layout Nesting

Shows how TanStack Router file-based routes nest from `__root.tsx` through `_app.tsx` to individual pages.

![Route Nesting](/img/architecture/04-route-nesting.svg)

---

## 5. Package Dependency Graph

Shows the full monorepo dependency map between `apps/web`, shared packages, project plugins, and core plugins.

![Package Dependencies](/img/architecture/05-package-deps.svg)

---

## 6. Component Layer Hierarchy

Shows the 4-layer component architecture: route pages, shared domain components, plugin components, and UI primitives.

![Component Layers](/img/architecture/06-component-layers.svg)
