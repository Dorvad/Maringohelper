# Development Instructions for AI Coding Agents

You are working on a small personal timesheet helper app for manually filling monthly hours into Maringo / MARIProject.

## Product intent

Do not turn this into a full ERP, billing system, or team timesheet platform. The app is a lightweight personal reference tool.

The core user flow is:

1. User selects a day.
2. User adds hours by project until reaching 9 hours.
3. User reviews the month.
4. User opens Maringo report mode and copies day-by-day entries into Maringo.
5. User marks each day as submitted to Maringo.

## UX principles

- Mobile-first.
- Recognition over recall: project chips, quick amounts, "all remaining hours".
- Visibility of system status: always show total hours, remaining hours, and day status.
- Prevent errors before they happen: warn before exceeding the daily target.
- Use cards on mobile, not dense tables.
- The most important screen is Maringo report mode.

## UI direction

- Soft lavender background.
- White rounded cards.
- Big pill buttons.
- Bottom nav on mobile.
- Bottom sheet for adding hours.
- Dark charcoal for selected states / primary action.
- Purple for primary accent.
- Warm peach for warning / missing states.
- Do not rely on color only; use text labels and icons.

## Architecture

- Vite + React + TypeScript.
- Tailwind CSS.
- Dexie / IndexedDB for local storage.
- Keep domain logic in `src/lib`.
- Keep reusable UI in `src/components`.
- Avoid adding a backend unless explicitly requested.

## Next recommended improvements

1. Add edit existing entry.
2. Add import backup JSON.
3. Add persistent settings for target hours and working days.
4. Add day templates and "copy yesterday".
5. Add PDF export / print view.
6. Add optional PWA install support.
