# Contributing to synccn

Thanks for helping. A few things keep the library consistent.

## Before you start

- **Bugs:** open an issue with the component name, what you expected, what happened, and your React/Tailwind/Next.js versions.
- **New components:** open a component request first so we can agree on the API before you build it.
- **Small fixes** (typos, a11y, a broken prop) can go straight to a pull request.

## Setup

```bash
npm install
npm run check
npm run typecheck
```

Both must pass before a PR is merged.

## Writing a component

- **TypeScript, strict.** Source goes in `src/registry/ui/<name>.tsx`. Don't commit the JavaScript copy: it's generated.
- **Imports:** use `@/lib/utils` for `cn()`, `@/lib/hooks` for shared hooks, and `@/registry/ui/<file>` for other components. The registry reads dependencies from these imports.
- **No new runtime packages** unless there's no reasonable alternative. `lucide-react` covers icons.
- **Accessible by default:** real buttons and inputs, keyboard support, ARIA where needed, visible focus, and `prefers-reduced-motion` respected for anything that moves.
- **Themeable:** use the CSS variables (`bg-background`, `text-muted-foreground`, `bg-primary`…), never hard-coded colours.
- **Next.js-safe:** add `"use client"` when the component uses state, effects or browser APIs.
- **Add an example** in `src/registry/demos/<name>.tsx` and an entry in `src/registry/index.js` (name, category, description).
- **Sample content stays generic:** use placeholder people and `@example.com` addresses, never real data.

## Pull requests

- One component or fix per PR.
- Describe what changed and why; add a screenshot or clip for anything visual.
- By contributing you agree your work is released under the MIT license.
