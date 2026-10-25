// HIGHFLY original gameplay prototypes — no third-party media or engine imports.
// Identifiers are deliberately independent of ClaudeCraft's class system.
export const SKILLS = Object.freeze({
  arc_bolt: Object.freeze({ id: "arc_bolt", label: "Rayo arcano", shape: "line", reach: 12, width: 1.1,
    resource: "mana", cost: 18, cooldownMs: 1800, damage: 26, mobile: true }),
  blade_arc: Object.freeze({ id: "blade_arc", label: "Arco cortante", shape: "cone", reach: 3.8, arcDeg: 100,
    resource: "energy", cost: 15, cooldownMs: 2100, damage: 22, mobile: true }),
  surge_dash: Object.freeze({ id: "surge_dash", label: "Impulso", shape: "line", reach: 6, width: 1.4,
    resource: "energy", cost: 22, cooldownMs: 4600, damage: 18, mobile: true, dash: true }),
  nova_ring: Object.freeze({ id: "nova_ring", label: "Onda circular", shape: "circle", reach: 0, radius: 4,
    resource: "mana", cost: 28, cooldownMs: 6500, damage: 32, mobile: true })
});
export const DEFAULT_SKILLS = Object.freeze(["arc_bolt","blade_arc","surge_dash","nova_ring"]);
export function getSkill(id) { return SKILLS[id] ?? null; }
