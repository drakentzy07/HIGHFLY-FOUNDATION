# HIGHFLY FOUNDATION

**F4 — Ingreso al mundo GEOGRÁFICO ORIGINAL de World of ClaudeCraft 0.44.7, con Hunter KayKit sin clases.**

**[Abrir HIGHFLY en GitHub Pages](https://drakentzy07.github.io/HIGHFLY-FOUNDATION/)**

## Qué es esta versión
- Inicio HIGHFLY en español, creador universal sin Warrior/Mage/Rogue, guardado y Continuar.
- Terreno y altimetría calculados por el motor original de World of ClaudeCraft 0.44.7 (commit `493c35a1...`); renderizador original `buildTerrain` con streaming por región.
- Camino, edificios/pozos y ubicaciones de NPC/campamentos tomados directamente del contenido auténtico `BUILTIN_WORLD` de la 0.44.7.
- Árboles y rocas en los puntos originales de `generateDecorationsInBounds`, con modelos CC0 que ya formaban parte del mundo ClaudeCraft.
- Animaciones y protagonista KayKit CC0, independiente de las clases.
- Movimiento cámara relativa, joystick, dash preliminar, doble salto, solicitudes de pantalla completa, HUD, guardado local de posición.
- NPCs de posiciones originales con visual KayKit genérico e interacción básica de saludo. ATK de **animación**, sin daño todavía.

## Límites: NO es aún el MMORPG completo
**No están integrados** el simulador total de ClaudeCraft, la IA original de los NPC/monstruos, las misiones, drops, dungeons, inventario universal completo, el editor, el motor definitivo FURY ni las cuatro skills con VFX. El módulo geográfico está integrado, **pero el mundo social/combatiente sigue en desarrollo**. Algunos modelos de zonas posteriores necesitan ser auditados y añadidos. La apariencia masculina/femenina se guarda, pero los modelos KayKit base no incorporan una cara femenina/male editable comprobada.

## Reproducibilidad y licencias
El CI toma la fuente MIT **exacta** de WOC v0.44.7 y descarga únicamente archivos CC0 de una **lista explícita con hashes Git SHA**, sin copiar indiscriminadamente su directorio `public/`. Se publican los créditos originales en `assets/woc-cc0/WOC-CREDITS.md`. Los modelos de casas y plantas son Quaternius CC0 *que ya usa el mundo original*, **no se ha adoptado Quaternius como protagonista**, que sigue siendo KayKit.

Véanse [proveniencia y hashes](docs/F4-PROVENANCE.md) y [auditoría fundacional del mundo](docs/F4-RESTORE-WOC-WORLD.md).

## Desarrollo
```bash
npm install
npm test
```
Para compilar esta versión en local se necesita un checkout legítimo y fijado del código MIT WOC en `.vendor/world-of-claudecraft` y descargar los assets CC0 aprobados en `public/assets/`; el workflow de Pages reproduce estos pasos y verifica los SHA. No conviene clonar la carpeta `public` completa por restricciones de licencia.

**GREEN de CI no reemplaza la prueba Android real.** Comprobar Samsung S23 Ultra, GLBs, joystick, cámara, pantalla completa, altimetría, colisiones y guardado.
