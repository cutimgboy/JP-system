# JP-system Agent Notes

These instructions apply to the whole repository.

## Scope And Structure

- `frontend/` is the user-facing mobile app.
- `admin/` and `backend/` are separate workspaces; do not touch them for frontend-only tasks.
- `ui/` is the design reference implementation. Treat it as a source of truth for layout, copy structure, spacing, and visual states, not as runtime code for `frontend/`.

## UI Alignment Workflow

- For UI-related frontend changes, first inspect the matching files under `ui/src/app/components/` and related assets under `ui/src/imports/` or `ui/src/assets/`.
- If the UI reference includes iOS/Android status-bar content such as time, signal, or battery, do not implement that status bar in `frontend/`.
- When an image from `ui/` is required by `frontend/`, copy the asset into `frontend/public/` and reference it from there.
- Keep mobile spacing consistent across first-level pages, especially the top asset/header areas.

## Frontend I18n

- The app currently supports only Simplified Chinese (`zh-CN`) and Vietnamese (`vi`). Do not reintroduce other languages unless explicitly requested.
- Use `frontend/src/i18n/text.ts` for language helpers:
  - `tx()` for translated UI strings.
  - `changeAppLanguage()` for switching language.
  - `AppLanguage` for language types.
- Add every user-visible translation key to both `frontend/src/i18n/resources/zh-CN/common.json` and `frontend/src/i18n/resources/vi/common.json`.
- Do not translate business identifiers, API parameters, filtering keys, or discriminants. Keep stable internal values separate from translated labels.

## Validation

- For frontend changes, run these checks from `frontend/` before handing off:
  - `npm run typecheck`
  - `npm run build`
- From the repository root, run `git diff --check` before committing.
