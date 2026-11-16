# Profile website

Independent static profile for Kentaro Kuribayashi. Node builds Markdown into one HTML page; no browser framework or Obsidian submodule.

- Edit `content/profile.md` for the complete record. Preserve every research, speaking, writing, interview, career and qualification entry, including expired qualification status.
- `scripts/build.mjs` structures the page; `src/style.css` controls layout using the vendored DADS tokens and components. Use real, existing portrait photography.
- Run `npm test` and `npm run build`; verify desktop and narrow mobile screenshots and keyboard navigation after UI changes.
- `npm run dev` serves `dist` on localhost:4173. Rebuild after source edits.
- GitHub Actions publishes `dist` to Pages. `site.config.json` is the canonical URL source.
- The planned `.work` domain is not registered as of migration. Do not point canonical/redirect URLs there until it is acquired and routing works.
- Do not sync from the old Obsidian source automatically. This repository owns the profile from this migration forward.
