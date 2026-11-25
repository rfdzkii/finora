# Verification report — foundation batch

## Environment

- Node: v20.20.2 (the distributed project recommends Node 22.12+; target-version verification is pending).
- npm: 10.8.2.
- Internet access unavailable in the execution environment.
- Required application packages absent from the local npm cache.

## Checks actually performed

1. Created 22 TypeScript/TSX source, configuration, and test files at the time of checking.
2. Parsed and transpiled all 22 with cached Babel TypeScript and CommonJS transforms. No syntax errors.
3. Transpiled tests and pure-domain modules to a temporary directory. Changed only the test import from `vitest` to `node:test` for this alternate harness; assertion bodies were unchanged.
4. Ran Node's native test runner with the Web Crypto global enabled.
5. Result: 38 tests, 38 passed, zero failed/skipped/cancelled.

This is actual business-logic execution, but not a standard Vitest run and not semantic TypeScript checking. JSX was parsed, not browser-rendered. Temporary Babel dependencies are not part of the application package.

## Standard commands attempted

### Dependency installation

Command: `npm install --offline --ignore-scripts --no-audit --no-fund`

Result: exit 1; ENOTCACHED for @tailwindcss/vite. No dependencies were installed for the application and no lockfile was generated. No online install was attempted.

### Production build

Command: `npm run build`

Result: exit 127; `tsc: not found`. The build script reached the typecheck step and stopped. Vite production bundling did not run.

### Standard test run

Command: `npm test`

Result: exit 127; `vitest: not found`.

## Unverified

- TypeScript semantic correctness with installed library declarations.
- Dependency/peer resolution and security audit.
- Standard Vitest execution.
- Production build and production bundle performance.
- Browser startup, hydration-free client rendering, responsive layouts, keyboard interaction, chart rendering, download behavior, and refresh persistence in a real browser.
- Remaining product pages (not implemented, not merely untested).

## Required next verification

On Node 22.12+ with internet access: install dependencies, resolve any peer/type errors, run the standard commands, then test both implemented routes in a browser at mobile/tablet/desktop widths. Preserve current records between module deliveries. Do not reset storage merely to hide a validation error.
