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
- `src/errors/` and `src/types/` exist but are **empty scaffold directories**
- `src/adapters/GoogleSheetsAdapter.ts` is a skeleton class — no implementation yet
- Version is `0.0.0` — no stable public API exists
