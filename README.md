# HIGHFLY FOUNDATION

**F1 in progress: classless Hunter core (KayKit visuals selected).**

New clean-room project workspace for a mobile-first, open-world isekai RPG. ClaudeCraft v0.44.7 is the agreed **MIT engine reference**; the engine has not yet been imported. The goal is a **single universal character with no class or specialization**, four equipable original skills, any compatible weapon and FURY 360 movement/combat.

### Implemented in this repository
- Classless Hunter domain model and JSON-friendly state (`src/core/hunter.mjs`).
- Independent appearance, training, weapon rules, four active skill slots, aiming/cooldown logic and 1–2–3–4 combo intent.
- Node tests and reproducible demo (**logic only**, not a playable 3D game).
- Source/licensing audit and explicit approval list.

### Run core checks
\`\`\`bash
npm test
npm run demo
\`\`\`

### Not implemented yet
ClaudeCraft simulation/terrain/editor, KayKit model binaries, real FURY controls, 3D preview, networked world, local save persistence and GitHub Pages gameplay. None of these is being presented as finished.

### References
- [F1 KayKit Hunter decision](docs/KAYKIT-CHARACTER-F1.md)
- [F0 foundation plan](docs/FOUNDATION-F0.md)
- [External asset approvals](docs/ASSET-APPROVALS.md)

Never import a new pack or a new version without owner approval. The repository is public.
