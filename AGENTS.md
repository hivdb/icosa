# ICOSA Migration Agent

This branch (`codex/convert‐codebase‐to‐typescript‐and‐react‐19`) is the working area for migrating the codebase from CRA/React 18 to **React 19 + Vite + TypeScript**. Follow the rules below whenever you touch the repo.

---

## Branching & PR Policy (IMPORTANT)

* **All work must branch from**: `codex/convert‐codebase‐to‐typescript‐and‐react‐19`.
* **All pull requests must target**: `codex/convert‐codebase‐to‐typescript‐and‐react‐19` (not `main`).
* Suggested branch name format: `codex/feat/<short-desc>` or `codex/fix/<short-desc>`.
* Quick start:

  ```bash
  git fetch origin
  git checkout codex/convert-codebase-to-typescript-and-react-19
  git pull --ff-only
  git checkout -b codex/feat/<short-desc>
  # ...commit changes...
  git push -u origin codex/feat/<short-desc>
  # Open PR -> base: codex/convert-codebase-to-typescript-and-react-19
  ```

---

## General Requirements

* **React components**: If any component is a **class**, convert it to a **function component**.
* **Package manager**: Use **yarn** (v1.x is pinned in the branch).
* **Tests**: For any `js/ts/tsx` code you modify, **add/update tests** to improve or maintain coverage. **Fix** failing tests.
* **Comments/Docstrings**: Add **verbose JSDoc/TS docstrings** for all edited functions, classes, and methods; document **args** and **returns**.
* **3rd‑party CSS shims (tests only)**: If a dependency’s CSS breaks Vitest, **shim it only for tests** (don’t remove it from runtime). There are existing SCSS shims under `src/shims/`—add more if needed.
* **Lint/Warnings**: Address obvious warnings where possible.
* **OOM / heavy tests**: If a specific test exhausts memory and there’s no quick fix, **isolate and comment out that single test** (do not delete) with a `TODO` explaining the issue and a minimal repro.

---

## Testing

* Test runner: **Vitest**.
* Command:

  ```bash
  yarn test -- --no-file-parallelism
  ```

  Use `--no-file-parallelism` to reduce memory usage.
* JSDOM is configured; SCSS shims for problematic packages are mapped in `vite.config.ts`.

### Coverage Expectations

* Add or update tests for changed code. Favor **component tests** with @testing-library/react and **unit tests** for utilities.
* If you must temporarily comment out a failing test to unblock CI, leave a **clear TODO** with rationale and a pointer to an issue/PR.
* The Markdown renderer under `src/components/markdown` must maintain **100% test coverage**.
* Never use `/* c8 ignore */` comments to skip covering large sections of code—write tests instead.

---

## Build

* Build command:

  ```bash
  yarn build
  ```
* Make sure the branch builds locally before opening a PR.

---

## Project Tooling (branch-specific)

* **React**: 19.x
* **TypeScript**: 5.9+
* **Vite**: 7.x
* **Vitest**: 3.x (with jsdom)
* `tsconfig.json` uses `strict: true`, `jsx: react-jsx`, `allowJs: true` for staged migration.
* `vite.config.ts` includes **test‑only alias/shims** for CSS and ESM quirks.

---

## Migration Guidelines

* **Class → Function**: Prefer `useState`, `useMemo`, `useCallback`, and `useEffect` rather than reproducing lifecycle methods verbatim.
* **Props/State typing**: Use explicit `Props`/`State` interfaces (if applicable). Avoid `any`; if unavoidable, mark with `@todo` and a short explanation.
* **File extensions**: Prefer `.tsx` for React components; utilities may be `.ts`.
* **Side effects**: Keep effects idempotent; clean up subscriptions/timers.
* **Runtime types**: Where the boundary is dynamic (e.g., CMS/GraphQL), add light runtime guards (type predicates) around parsing.
* **Typing**: Use TypeScript’s type system to ensure type safety. Avoid `any` unless absolutely necessary, and document why with a `@todo` comment. `@ts-nocheck` is not allowed.

---

## CSS & Assets in Tests

* Do **not** remove third‑party CSS. If it breaks tests, add a **shim** under `src/shims/` and wire it via `vite.config.ts:test.alias`.
* Keep shims **scoped to tests** only.

---

## PR Checklist

* [ ] Branched from `codex/convert-codebase-to-typescript-and-react-19` and PR targets the **same** branch.
* [ ] All new/changed code has tests; CI with `yarn test -- --no-file-parallelism` passes.
* [ ] `yarn build` passes.
* [ ] Added/updated docstrings (args/returns) for touched surfaces.
* [ ] Left TODOs for any intentional test skips with context and next steps.

---

## Notes for Local Dev

* Node 22 and Yarn (v1) are used in this branch.
* Dev server (if applicable): `yarn dev` -> [http://localhost:3009](http://localhost:3009)

---

## Commit Hygiene

* Use conventional‑style messages when possible (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).
* One logical change per commit; keep diffs reviewable.

---

## When in Doubt

Open a draft PR against `codex/convert-codebase-to-typescript-and-react-19` early to get feedback, and annotate tricky spots with inline comments.
