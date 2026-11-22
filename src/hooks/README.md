# React Hooks

## Overview
Shared client-side hooks. Currently contains the mount guard used to avoid hydration mismatches when rendering browser-only state.

## Interface
- `useHasMounted()` — returns `false` on the first render and `true` after the mount effect. `[useHasMounted.ts:useHasMounted]`

## Invariants
- The hook starts with `hasMounted = false` and sets it to `true` in a mount-only `useEffect` (`[]` dependency). `[useHasMounted.ts:useHasMounted]`
- The synchronous `setState` inside the effect is intentional; the inline ESLint suppression documents the hydration-guard pattern. `[useHasMounted.ts:useHasMounted]`

## Side Effects
- Schedules a state update after mount. `[useHasMounted.ts:useHasMounted]`

## Verification
- Run: `pnpm test`
