# @synccn/cli

Keep synccn components up to date without losing your edits.

```bash
npx @synccn/cli add data-view        # install with the shadcn CLI and start tracking
npx @synccn/cli status               # what changed upstream, what you changed
npx @synccn/cli diff button          # both, line by line
npx @synccn/cli update --dry-run     # impact report: files, merges, conflicts, new packages
npx @synccn/cli update               # back up, then three-way merge
npx @synccn/cli restore              # list backups / put one back
npx @synccn/cli doctor [--fix]       # check React, Tailwind, aliases, registry, styles, packages
```

## How it works

`npx @synccn/cli add` runs `shadcn add`, then stores each file as installed in `.synccn/base/` and its registry version in `.synccn/manifest.json` (commit the manifest; snapshots and backups are git-ignored). Versions are content hashes published in each item's `meta.version`.

`update` merges three versions of each file: yours, the snapshot, and the latest (with your aliases applied, as shadcn would). Edits in different places combine. Edits to the same lines are reported as conflicts and the file is left alone, unless you pass `--force`, which writes git-style markers. Every write is preceded by a backup of the files and the tracking state.

## Limits

- Merging needs TypeScript sources (`"tsx": true`). In JavaScript projects `status` and `diff` work; review updates with `npx shadcn@latest add @synccn/<name> --diff`.
- Merges are line-based, like git's: edits on neighbouring lines conflict.
- New npm packages are listed, never installed for you.

## Publishing

`npm publish` from this folder (published as `@synccn/cli` under the synccn npm organization). Requires Node 20+.
