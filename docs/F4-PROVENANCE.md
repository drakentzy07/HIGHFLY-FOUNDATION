# F4 — licencias y procedencia aprobadas

Fuente MIT de mundo/sim/render: World of ClaudeCraft v0.44.7, commit `493c35a108cef6c8aa290e8793107b1cd117886e`.
Repositorio: https://github.com/levy-street/world-of-claudecraft/tree/v0.44.7
Licencia MIT: https://github.com/levy-street/world-of-claudecraft/blob/v0.44.7/LICENSE
Créditos y permisos INDIVIDUALES para media: https://github.com/levy-street/world-of-claudecraft/blob/v0.44.7/CREDITS.md

**No redistribuir** los recursos marcados `No, permission required` ni `With the project only` fuera de las condiciones explícitas de su licencia. Los únicos binarios WOC incluidos en este build están a continuación. Todos ellos se respaldan en las entradas CC0 de Quaternius Medieval Village Pack, Stylized Nature MegaKit y criaturas animadas que constan con redistribución Yes en CREDITS.md. Las cabeceras de código MIT conservan su licencia original en el proceso de checkout; no se copian paquetes premium.

| Archivo en el build | Git blob SHA fijo de WOC v0.44.7 | Licencia |
| --- | --- | --- |
| `assets/woc-cc0/house_1.glb` | `88f7b20a2b4376a53c6e9444910386b1a8a5f510` | CC0 |
| `assets/woc-cc0/house_2.glb` | `fb45ec1b03e81dc37e133569e91a666e79d4470b` | CC0 |
| `assets/woc-cc0/house_3.glb` | `5cece5805e034c57a1581645e8ddf1f2962ee269` | CC0 |
| `assets/woc-cc0/inn.glb` | `e65e40883afe48b6c3f4da389d73efc9acd60290` | CC0 |
| `assets/woc-cc0/well.glb` | `a80bb7f20e048621195e300e58a0aebbcc83af66` | CC0 |
| `assets/woc-cc0/blacksmith.glb` | `a654d0fb8cdaeca95e45a4a97086b0e072374a34` | CC0 |
| `assets/woc-cc0/wolf.glb` | `00d69a6c127752c2506c66bc93db9a10f4a73df0` | CC0 |
| `assets/woc-cc0/pine_1.glb` | `43e0328735bcca037ac87f32c11a9b9b52cb11fa` | CC0 |
| `assets/woc-cc0/oak_1.glb` | `decbef02a1a2a5904232b60b1fae8e5c2fd1e5d3` | CC0 |
| `assets/woc-cc0/twisted_1.glb` | `f649826c05d7de2cf307917c073c3ed952fcc093` | CC0 |
| `assets/woc-cc0/rock_1.glb` | `9a89d0ed1ddaadda62938c487c3279999c370c58` | CC0 |

**Personaje KayKit:** commit oficial `672074b73ba276876a19e8816ecdc5241817ab47`; Knight, Mage, Rogue GLB, CC0, hashes verificados en el workflow. No se importó Quaternius Character Pack, ni otro repertorio de animaciones no autorizado.

**Relevancia:** usar edificios Quaternius CC0 del *mundo ya aprobado* es distinto a cambiar la elección del personaje principal (KayKit). El paquete de origen completo del mundo contiene además arte restringido que **NO se incorpora**.

## Límites de integración
Se ejecuta el auténtico generador de altimetría `groundHeight`, renderer `buildTerrain` y localizaciones/densidad `BUILTIN_WORLD`/`generateDecorationsInBounds`. Sin embargo, aún no está integrada la simulación completa de NPC ni el renderer original de props en su totalidad. Algunas clases de edificios especiales de WOC se omiten si su modelo es desconocido o no autorizado; nunca se reemplazan por edificios inventados. El filtro de edificios actual permite `house`/`inn` de fuente original.

Pendiente: licencia individual de más assets, renderer de árboles avanzado, streaming de props en cada región, IA, HUD de combate, editor, altas luces y pruebas S23 Ultra.
