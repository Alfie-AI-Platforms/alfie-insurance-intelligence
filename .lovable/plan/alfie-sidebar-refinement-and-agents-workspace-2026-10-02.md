# Alfie sidebar refinement and Agents workspace

## Sidebar refinement
- Replace the top Alfie brand with Northstar Mutual company branding and move the collapse control into the header.
- Keep all existing navigation groups, add Agents under Administration, and preserve active-page state during smooth collapse/expand.
- Move Jane Doe’s profile to the sidebar footer with a Profile, Preferences, Help, and Sign out menu; show only her avatar when collapsed.
- Retain the Alfie Pro identity in the footer, reducing it to the Alfie icon in compact mode.
- Remove the horizontal top bar divider and switch every screen to Inter 400–700 only.

## Agents management
- Add a dedicated `/agents` page with realistic agent rows, statuses, access summaries, and working action menus.
- Support Open, Edit, Duplicate, Pause/Resume, activity viewing, and delete confirmation using local mock state.
- Reuse one application shell so sidebar behavior and navigation stay consistent between Home and Agents.

## Agent builder
- Add a dedicated multi-step create/edit experience covering Define, Knowledge, Tools & Actions, Workflow & Guardrails, and Access & Publish.
- Make selections, toggles, workflow block reordering/removal, draft saving, and Back/Continue navigation interactive.
- Include a final configuration summary plus Test Agent and Publish actions.

## Testing and overview
- Add a safe test workspace that demonstrates agent output, source use, permission limits, and human-approval checkpoints without changing production data.
- Add an Agent Overview page with purpose, knowledge, systems, actions, guardrails, access, recent runs, performance, audit activity, and management actions.
- Verify the core flows and responsive layouts at desktop and mobile sizes.

## Technical details
- Keep TanStack file routes and use URL-backed pages for list, builder, testing, and overview states.
- Use React-only mock state; no backend or real integrations will be added.
- Keep all visual colors, shadows, and typography in the existing semantic token system.
