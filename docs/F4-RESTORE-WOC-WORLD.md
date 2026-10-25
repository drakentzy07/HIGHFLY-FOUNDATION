# F4 — RESTAURACIÓN DEL MUNDO ORIGINAL de ClaudeCraft 0.44.7

**Prioridad absoluta establecida 2026-10-25:** volver al mundo original y dejar de producir mapas sustitutos. El prototipo F3 cumplió pruebas de entrada/touch, pero no es la experiencia jugable pactada.

## Qué se verificó directamente en fuente oficial
Fuente WOC v0.44.7 SHA `493c35a108cef6c8aa290e8793107b1cd117886e`.
- `src/sim/data.ts` publica el contenido original `BUILTIN_WORLD`: 15 zonas, caminos `ROADS`, población de NPC `npcs`, campamentos `camps`, edificios `props.buildings` y posición real `PLAYER_START`.
- `src/sim/world.ts:groundHeight` es el generador original del terreno con colisiones y agua, y su terreno es determinista por seed.
- `src/render/terrain.ts:buildTerrain` es el renderizador real del terreno con streaming por zonas, `ensureZone`, `update` y `dispose`.
- `src/render/props.ts:buildProps` es el motor de construcciones y decorados; registro mezcla activos CC0 y generados de otros tipos que requieren filtro jurídico.
- En `src/sim/entity.ts` la identidad `playerClass` y `templateId=cls` siguen siendo obligatorias en la simulación upstream. No introducir una clase Warrior oculta en HIGHFLY.

## Lo implementado técnicamente en esta rama
- Checkout CI de código fuente MIT únicamente, fijado al SHA exacto (no descarga de recursos multimedia WOC).
- Adaptador de geografía WOC: inicio real, zonas, altura de terreno, caminos y datos de campamentos/NPC.
- Envoltorio para el renderizador **real** WOC 0.44.7 `buildTerrain`, sin reconstruir terreno con sinusoidales.
- Primera compilación de estos módulos en Vite aprobada. No constituye una prueba visual ni integración del mapa total en el juego.

## Por qué NO fusionar esta rama como la nueva app todavía
- El motor del terreno nativo arrastra un grafo de más de 200 módulos; al incluir la capa del render original el bundle de prueba superó 5 MB antes de los modelos y produjo paquetes de idiomas. Optimización de importaciones necesaria para móvil.
- Aún faltan el motor y geometría de props CC0 **filtrados**, casas/ciudades, foliage, eventos, ciudades, NPCs, mobs e interiores.
- `buildTerrain` no equivale al mundo entero sin `buildProps`, IA Sim, networking y guardado. **No decir que se recuperó el mundo jugable aún**.
- La integración requiere un simulador Hunter sin clases, visual independiente KayKit y referencias internas de equipo/skills no restringidas a Warrior/Mage/Rogue.
- El mundo original contiene medios declarados `No, permission required` y `With the project only`; consultar archivo oficial CREDITS, nunca hacer checkout de `public/` indiscriminado en nuestro repo público.
- Cualquier recurso *nuevo fuera de las fuentes ya elegidas* requiere aprobación explícita.

## Decisiones de personaje tras auditoría GLB de Knight/Mage/Rogue
- 41 huesos/joints, 76 animaciones por archivo, nodo separado `head` y `Knight_Head`/`Mage_Head`/`Rogue_Head`.
- No se detectaron morph targets ni dos modelos de sexo separados en esos tres GLB. La elección hombre/mujer guardada todavía NO cambia el rostro.
- Arquitectura buscada: una cabeza/rostro equipable independiente del conjunto visual/armadura. No condicionar ropa ni habilidades al sexo. Validar qué variantes de cabeza de KayKit están realmente autorizadas y disponibles antes de publicarlas.

## Gates verificables ANTES de llamar F4 World GREEN
1. Fuente WOC 0.44.7 + avisos MIT y mapa/zonas reales cargados.
2. Arquitectura sin clase oculta y sin guardados incompatibles.
3. Paisaje, caminos, casas originales CC0, NPC y mobs cargados en posiciones originales (no figuras genéricas).
4. Colisiones y streaming establecidos por WOC: agua, niveles y altimetría sin caer bajo el suelo.
5. Full screen funcional según navegador y PWA horizontal, joystick correcto y controles FURY.
6. Guardar salida/entrada conservando posición, inventario e identidad.
7. URL Pages publicada y prueba S23 Ultra sin pantalla negra / GLB error.
8. Cuatro skills y VFX solo después de asegurar exploración y combate base.

## Seguimiento
- F4a HOTFIX de controles/creador/fullscreen, PR #5, está integrado y publicado.
- Esta rama `feature/f4-woc-native-terrain` es fuente nativa en construcción, **NO publicada como mapa completo**.
- La rama de skills `feature/f3-four-skills` queda aparcada; no integrarla hasta estabilizar el mundo real.
