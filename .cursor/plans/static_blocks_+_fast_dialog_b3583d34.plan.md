---
name: Static Blocks + Fast Dialog
overview: Fix the BlockSelector UX by deferring heavy grid render, virtualizing the grid, and migrating palettes from Convex block IDs to static block slugs sourced from data/blocks.json.
todos:
  - id: defer-grid-mount
    content: Make BlockSelector open instantly by deferring BlockGrid mount (requestAnimationFrame) in `components/blocks/block-selector.tsx`.
    status: completed
  - id: virtualize-blockgrid
    content: Replace Convex data with static blocks and virtualize rendering in `components/blocks/block-grid.tsx` (add `@tanstack/react-virtual` if needed).
    status: completed
    dependencies:
      - defer-grid-mount
  - id: schema-compat
    content: Update `convex/schema.ts` slots type to accept both `Id<"blocks">` and `string` during migration.
    status: completed
  - id: migration-mutation
    content: Add `migrateSlotsToSlugs` mutation and update palette mutations/queries in `convex/palettes.ts` for slug slots.
    status: completed
    dependencies:
      - schema-compat
  - id: frontend-slug-update
    content: "Update all frontend usage to treat palette slots as slugs and remove `api.blocks.*` queries: `palette-editor`, `palette-grid`, `user page`, `palette view page`, `image-preloader`."
    status: completed
    dependencies:
      - migration-mutation
      - virtualize-blockgrid
  - id: schema-finalize
    content: "After running migration, tighten schema to `string|null` slots and remove unused block ID pathways (optional: remove blocks table/APIs)."
    status: completed
    dependencies:
      - frontend-slug-update
---

# Static blocks + instant BlockSelector

## Problem recap

- The dialog now opens late because opening it triggers a **large synchronous render** (hundreds of `BlockCard`s) in the same commit as `open=true`.
- Fully “static blocks” is not possible without a schema change because `palettes.slots` currently stores `Id<"blocks">`.

## High-level solution

1. **Make the dialog feel instant**: open dialog UI immediately, then mount the heavy `BlockGrid` **after the first paint**.
2. **Virtualize `BlockGrid`**: render only the visible blocks in the scroll viewport.
3. **Make blocks truly static**: migrate `palettes.slots` from `Id<"blocks">` to `slug` strings and load blocks from [`data/blocks.json`](data/blocks.json).

## Implementation details

### 1) Add a single source of truth for static blocks

- Create a helper module (e.g. `lib/blocks.ts`) that:
- Imports [`data/blocks.json`](data/blocks.json)
- Exports `BLOCKS`, `CATEGORIES`, and a `blocksBySlug` map

### 2) Defer mounting `BlockGrid` (instant open)

- In [`components/blocks/block-selector.tsx`](components/blocks/block-selector.tsx):
- Keep the dialog header/content shell rendering immediately.
- Add local state like `shouldRenderGrid`.
- When `open` becomes true, set `shouldRenderGrid` in `requestAnimationFrame` so the dialog paints first.

### 3) Virtualize the grid

- In [`components/blocks/block-grid.tsx`](components/blocks/block-grid.tsx):
- Replace Convex queries with static data from `lib/blocks.ts`.
- Add virtualization (recommended: `@tanstack/react-virtual`) so only visible block cells render.

### 4) Migrate palettes to store slugs

This must be a two-step schema migration to avoid breaking existing data.

- **Step A (compat schema)** in [`convex/schema.ts`](convex/schema.ts):
- Change `palettes.slots` to allow both formats temporarily:
- `v.array(v.union(v.id("blocks"), v.string(), v.null()))`

- **Backend updates** in [`convex/palettes.ts`](convex/palettes.ts):
- Update `addBlockToSlot` and `update` to accept `blockSlug: v.union(v.string(), v.null())` (and/or compat union during the transition).
- Update `getById` to return slots as slugs (and remove `slotsWithBlocks` usage from clients).
- Add a migration mutation like `migrateSlotsToSlugs`:
- Iterate palettes
- For each slot:
- If `null` → keep `null`
- If `Id<"blocks">` → `ctx.db.get(id)` to read block doc and replace with `block.slug`
- If already `string` → keep
- Patch palettes with new slug arrays

- **Step B (final schema)** after running the migration once:
- Tighten `palettes.slots` to `v.array(v.union(v.string(), v.null()))`
- Optionally remove the `blocks` table and `convex/blocks.ts` endpoints if no longer used.

### 5) Update all frontend consumers to slug-based slots

Update the files that currently query `api.blocks.list` for ID→block lookups:

- [`components/palette/palette-editor.tsx`](components/palette/palette-editor.tsx)
- [`components/palette/palette-grid.tsx`](components/palette/palette-grid.tsx)
- [`app/user/[id]/page.tsx`](app/user/[id]/page.tsx)
- [`app/palette/[id]/page.tsx`](app/palette/[id]/page.tsx)
- [`components/providers/image-preloader.tsx`](components/providers/image-preloader.tsx)

These will use `blocksBySlug` (and `BLOCKS`) from `lib/blocks.ts` instead of Convex.

## Migration runbook (one-time)

- Run Convex codegen/dev as usual after schema changes.
- Execute the migration mutation (e.g. via `npx convex run palettes:migrateSlotsToSlugs`).
- Verify a few palettes render correctly.
- Apply final schema tightening.

## Verification

- Open block selector: header appears immediately; grid appears smoothly without blocking the open.
- Scroll performance: stays smooth (virtualized).
- Existing palettes still render correctly post-migration.
- Creating/editing palettes stores slugs in `slots`.