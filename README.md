<p align="center">
  <a href="https://synccn.com"><img src="./.github/synccn-logo.png" alt="synccn" height="64"></a>
</p>

<p align="center"><b>Copy it in. Make it yours.</b><br>
204 accessible React components built on Tailwind CSS. Your code, not a dependency.</p>

<p align="center">
  <a href="https://synccn.com">Website</a> ·
  <a href="https://synccn.com/components">Components</a> ·
  <a href="https://synccn.com/docs/introduction">Docs</a> ·
  <a href="https://synccn.com/themes">Theme Studio</a>
</p>

---

synccn is a collection of React components you copy into your own project. There's no package to install and wait on: the CLI writes each component's source next to your code, so you can read every line and change any of it.

This repository is the source of the synccn registry: every component, its example, the full-page blocks, and the `synccn` CLI. The website lives at [synccn.com](https://synccn.com).

## What's inside

| | |
|---|---|
| **204 components** | Inputs 45 · Display 44 · Overlays 19 · Navigation 13 · Feedback 15 · Motion 34 · Data 24 · AI 10 |
| **12 blocks** | AI chat, billing, project management, CRM, analytics, developer platform, admin dashboard, dashboard, sign in, pricing, settings, team |
| **TypeScript + JavaScript** | Strict TypeScript source, with a generated JavaScript version of every file |
| **Next.js and Vite** | `"use client"` where needed, SSR-safe portals and media queries |
| **Accessible** | Keyboard support and ARIA roles on every interactive part, reduced-motion aware |
| **Themeable** | One set of CSS variables styles everything, in light and dark |

## Use a component

synccn works with the shadcn CLI. Point it at the synccn registry once, in your `components.json`:

```json
{
  "registries": {
    "@synccn": "https://synccn.com/r/{name}.json"
  }
}
```

Then add what you need:

```bash
npx shadcn@latest add @synccn/button
npx shadcn@latest add @synccn/dialog @synccn/toast
```

The source lands in `components/ui`. It's yours from that point on.

New project? Run `npx shadcn@latest init` first. The [installation guide](https://synccn.com/docs/installation) covers Next.js and Vite.

## Stay up to date without losing your edits

The `synccn` CLI tracks what you've installed and merges upstream changes with your own edits:

```bash
npx synccn@latest add data-table      # install with the shadcn CLI and start tracking
npx synccn@latest status              # what changed upstream, what you changed
npx synccn@latest update --dry-run    # files, merges, conflicts, new packages
npx synccn@latest update              # back up, then three-way merge
```

See [`cli/README.md`](./cli/README.md) for every command.

## Repository layout

```
src/registry/ui/       component source (some files hold a family, e.g. charts.tsx)
src/registry/demos/    the example for each component, as shown on synccn.com
src/registry/index.js  names, categories and descriptions for every component
src/blocks/            full-page blocks
src/lib/               cn(), shared hooks and the clipboard helper
scripts/               builds the JavaScript copies, API data and the registry
cli/                   the synccn CLI (published to npm as `synccn`)
```

## Develop

```bash
npm install
npm run generate    # JavaScript copies, API data and the registry in public/r
npm run check       # generate, then validate every item against the shadcn schema
npm run typecheck   # strict tsc over components, demos and blocks
```

Generated output (`src/registry/__generated__`, `public/r`) is git-ignored.

## Contributing

Bug reports, fixes and component requests are welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) first, or ask in the Discord.

## License

[MIT](./LICENSE). Use the components in anything, commercial or not.
