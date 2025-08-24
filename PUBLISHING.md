# MIFF Sampler Launch Checklist

✅ Zone Validation
- [ ] All zones export `startZone()` and pass golden tests
- [ ] Remix Mode works in every zone (debug overlays, CLI triggers)
- [ ] Back button routes correctly to Synth Nexus

📦 Fixture Coverage
- [ ] Each zone has a matching fixture in `sampler/scenarios/`
- [ ] All fixtures pass `npm run test:golden`
- [ ] Remix Mode validator passes `npm run test:remix`

🎨 Asset Audit
- [ ] All assets are remix-safe (CC0, GPL, or public domain)
- [ ] Sources documented in `sampler/assets/README.md`
- [ ] No proprietary or restricted files

📱 Mobile Readiness
- [ ] Layouts tested on mobile and desktop
- [ ] Touch input and UI scaling confirmed

📚 Contributor Docs
- [ ] README includes Sampler overview and zone descriptions
- [ ] CONTRIBUTING.md explains how to add new zones
- [ ] Remix Lab is documented for testing and debugging

🌐 Hosting Prep
- [ ] Sampler builds cleanly for web preview
- [ ] Mobile and console builds pass CI
- [ ] Landing page links to zones, source, and remix instructions

🎁 Final Review
- [ ] All Pure modules are stable and documented
- [ ] No engine dependencies
- [ ] Ready for remix, fork, and contributor onboarding

Keep everything modular, remix-safe, and frictionless for contributors and players.