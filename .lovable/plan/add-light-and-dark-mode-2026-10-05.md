# Add light and dark mode

## Changes
- Add a compact sun/moon toggle beside the notification icon in the shared top bar.
- Switch the workspace by applying the existing dark theme class at the document level.
- Remember the selected mode in the browser and restore it on later visits.
- Complete the dark semantic color tokens so panels, sidebar, badges, overlays, and Alfie accents remain readable and consistent.
- Verify the toggle and key workspace screens in both themes.

## Technical details
- Keep theme state in the shared application shell so every current route changes together.
- Initialize after hydration to avoid server/browser rendering mismatches.
- Use the existing semantic Tailwind tokens; no page-specific hardcoded dark colors.
