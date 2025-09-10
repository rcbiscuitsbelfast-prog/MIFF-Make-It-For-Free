# Static Routing Issues

## Static Hosting Considerations
- GitHub Pages and some hosts serve a single `index.html` for unknown paths.
- Ensure each zone uses its own HTML entry (`zones/<zone>/index.html`).
- Avoid SPA-only fallback that masks zone HTML files.

## Validation
- Manually load zone HTML files directly to confirm distinct content.
- Check server/hosting config for 404 fallbacks.
- Verify deployed artifact paths match `site/` structure.