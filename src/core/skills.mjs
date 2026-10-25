// HIGHFLY original gameplay definitions. Balance numbers are provisional.
// The four new skills use gameplay MECHANICS as references, never ML artwork or code.
export const SKILLS = Object.freeze({
  // F1/F2 test prototypes kept to make old saved skills readable.
  arc_bolt: Object.freeze({id:"arc_bolt",label:"Rayo arcano",shape:"line",reach:12,width:1.1,
    resource:"mana",cost:18,cooldownMs:1800,damage:26,mobile:true,prototype:true}),
  blade_arc: Object.freeze({id:"blade_arc",label:"Arco cortante",shape:"cone",reach:3.8,arcDeg:100,
    resource:"energy",cost:15,cooldownMs:2100,damage:22,mobile:true,prototype:true}),
  surge_dash: Object.freeze({id:"surge_dash",label:"Impulso",shape:"line",reach:6,width:1.4,
    resource:"energy",cost:22,cooldownMs:4600,damage:18,mobile:true,dash:true,prototype:true}),
  nova_ring: Object.freeze({id:"nova_ring",label:"Onda circular",shape:"circle",radius:4,reach:0,
    resource:"mana",cost:28,cooldownMs:6500,damage:32,mobile:true,prototype:true}),
  // HIGHFLY F3 definitive starting four: all classless, all names/VFX original.
  torbellino_acero: Object.freeze({id:"torbellino_acero",label:"Torbellino de Acero",
    shape:"circle",radius:3.15,reach:0,resource:"energy",cost:18,cooldownMs:6500,
    damage:6,durationMs:2600,tickMs:260,kind:"spin",mobile:true,vfx:"steel_orbit"}),
  impacto_astral: Object.freeze({id:"impacto_astral",label:"Impacto Astral",
    shape:"circle",radius:2.5,reach:8,resource:"energy",cost:22,cooldownMs:10500,
    damage:28,flightMs:620,launchMs:900,kind:"leap",mobile:true,vfx:"astral_crater"}),
  orbe_astral: Object.freeze({id:"orbe_astral",label:"Orbe Astral",
    shape:"line",reach:12,width:1.2,resource:"mana",cost:16,cooldownMs:3200,
    damage:25,projectileSpeed:12,slowMs:1400,slowPct:0.22,
    kind:"projectile",mobile:true,vfx:"aether_trail"}),
  juicio_coloso: Object.freeze({id:"juicio_coloso",label:"Juicio del Coloso",
    shape:"cone",reach:4.8,arcDeg:115,resource:"energy",cost:28,cooldownMs:17000,
    damage:38,missingHpRatio:0.28,mobDamageCap:150,windupMs:430,
    kind:"finisher",mobile:true,vfx:"colossus_fissure"})
});
export const DEFAULT_SKILLS = Object.freeze([
  "torbellino_acero","impacto_astral","orbe_astral","juicio_coloso"
]);
export function getSkill(id) { return SKILLS[id] ?? null; }
