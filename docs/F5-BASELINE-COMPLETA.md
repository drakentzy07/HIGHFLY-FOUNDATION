# HIGHFLY F5 — baseline COMPLETA de ClaudeCraft 0.44.7

## Decisión

La arquitectura principal será una **derivación de la base completa World of ClaudeCraft v0.44.7**, no un mundo nuevo de primitivas ni una reconstrucción de cada subsistema.

Fuente inmutable aprobada:
- https://github.com/levy-street/world-of-claudecraft/tree/v0.44.7
- Commit exacto `493c35a108cef6c8aa290e8793107b1cd117886e`.
- Código fuente: licencia **MIT**, conservando avisos y autorías.
- **Medios:** cada GLB, textura, sprite, audio, fuente y contenido requiere autorización específica según `CREDITS.md` y la licencia de origen. MIT del código NO convierte los medios en MIT.

## Gate F5-00 ya implementado

`.github/workflows/f5-full-woc-baseline.yml` hace checkout de **todo el proyecto original** a un runner efímero y compila su flujo `pnpm run build` con las dependencias de `pnpm-lock.yaml` sin modificar fuentes.

**Intencionalmente NO publica, rehostea, copia ni sube el resultado de esta compilación**: la salida podría contener contenido restringido. Solo informa qué funciona y cuánto pesa.

## Ruta de transformación segura (etapas independientes, no borrar antes de saber el impacto)

1. **F5-00 COMPILACIÓN ORIGINAL:** confirmar si la base íntegra compila reproduciblemente. Detectar fallos de dependencias/scripts sin introducir cambios del Hunter.
2. **F5-01 AUDITORÍA DE MEDIOS:** clasificar **archivo por archivo** en CC0/permitido, condicionado, restringido, o desconocido. Por defecto dejar fuera cualquier medio sin autorización suficiente; nunca asumir que “con el proyecto solamente” permite una distribución nueva con marca HIGHFLY.
3. **F5-02 BASE LICENCIADA:** preparar versión de media filtrada con sustitutos *que ya estén aprobados por el usuario* y hashes/procedencia. NO publicar si aún quedan archivos fuera de lista o rutas rotas. No subir carpetas enteras `public`.
4. **F5-03 ARRANQUE HIGHFLY:** sustituir pantalla de entrada, logos, Steam/online según especificaciones y respetar full-screen Samsung S23 Ultra. Reutilizar el editor/terreno/render/comportamiento de la base.
5. **F5-04 HUNTER UNIVERSAL:** retirar dependencia de 9 clases del **jugador**, con migración de constructor, tipos, equipo, guardado, combate y redes, manteniendo NPCs/mobs. Personaje KayKit independiente de ropa; el sexo afecta rostro **solo al existir componentes reales para ello**.
6. **F5-05 FURY + CUATRO SKILLS:** joystick de movimiento a izquierda, cámara libre derecha, saltar/dash/ATK en movimiento y aire, apuntado/cancel, cuatro habilidades originales inspiradas mecánicamente en giro y ulti de Balmond, salto y orbe de Guinevere.
7. **F5-06 ANDROID:** CI de producción, Pages y pruebas de usuario en S23 Ultra. No se califica GREEN real hasta que el usuario confirme visual, cámara, controles y guardado.

## Qué se conserva de ClaudeCraft

Mundo 15 zonas, generación de terreno y aguas, caminos, streaming, motor de render, contenido NPC y monstruos, IA, sistema de escenas/editor, dungeons, mapa, profesiones e inventario **cuando sus recursos y reglas sean compatibles y lícitos**. Se corrige sistemáticamente la integración del Hunter sin introducir un “Warrior invisible”.

## Qué NO se debe hacer

- No convertir la ausencia de GLB autorizados en un mapa plano con casas fabricadas.
- No reemplazar el editor real por uno simplificado.
- No asumir que retirar logos elimina derechos de terceros.
- No publicar el resultado del build completo hasta clasificar los medios.
- No anunciar Pages F5 jugable solo por tener una build verde.
- No arrastrar cambios no autorizados de otros repos HIGHFLY ni nuevos packs/versions.

## Estado

El prototipo parcial F4 demostró compilación y entrada geográfica de WOC, pero falló inicialmente al cargar edificios por falta de decodificadores **KTX2 y Meshopt**. Ese aprendizaje se conserva como diagnóstico, no como nueva arquitectura. Hasta que F5 ofrezca un reemplazo verificable, la app pública F3/F4a anterior permanece intacta.
