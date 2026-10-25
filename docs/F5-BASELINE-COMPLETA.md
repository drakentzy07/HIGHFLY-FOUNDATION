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
2. **F5-01 AUDITORÍA DE MEDIOS:** clasificar **archivo por archivo** en CC0/permitido, “With the project only” (permitido **dentro de un fork genuino** de WOC conforme a CREDITS.md), “No, permission required”, CC BY-NC, marca ajena o desconocido. Excluir por defecto los que no tengan autorización para el uso solicitado; conservar medios “With the project only” solo dentro del fork derivado completo con créditos y sin distribuirlos individualmente.
3. **F5-02 BASE LICENCIADA:** conservar CC0 y medios “With the project only” en el **fork real** según los términos, sustituir *solo* los no redistribuibles o no licenciados con medios aprobados, registrar hashes/procedencia y mantener créditos. NO publicar mientras queden recursos “No”, contenido no comercial incompatible o archivos sin términos claros. No publicar medios como pack separado.
4. **F5-03 ARRANQUE HIGHFLY:** sustituir pantalla de entrada, logos, Steam/online según especificaciones y respetar full-screen Samsung S23 Ultra. Reutilizar el editor/terreno/render/comportamiento de la base.
5. **F5-04 HUNTER UNIVERSAL:** retirar dependencia de 9 clases del **jugador**, con migración de constructor, tipos, equipo, guardado, combate y redes, manteniendo NPCs/mobs. Personaje KayKit independiente de ropa; el sexo afecta rostro **solo al existir componentes reales para ello**.
6. **F5-05 FURY + CUATRO SKILLS:** joystick de movimiento a izquierda, cámara libre derecha, saltar/dash/ATK en movimiento y aire, apuntado/cancel, cuatro habilidades originales inspiradas mecánicamente en giro y ulti de Balmond, salto y orbe de Guinevere.
7. **F5-06 ANDROID:** CI de producción, Pages y pruebas de usuario en S23 Ultra. No se califica GREEN real hasta que el usuario confirme visual, cámara, controles y guardado.


## Auditoría completada en GitHub Actions

**Fuente**: ejecución [F5 inventario GREEN](https://github.com/drakentzy07/HIGHFLY-FOUNDATION/actions/runs/40228175798); la salida se audita sobre el proyecto completo en un runner efímero y NO se publica.

| Métrica | Resultado |
|---|---:|
| Archivos \`public/\` original | 6.443 |
| Tamaño \`public/\` original | 798,5 MiB |
| Archivos compilados \`dist/\` | 8.533 |
| Tamaño compilado \`dist/\` | 1.374,4 MiB |
| GLB de origen | 1.465, 210,8 MiB |
| GLB finales | 2.930, 421,6 MiB |
| HDR de origen | 30, 148,4 MiB |
| HDR finales | 60, 296,8 MiB |
| Audio MP3 de origen | 1.340, 223,7 MiB |

El doble recuento de archivos GLB y HDR en \`dist\` **sugiere duplicación de entrega** entre \`media/\` y las rutas públicas originales. Se debe analizar el cargador/manifest antes de eliminar duplicados: pueden coexistir referencias en ambos formatos.

**Categorías registradas en \`CREDITS.md\` (FILAS de medios, no archivos individuales):** 36 \`Yes\`, 3 \`Yes, attribution required\`, 1 SIL OFL, **137 \`With the project only\` utilizables en un fork genuino**, 69 \`No, permission required\`, 9 \`Non-commercial only, with attribution\`.

Estos 255 registros **NO clasifican automáticamente los 6.443 archivos**. Hace falta trazar cada binario hasta su procedencia; cualquier medio no documentado queda fuera hasta verificar sus derechos.

**Prioridad de reducción sin perder mundo:** mantener todo el código original; evaluar entrega duplicada, recursos de marketing/no usados, voces/música no necesarias en la primera carga y asset pools legalmente válidos. No quitar el render/editor/sim para ahorrar megas ni asumir que todo el paquete de \`dist\` está autorizado.


## Hallazgo clave en CREDITS.md (F5)

El archivo de licencia de WOC **distingue claramente** los recursos “With the project only” de los “No, permission required”. Los primeros **sí pueden incluirse y distribuirse como parte de World of ClaudeCraft o de un fork genuino**, pero no como catálogo de assets por separado. Los segundos deben eliminarse, sustituirse o contar con autorización escrita. Los CC BY-NC solo son aptos para usos no comerciales con atribución; la concesión comercial concedida al original no se transmite automáticamente. Logos comerciales, autorías y marcas de terceros no quedan licenciados por MIT.

Nuestra estrategia F5 debe conservar **todo lo legalmente aprovechable de un fork verdadero**: código MIT, medios CC0 y medios condicionados al fork. La transformación HIGHFLY modificará branding/gameplay sin fingir que el material preexistente se volvió propio. El inventario por extensión y tamaño es un diagnóstico, **no** prueba de licencia individual.

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
