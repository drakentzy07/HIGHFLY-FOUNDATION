# HIGHFLY FOUNDATION

**Estado: F2 — núcleo Hunter universal + FURY de gestos + puente de lectura World of ClaudeCraft 0.44.7.**

Objetivo: RPG isekai de mundo abierto, pensado para Android horizontal, con un solo personaje que aprende habilidades y utiliza armas sin clases ni especializaciones. **KayKit** es la base visual seleccionada y autorizada.

## Código implementado
- **Hunter sin clases:** estadísticas, entrenamiento, progresión, equipo, cuatro habilidades propias de prototipo y combo ATK 1-2-3-4 (`src/core/hunter.mjs`).
- **Gestos FURY:** joystick relativo a cámara, apuntado con arrastrar/soltar/cancelar, intención de dash y doble salto (`src/core/fury-input.mjs`).
- **Puente 0.44.7:** lectura de la lista de enemigos y conversión de coordenadas al sistema de apuntado del Hunter (`src/bridge/world0447.mjs`).
- **Guardado:** validación y recuperación de la estructura del personaje, con almacenamiento inyectable (`src/core/hunter-save.mjs`).
- **Pruebas automáticas:** `npm test` (21 pruebas de lógica), `npm run demo`.

## Límites verificados
Los resultados son **pruebas de lógica**, no del videojuego completo. Aún NO se han importado la simulación de ClaudeCraft, los archivos GLB KayKit ni un motor de física/animación FURY funcional. Las intenciones de combate no aplican daño autoritativo al mundo. No hay build Pages ni Android jugable que podamos certificar.

## Seguimiento
- [F0 — base y licencia](docs/FOUNDATION-F0.md)
- [F1 — personaje KayKit universal](docs/KAYKIT-CHARACTER-F1.md)
- [F2 — puente y limitaciones](docs/F2-STATUS.md)
- [Recursos permitidos y aprobaciones](docs/ASSET-APPROVALS.md)

Todo nuevo recurso externo requiere aprobación previa del propietario antes de incorporarlo al repositorio público. Las referencias ya aprobadas son ClaudeCraft **0.44.7** (código MIT, con filtrado de assets) y **KayKit** (packs CC0 originales).
