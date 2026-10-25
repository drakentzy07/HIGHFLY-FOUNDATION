# F2 — Puente del Hunter universal hacia ClaudeCraft 0.44.7

**Estado: 21/21 pruebas de lógica completadas. NO es una demo 3D.**

## Lo comprobado
- `src/bridge/world0447.mjs` lee `IWorld.entities: Map<number,Entity>`, `IWorld.player.pos` y candidatos con `kind:"mob"`. Traduce coordenadas de mundo a coordenadas relativas al cazador.
- `castIntent` y `attackIntent` ejecutan la geometría HIGHFLY y devuelven propuestas de impacto con `applied:false` y `requiresAuthority:true`. No reducen vida a mobs ni utilizan `castAbility` de las clases.
- `src/core/fury-input.mjs` define movimientos relativos a cámara; mantener la dirección al correr, apuntar/arrastrar/soltar/cancelar, solicitudes de dash y doble salto con giro direccional. **No integra físicas, reproducción de clips ni colisión.**
- `src/core/hunter-save.mjs` proporciona validación de schema 1 y serialización/deserialización mediante API Storage. Probado con almacenamiento falso; **aún no hay partida real del mundo guardada**.
- `tests/f2-bridge.test.mjs` cubre 11 casos adicionales a los 10 de F1.
- Integración real WOC v0.44.7 pendiente; no hay importaciones externas en este avance.

## Riesgos encontrados en World of ClaudeCraft 0.44.7
El contrato original `src/world_api/entity_roster.ts` declara `cfg.playerClass: PlayerClass`. `src/sim/entity.ts:createPlayer` guarda `templateId=cls` y utiliza `CLASSES[cls]` para estadísticas y recursos. `src/world_api/combat.ts` resuelve ataques desde el libro de habilidades, por clase. `src/render/characters/manifest.ts` usa claves visuales `player_warrior`, `player_mage`...

**No basta seleccionar Knight.glb:** hay que sustituir la identidad de clase en creación, serialización, simulación, reglas de equipo, red y render. No debemos inventar un Warrior invisible como solución definitiva.

## Próximo corte — F3
1. Tomar **únicamente** el código MIT autorizado de ClaudeCraft 0.44.7 y filtrar recursos restringidos *antes* de publicarlo. Preservar avisos MIT.
2. Mapear `HunterState` a entidades WOC sin usar clase ficticia, modificar el constructor de jugador y resolver referencias obligatorias.
3. Resolver daño, cooldown y apuntado en el núcleo autoritativo; validar facciones, LOS, colisión y estados. El cliente no decide daño.
4. Incorporar GLB KayKit originales CC0 autorizados cuando puedan obtenerse con comprobación de procedencia, hashes y licencia. Comprobar hombre/mujer con las variantes disponibles: el pack público verificado contiene Knight, Mage, Rogue, Rogue_Hooded, Barbarian, pero no garantiza por sí solo cuerpos universales masculino y femenino separados.
5. Animación completa con Rig_Medium; pruebas de movimiento sin bloqueo, ataque aéreo, doble salto con mortal, dash continuo y fallos de apuntado.
6. Verificar arranque offline, guardado persistente y posteriormente Pages/Android. No anunciar URL jugable hasta desplegar y probar.

### Política
KayKit y ClaudeCraft 0.44.7 ya fueron seleccionados por el propietario. Consultar **antes** de cualquier otra incorporación de repositorios, versiones, motores, librerías, paquetes o medios. No modificar repos históricos.
