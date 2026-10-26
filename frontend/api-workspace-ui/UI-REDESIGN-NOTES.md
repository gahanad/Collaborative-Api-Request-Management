# API Workspace UI Redesign

This version applies a lavender/purple visual system inspired by the reference image while retaining the existing React components, stores, API services, routing, and request execution flows.

## Design changes
- Updated global theme tokens and focus/selection styling in `src/index.css`.
- Restyled the top navigation and desktop sidebar.
- Reworked the dashboard hierarchy, loading state, empty state, workspace grid, and create-workspace section.
- Restyled workspace cards and their actions.
- Applied the same visual language to the workspace studio shell and header.
- Kept HTTP status/method semantics and the existing business logic intact.

## Run locally
1. From `frontend/api-workspace-ui`, run `npm install`.
2. Configure your local environment variables using your own values (the `.env` file is intentionally not included).
3. Run `npm run dev`.

The ZIP intentionally excludes `node_modules`, `dist`, `.git`, and environment files. Build/test the project locally after installing dependencies and configuring your environment.
