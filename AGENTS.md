# AGENTS.md

## CRITICAL: Git Operations

**NEVER run `git commit` or `git push` under any circumstances.**
Do not stage, commit, amend, or push changes. Leave all git operations to the user.

---

## Package Manager

- Use **pnpm only** — version `11.13.1` (enforced via `"packageManager"` in `package.json`)
- Never use `npm` or `yarn`
- In CI, installs use `--frozen-lockfile` — do not modify `pnpm-lock.yaml` unintentionally

---

## Dev Commands

| Command        | What it does                                      |
| -------------- | ------------------------------------------------- |
| `pnpm install` | Install dependencies                              |
| `pnpm build`   | Build to `dist/` (esm + cjs + types)              |
| `pnpm dev`     | Watch build (`tsup --watch`)                      |
| `pnpm test`    | Run all tests (watch mode in TTY, run mode in CI) |
| `pnpm lint`    | Lint with ESLint (flat config, v9+)               |

**No `typecheck` script exists.** Type checking happens implicitly via `dts: true` in tsup during `pnpm build`. There is no `tsc --noEmit` shortcut.

**No `format` script exists.** Prettier is installed but has no config file and is not wired up.

---

## Build

- Entry: `src/index.ts` → output: `dist/`
- Emits: `dist/index.js` (ESM), `dist/index.cjs` (CJS), `dist/index.d.ts`, `dist/index.d.cts`, and sourcemaps
- `dist/` is gitignored — must be built locally; only published via `prepublishOnly`
- Package is ESM-first (`"type": "module"` in `package.json`)

---

## Testing

- Test files live in `tests/` (top-level), not co-located with source
- Use explicit Vitest imports — globals are not configured:
  ```ts
  import { describe, it, expect } from 'vitest';
  ```
- Run a single file: `pnpm vitest run tests/example.test.ts`
- Run all tests (non-watch): `pnpm vitest run`

---

## Linting

- ESLint flat config (`eslint.config.js`), v9+ format
- `typescript-eslint` recommended rules apply to all `.ts` files
- `dist/` is excluded from linting
- **Lint is not run in CI** — run `pnpm lint` manually to verify

---

## TypeScript

- Strict mode enabled (`"strict": true`)
- `"moduleResolution": "Bundler"` — modern resolution via tsup/esbuild
- `"target": "ES2022"`
- `tsconfig.json` only includes `src/` — `tests/` is excluded (Vitest handles its own transpilation)

---

## CI (`.github/workflows/ci.yml`)

Steps run in this order on push/PR to `main`:

1. `pnpm install --frozen-lockfile`
2. `pnpm build`
3. `pnpm test`

Lint is **not** part of CI.

---

## Architecture

- Single package at root — **not a monorepo** (`pnpm-workspace.yaml` only allowlists esbuild lifecycle scripts)
- Only runtime dependency: `googleapis` (Google Sheets API client)
- `src/index.ts` is the public barrel export
- Version is `0.0.0` — no stable public API exists

### Source layout

```
src/
  adapters/
    SheetsAdapter.ts              # Abstract base class (the public contract)
    GoogleSheetsAdapter.ts        # Google Sheets implementation (facade)
  services/
    GoogleAuthService.ts          # Authentication
    GoogleSpreadsheetService.ts   # Spreadsheet metadata
    GoogleWorksheetService.ts     # Sheet management + headers
    GoogleRowService.ts           # Row CRUD
  constants/
    index.ts                      # All magic strings and hardcoded values
  types/
    index.ts                      # Shared interfaces (SheetConfig, SpreadsheetInfo, SheetInfo)
  errors/
    index.ts                      # Error hierarchy (SheetsError → ConnectionError, SheetNotFoundError, RowNotFoundError)
  index.ts                        # Barrel export
```

### Adapter pattern

`SheetsAdapter` is the abstract superclass. `GoogleSheetsAdapter` extends it and delegates to four internal service classes. Each service receives an authenticated `sheets_v4.Sheets` client and is responsible for one area of the API. Services are **concrete Google-specific classes** — not abstract. If a second adapter (e.g. Excel) is added later, it will have its own service implementations. The adapter is the abstraction boundary, not the services.

---

## Code Conventions

### Docstrings (TSDoc)

Every exported file, class, and non-trivial method must have a TSDoc block comment. Follow these rules:

- **File header**: `@file` description and `@module` tag.
- **Class**: Brief description. `@typeParam` if generic. `@example` with a code fence showing typical usage.
- **Method**: Brief description. `@param` for each parameter. `@returns` if non-void. `@throws` for each checked exception. `@typeParam` for generic methods.
- **Constants file**: Each export has a one-line `/** ... */` comment explaining the value.
- Do not add inline `//` comments inside method bodies unless the logic is non-obvious.

```ts
/**
 * Reads all data rows from the specified sheet, mapped to objects
 * keyed by header values.
 *
 * @param spreadsheetId - The spreadsheet to read from.
 * @param sheetName - The sheet to read from. When omitted, the
 *   first sheet is used.
 * @returns An array of row objects keyed by header values.
 * @throws {SheetNotFoundError} If the sheet does not exist.
 */
```

### Error handling

- Extend `SheetsError` for all domain errors. `ConnectionError`, `SheetNotFoundError`, and `RowNotFoundError` already exist.
- Constructors accept a message string and an optional `ErrorOptions` (for cause chaining).
- Specific errors like `SheetNotFoundError` and `RowNotFoundError` have their own constructor signatures that format the message from the relevant identifier (e.g. `new SheetNotFoundError('Users')` produces `Sheet "Users" not found`).

### Constants

- All magic strings, API versions, scopes, range literals, and field masks live in `src/constants/index.ts`.
- Every constant is `as const` to preserve literal types.
- Services import constants from `../constants` — never inline the values.

### Testing

- Test files live in `tests/` (top-level), named to match the source file under test (e.g. `tests/GoogleRowService.test.ts`).
- Import from `../src/...` directly — do not import from package exports in tests.
- Mock `googleapis` via `vi.mock('googleapis', ...)` when testing `GoogleAuthService`.
- Mock service modules via `vi.mock('../src/services/...', ...)` when testing the adapter.
- Mock implementations must use `function` syntax (not arrow functions) when they need to be called with `new`.
- For services that take a `sheets_v4.Sheets` client, create a mock client object with `vi.fn()` methods and cast it with `as unknown as sheets_v4.Sheets`.
- When testing methods that call the same API method multiple times (e.g. `GoogleRowService.delete` calls `spreadsheets.get` twice), ensure each mock returns the correct value for its call — do not assume a single mock value covers all calls.
- Use `vi.clearAllMocks()` in `beforeEach` to prevent test pollution.
- Avoid low-value tests: trivial pass-throughs, string literal assertions on constants, or testing that vitest mocking works.

### File naming

- Source files: `PascalCase.ts` matching the primary class/export name.
- Test files: `PascalCase.test.ts` matching the source file name.
- Index files: `index.ts` for barrel exports in each directory.
- Internal service files are not re-exported through the barrel — only the adapter classes, types, errors, and constants are public.
