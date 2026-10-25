// Explicit, conservative permission map; no assets copied without proof.
const safeHeroes=new Set(['knight','mage','rogue','rogue_hooded','barbarian']);
const safeMonsters=new Set(['wolf','wolf_basic','bull','fox','stag','alpaca','spider','frog','goblin','orc','yeti','demon','ghost','tribal','velociraptor']);
const safeWeapon=/^(adv_(axe|dagger|staff|sword|wand|druid)|axe_[a-d]|dagger(?:_[a-c])?|hammer_[a-d]|staff(?:_[a-d])?|sword(?:_[a-g])?|shield_(?:round|square|badge)|skeleton_(?:axe|blade|crossbow|staff|shield_large_a)|wand(?:_[ab])?|bow|crossbow|quiver|scythe|halberd|spear_a)\.glb$/i;
export function allowResource(logical) {
  const path=logical.replaceAll('\\','/');
  if(/^models\/biome\/(beach_|camp_|cave_|city_|desert_|dungeon_|hex_|hexb_|hexn_|hexr_|kcas_|sea_)[a-zA-Z0-9_-]+\.glb$/.test(path))return 'CC0: Kenney/Quaternius/KayKit/loafbrr named model kit (CREDITS)';
  if(/^models\/foliage\/(?:bush|bush_flowers|dead_[1-3]|fern|mushroom|oak_[1-5](?:_field)?|pine_[1-5](?:_field)?|rock_[1-3]|twisted_[1-3](?:_field)?)\.glb$/.test(path))return 'CC0: Quaternius stylized nature';
  if(/^models\/chars\/players\/[^/]+\.glb$/.test(path)) {
    const name=path.split('/').at(-1).slice(0,-4);
    if(safeHeroes.has(name)||(/^(knight|mage|rogue|barbarian)_(?:hit_variety_anims|ability_anims)$/.test(name)))return 'CC0: KayKit character and adapted animation rig';
  }
  if(/^models\/chars\/enemies\/skeleton_(?:warrior|mage|rogue|dagger|minion_free)\.glb$/.test(path))return 'CC0: KayKit Skeleton Character Pack';
  if(/^models\/creatures\/[^/]+\.glb$/.test(path) && safeMonsters.has(path.split('/').at(-1).replace('.glb','')))return 'CC0: Quaternius animated creature pack';
  if(/^models\/weapons\/[^/]+\.glb$/.test(path)&&safeWeapon.test(path.split('/').at(-1)))return 'CC0: KayKit character weapons/shields';
  if(/^models\/dungeon\/(?:arch|banner|bar|barrel|barrier|bed|bench|bone|book|bottle|box|bucket|candle|chair|chest|coffin|coin|column|crate|crypt|fence|floor|grave|haybale|pillar|rock|stairs|table|torch|wall)[a-zA-Z0-9_-]*\.glb$/i.test(path))return 'CC0: KayKit modular dungeon kit';
  if(/^textures\/terrain\/[^/]+$/.test(path) && /^(Ground|Grass|Rock|Snow|Gravel|Lava|PavingStones)/i.test(path.split('/').at(-1)))return 'CC0: ambientCG terrain PBR textures';
  if(/^env\/(?:hollow_dusk|ember_storm|frost_twilight|amber_sunset|fen_day|nightbloom_dream|wraithwood_gloom)_(?:1k|2k|512)\.ktx2$/.test(path))return 'With project only: original credited WOC Realm sky KTX2/PMREM';
  if(/^env\/(?:space_galaxy)\.jpg$/.test(path))return 'CC-BY 4.0: ESO/S.Brunier attribution';
  if(/^vfx\/fel_meteor_impact\.png$/.test(path))return 'With the project only: WOC project-generated VFX';
  if(/^textures\/loading\/[^/]+\.webp$/.test(path))return 'With the project only: WOC in-game loading art';
  if(/^textures\/(?:eastbrook_surface_(?:atlas|normal|rough)|fenbridge_surface_(?:atlas|normal|roughness))\.webp$/.test(path))return 'With the project only: WOC town texture';
  return null;
}
