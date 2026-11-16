# Profile website

Independent static profile for Kentaro Kuribayashi. Node builds Markdown into one HTML page; no browser framework or Obsidian submodule.

- Edit `content/profile.md` for the complete record. Preserve every research, speaking, writing, interview, career and qualification entry, including expired qualification status.
- Keep the source in Markdown and read it at build time. Do not replace it with JSON or duplicate the full record in templates. Display every record immediately: no accordions, tabs or filters that hide the volume of work.
- Display dates naturally as `2026年7月`, not split/zero-padded decorative dates. Keep the supplied portrait modest: 240px desktop, up to 144px mobile.
- Keep the introduction compact: Japanese name and small portrait side by side; affiliations, navigation and biography should start within the first desktop screen. Avoid oversized two-line English names and wide empty columns.
- `scripts/build.mjs` structures the page; `src/style.css` controls layout using the vendored DADS tokens and components. Use real, existing portrait photography.
- Run `npm test` and `npm run build`; verify desktop and narrow mobile screenshots and keyboard navigation after UI changes.
- `npm run dev` serves `dist` on localhost:4173. Rebuild after source edits.
- GitHub Actions publishes `dist` to Pages. `site.config.json` is the canonical URL source.
- The live domain is `https://kentarokuribayashi.work/` (Pages custom domain and HTTPS verified). Do not link this professional profile to the personal `.com` site, including header, footer, content navigation or metadata.
- Do not sync from the old Obsidian source automatically. This repository owns the profile from this migration forward.
