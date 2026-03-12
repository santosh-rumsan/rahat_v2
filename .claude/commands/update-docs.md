Update the Rahat v2 documentation to reflect the current state of the codebase. Follow the rules below for each area.

---

## Feature docs (`apps/docs/docs/features/`)

- For every page **added** to `apps/web`:
  1. Create `apps/docs/docs/features/<feature-name>.md` with the next available `sidebar_position` frontmatter value.
  2. Add `'features/<feature-name>'` to the `items` array under the `Features` category in `apps/docs/sidebars.ts`.
  3. Add a row to the Core Modules table in `apps/docs/docs/intro.md`.
- For every page **removed** from `apps/web`, delete or update its corresponding doc file so the docs no longer describe removed functionality.

## API docs (`apps/docs/docs/api/`)

- For every **new endpoint**, update the relevant resource file in `apps/docs/docs/api/` with the endpoint's method, path, request parameters, and response shape.
- For every **changed endpoint** (path, method, request/response contract), update the corresponding doc file immediately.
- For every **removed endpoint**, remove or strike through its entry in the doc file.
- For a **new resource group**:
  1. Create `apps/docs/docs/api/<resource>.md` with the next available `sidebar_position`.
  2. Add `'api/<resource>'` to the `API Reference` items array in `apps/docs/sidebars.ts`.
  3. Add a row to the API Reference table in `apps/docs/docs/intro.md` **and** to the endpoint groups table in `apps/docs/docs/api/overview.md`.

---

After making all changes, confirm which files were created or updated.
