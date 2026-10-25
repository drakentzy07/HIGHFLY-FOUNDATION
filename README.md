# HIGHFLY FOUNDATION

**F3: ingreso a la app y primera zona 3D con Hunter universal KayKit.** Proyecto público para probar desde Android en horizontal.

## Flujo disponible en la primera build web

Inicio HIGHFLY → Creador de Hunter **sin clases** → Entrar a la zona de integración 3D → joystick/cámara/salto/dash → guardar y continuar.

- Cuerpo visual KayKit CC0 (Knight/Mage/Rogue, descarga oficial en compilación, SHA Git blob verificado).
- Las apariencias son puramente cosméticas y no restringen armas o habilidades.
- Tres.js `0.185.1` y Vite `8.0.16`, mismos números que los de World of ClaudeCraft `v0.44.7`.
- Guardado mediante almacenamiento local y recuperación del mismo Hunter.
- Tests automáticos: `npm test`; build navegador: `npm run build:app`.

## ATENCIÓN: estado de la zona

**Es un escenario de integración TEMPORAL, desarrollado para verificar arranque, animación KayKit, interfaz y controles Android. NO es el mapa original de ClaudeCraft 0.44.7.** El motor completo, poblaciones, edificios con interiores y físicas FURY aún no se han incorporado. No se ha probado en un Samsung S23 Ultra.

La prioridad después de comprobar el ingreso es sustituir el escenario provisional por el mundo real de WOC 0.44.7, utilizando SOLO código MIT y assets permitidos (auditoría de licencias primero). Las cuatro habilidades de combate continúan planificadas; no impiden entrar al mundo.

## Desarrollo local

```bash
npm install
npm test
npm run dev
```

El desarrollo local **no descarga automáticamente los GLB KayKit**: el workflow de Pages los baja desde la fuente CC0 aprobada. Por eso, sin esos archivos locales, el motor muestra una figura de respaldo y no se debe calificar esa prueba como validación del modelo KayKit.

## Referencias y auditoría

- [F3: instrucciones, licencias y lista de comprobación](docs/F3-ENTRY-WORLD.md)
- [F2: puente de Hunter con API WOC 0.44.7](docs/F2-STATUS.md)
- [F1: personaje KayKit universal](docs/KAYKIT-CHARACTER-F1.md)
- [F0: decisiones fundacionales](docs/FOUNDATION-F0.md)
- [Licencias y autorizaciones](docs/ASSET-APPROVALS.md)

Regla fija: antes de importar cualquier otro repositorio, modelo, versión o pack, consultar al propietario.
