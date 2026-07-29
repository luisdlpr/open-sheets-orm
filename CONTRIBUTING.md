# Contributing to open-sheets-orm

Thanks for your interest in contributing! Here's how to get started.

## Prerequisites

- [Node.js](https://nodejs.org) >= 22
- [pnpm](https://pnpm.io) 11.13.1 (enforced via `packageManager` in `package.json`)

## Setup

```bash
git clone https://github.com/luisdlpr/open-sheets-orm.git
cd open-sheets-orm
pnpm install
```

## Development commands

| Command                             | What it does                                              |
| ----------------------------------- | --------------------------------------------------------- |
| `pnpm install`                      | Install dependencies                                      |
| `pnpm build`                        | Build to `dist/` (esm + cjs + types + sourcemaps)         |
| `pnpm dev`                          | Watch build (`tsup --watch`)                              |
| `pnpm test`                         | Run tests with Vitest                                     |
| `pnpm lint`                         | Lint with ESLint (flat config, v9+)                       |
| `pnpm vitest run tests/Foo.test.ts` | Run a single test file                                    |
| `pnpm docs:api`                     | Generate TypeDoc API reference into `docs/api/reference/` |
| `pnpm docs:dev`                     | VitePress dev server (local preview)                      |
| `pnpm docs:build`                   | Build full docs site (TypeDoc + VitePress)                |

## How to contribute

### Reporting bugs

Open a [bug report](https://github.com/luisdlpr/open-sheets-orm/issues/new?template=bug_report.yml). Include a minimal reproduction, expected vs actual behavior, and your runtime version.

### Suggesting features

Open a [feature request](https://github.com/luisdlpr/open-sheets-orm/issues/new?template=feature_request.yml). Describe the problem, propose a solution, and note any alternatives considered.

### Submitting pull requests

1. Fork the repo and create a branch from `main`.
2. Make your changes following the conventions below.
3. Run `pnpm build`, `pnpm test`, and `pnpm lint` to verify.
4. If you changed any public API (exports in `src/index.ts`), run `pnpm docs:api` to regenerate the API reference.
5. If you added/changed user-facing functionality, update the relevant guide page in `docs/guide/`.
6. Open a PR against `main` using the [PR template](.github/PULL_REQUEST_TEMPLATE.md).

## Documentation

Docs are built with [VitePress](https://vitepress.dev/) and [TypeDoc](https://typedoc.org/).

| Path                            | Content                                  |
| ------------------------------- | ---------------------------------------- |
| `docs/index.md`                 | Landing page                             |
| `docs/guide/getting-started.md` | Installation, setup, quick start         |
| `docs/guide/manual-api.md`      | Schema, adapter, and Database usage      |
| `docs/guide/autogen-client.md`  | CLI code generation                      |
| `docs/api/index.md`             | API reference landing page               |
| `docs/api/reference/`           | TypeDoc-generated (do not edit manually) |

### When to update docs

- **New/changed exports** — run `pnpm docs:api` to regenerate the API reference.
- **New/changed features** — update or add the relevant guide page in `docs/guide/`.
- **New/changed error classes** — add them to the error table in `docs/guide/manual-api.md`.
- **Schema field types or modifiers** — update the tables in `docs/guide/manual-api.md`.

### Verifying docs locally

```sh
pnpm docs:build   # full build (TypeDoc + VitePress)
pnpm docs:dev     # dev server with hot reload at http://localhost:5173
```

## Code conventions

- **TSDoc**: All exported files, classes, and non-trivial methods must have TSDoc blocks (`@param`, `@returns`, `@throws`).
- **No inline comments**: Avoid `//` comments inside method bodies unless the logic is non-obvious.
- **Constants**: All magic strings and API literals go in `src/constants/index.ts` with `as const`.
- **Errors**: Extend `SheetsError` for domain errors. Use existing error classes (`ConnectionError`, `SheetNotFoundError`, `RowNotFoundError`) where applicable.

## Testing guidelines

- Test files go in `tests/` and match source file names (e.g. `GoogleRowService.test.ts`).
- Import from `../src/...` directly, not from package exports.
- Mock `googleapis` via `vi.mock('googleapis', ...)` when testing `GoogleAuthService`.
- For services that take a `sheets_v4.Sheets` client, create a mock client with `vi.fn()` methods and cast with `as unknown as sheets_v4.Sheets`.
- Use `vi.clearAllMocks()` in `beforeEach` to prevent test pollution.
- Avoid low-value tests — trivial pass-throughs or string literal assertions on constants are unnecessary.

## CI

The CI workflow (`.github/workflows/ci.yml`) runs on push/PR to `main`:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm build`
4. `pnpm test`

Make sure all four steps pass before submitting a PR.
