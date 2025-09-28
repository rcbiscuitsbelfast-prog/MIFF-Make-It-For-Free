# Security Audit

## Scope
- SBOM, dependency vulnerability scan
- Secrets scan and CI hardening
- Web security headers (CSP, HSTS, XFO), Pages config

## Current State
- No external runtime models; assets are MIFF-native
- CDN for Three.js used; consider vendoring for supply-chain control

## Risks
- Dependency drift
- Missing CSP for docs pages

## Actions
- Generate SBOM; add automated weekly vuln scan
- Add CSP meta/headers for Pages
- Pin CDN versions or vendor Three.js