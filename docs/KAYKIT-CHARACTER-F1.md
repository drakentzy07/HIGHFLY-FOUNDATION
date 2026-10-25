# F1 — Hunter universal KayKit (audit, 2026-10-25)

## Decision
Owner explicitly selected **KayKit**, not Quaternius. Main goal: ONE classless Hunter, free weapon choice, original skills, cosmetic skins, masculine and feminine appearance choices.

## What ClaudeCraft v0.44.7 really binds to a class
Reference commit: \`493c35a108cef6c8aa290e8793107b1cd117886e\`

- \`src/sim/entity.ts:createPlayer(id, cls, pos, name)\` takes a PlayerClass and writes \`entity.templateId = cls\`.
- \`src/sim/entity.ts:recalcPlayerStats\` starts from \`CLASSES[cls]\`, and derives player combat values from class, equipment and talent modifiers.
- \`src/render/characters/manifest.ts:VISUALS\` maps \`player_warrior\` to knight.glb, \`player_mage\` to mage.glb, etc.
- \`src/render/characters/manifest.ts:SKINS\` is keyed to player class. \`weapon_skin_rules.ts\` also reads player templateId as class identity.
- Character creation, class-specific abilities, resource formulas, professions/perks, save/load and spellbook have to be audited together. **Changing a GLB alone cannot remove the class.**

## Safe extraction architecture
1. Independent \`Hunter\` identity/progression/save schema; absolutely no hidden Warrior class.
2. Independent \`Appearance\` with a selectable presentation and skin/model. Appearance must NEVER gate a learned skill or weapon.
3. Independent \`Equipment\` with weapon grip compatibility but without Warrior/Mage/Rogue bans.
4. \`Skills\` as data; exactly four active slots initially, trained/learned individually; aiming & damage separate from visuals.
5. \`FURY\` provides movement/targeting and passes authoritative intents to simulation. Movement must not freeze during attacks or mobile casts.
6. A **legacy adapter** will be required to bind these into WOC \`Sim\` and renderer; the original map/NPC/mob/dungeon systems remain desirable.
7. Preserve deterministic offline/server rules and the same saved identity in either host. Do not silently spawn a Warrior internally.

## KayKit asset facts
Official CC0 source: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0

The verified GitHub pack contains \`Knight.glb\`, \`Mage.glb\`, \`Rogue.glb\`, \`Rogue_Hooded.glb\`, \`Barbarian.glb\`, sharing the KayKit Rig_Medium family with existing WOC 0.44.7 player visuals. It does **not** contain two interchangeable, separately labelled male/female bodies. Gender presentation is currently a cosmetic user choice; validate which face/body/texture variants feel masculine/feminine during a visual test. Do not claim a true independently customizable male/female body pipeline has shipped yet.

These characters are full-body archetypes, NOT guaranteed interchangeable modular outfits. In phase 1, \`visual\` swaps a complete character model; visible weapons will be attached via rig sockets and an animation adapter once the models are imported and tested.

The SOURCE/EXTRA itch tiers differ from the public GitHub pack; do not promise that paid variants are in the free archive.

## Scope of this F1 code
- Classless Hunter JS logic, skill slots, weapon slots, training, level cap, facing, simple geometric skill hit queries, combo progression and tests.
- All balance numbers and original skill names are **provisional prototypes**, not final game design.
- Target positions in these tests are **relative to player**, not world coordinates; real integration must translate and validate via WOC authoritative collision/LOS/damage.
- This is NOT the full FURY 360 controller: no movement dynamics, animation blending, knockback, rollback, authoritative hit resolution or VFX yet.
- **No third-party binary models, icons, sounds or ClaudeCraft source were imported in this commit.**
- GitHub Pages playable URL is NOT ready; no engine or assets are deployed. Android verification is pending.

## Follow-up gates
- Approve precise KayKit GLB variants to include, then copy from official CC0 source and record hashes.
- Design body/skin presets (two presentation choices) with real previews; verify animation rig and weapon sockets.
- Import filtered ClaudeCraft v0.44.7 engine code only after clean-resource audit.
- Implement one-world NPC/wolf battle proof with targeting, real physics and save/load on mobile.
