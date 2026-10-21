# Alyne Prototype — usability testing build

Standalone extraction of the Alyne prototype from the Chrome Shell project
(`Mitratech-GRC-Design/grc-design-system-docs-v3`), trimmed to just the Alyne
pages plus the shared shell they need.

This repo does not depend on the Chrome Shell repo in any way.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Script                | What it does                                              |
| --------------------- | --------------------------------------------------------- |
| `npm run dev`         | Dev server at `/`                                         |
| `npm run build`       | Production build (honours `VITE_BASE_PATH`)               |
| `npm run build:local` | Production build served from `/`                          |
| `npm run preview`     | Serve the last build locally                              |

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds on every
push to `main` and publishes to GitHub Pages. It sets `VITE_BASE_PATH` to
`/<repo-name>/` so assets resolve on a project site, and copies `index.html` to
`404.html` so client-side routes survive a deep link (Pages has no rewrite
rules).

> [!WARNING]
> **A GitHub Pages site in this organisation is public.** The org is on the
> GitHub **Team** plan, where Pages sites are always public regardless of repo
> visibility — access control for Pages requires GitHub Enterprise Cloud.
> Enabling Pages therefore publishes this prototype to the open internet.
> Clear that with
> **AI@mitratech.com** before enabling Pages.

## What's in here

Extracted from Chrome Shell:

- `src/pages/alyne/` — the six Alyne surfaces (Home, Governance Controls,
  Control Sets, Control Set detail, Compliance Questionnaires, Risk Management)
  and their sample data
- `src/components/shell/` — the shared app frame (header, sidebar, breadcrumbs,
  flyout nav, notification/user menus, appearance panel)
- `src/data/` — the Alyne navigation tree, the Alyne product record, sample
  notifications
- `src/lib/`, `src/utils/` — breadcrumb derivation, public-asset paths, nav-path
  and class-name helpers

Written for this repo:

- `src/App.jsx` — Alyne routes, mounted at `/` (Chrome Shell served them under
  `/chrome-shell/*`)
- Build config, Pages workflow

Everything else from Chrome Shell — the five other product prototypes, the docs
site, the component demo gallery, MDX content — is not included. Dependencies
dropped from 30 to 11 as a result (no MUI, recharts, Supabase or MDX toolchain:
the Alyne charts are hand-rolled SVG).

## Known limitations

These carried over from Chrome Shell and are unchanged here by design:

- **Most sidebar entries have no page.** Documents, Topics, Document mappings,
  Questionnaire Requests, Reports, Issues, the Risk sub-items, Tasks, Analytics,
  Settings, Search and Objects are present so the nav reads like the real
  product, but they fall through to the catch-all route and return to Home.
- **Row-level detail pages exist only for Control Sets.** Clicking a row in
  Controls, Questionnaires or Risks builds a detail URL that has no route, so it
  also returns Home. Worth scripting around in a moderated session.
- **Console warnings on nav render.** React logs `isActive` prop and `fill-rule`
  warnings. The first comes from `isActive` props passed to react-router v6
  `NavLink` (v6 dropped that prop, so it falls through to the DOM); the second
  comes from `@duo-icons/react`. Both are cosmetic — active nav styling is driven
  by the `className`/`style` callbacks and works correctly.
