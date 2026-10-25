# HIGHFLY F5 FULL LOCAL — acceder al mundo original íntegro y editor

## Qué es y qué NO es

Esta rama contiene un **lanzador local** para la versión exacta de **World of ClaudeCraft v0.44.7** (SHA `493c35a108cef6c8aa290e8793107b1cd117886e`). El usuario clona por su cuenta el repositorio oficial y lo ejecuta en su PC mediante el modo de desarrollo offline ya incluido por su autor. El script crea una página de ingreso separada (`/highfly-f5-local.html`) sin desarmar el motor ni alterar el terreno, editor, NPC, monstruos, misiones o medios originales.

**El motor y editor completos son los ORIGINALES, todavía NO el HIGHFLY definitivo**. Sigue existiendo el selector de clases de WOC y no está integrado el Hunter universal, FURY 360°, el HUD MOBA ni las cuatro habilidades propias. La ruta `/editor` es el editor original en modo local, no una implementación nueva.

Este método NO pone archivos de WOC dentro del repositorio HIGHFLY, NO los redistribuye como artefactos, NO los publica en GitHub Pages, y NO convierte recursos restringidos en libres. Respeta y mantiene `LICENSE`, `CREDITS.md` y los avisos originales.

## Requisitos locales (Windows)

- Windows 10/11, Git, Node.js 22+ con Corepack, conexión a Internet para la primera instalación y disco suficiente para el checkout original, dependencias y cachés. El proyecto original es grande; preferible contar con varios GB libres.
- Para entrar desde un celular, la PC y el Samsung deben estar en la **misma red Wi‑Fi privada** y Windows debe permitir el puerto local 5173. **Nunca abrir el puerto de tu router a Internet**.
- La PC del proyecto puede quedarse corta de RAM: si el navegador va lento, cerrá otras pestañas; Vite y el juego completo demandan bastante memoria.

## Ejecutar

Clonar **HIGHFLY-FOUNDATION** en esta rama o descargar solo sus scripts de la rama experimental, conservando la estructura de carpetas. Desde PowerShell, situado en la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\f5-full-local.ps1
```

El script descarga **el original oficial 0.44.7** a `.highfly-local/world-of-claudecraft-0447`, verifica el SHA exacto, instala dependencias según su `pnpm-lock.yaml`, agrega la página local y ejecuta Vite escuchando en la red privada.

- PC: `http://localhost:5173/highfly-f5-local.html`
- Samsung S23 Ultra: `http://IP-DE-TU-PC:5173/highfly-f5-local.html` (el script intenta imprimir la IP real).
- En el lanzador elegí **Entrar al mundo original** y luego **Offline**. Para el editor usá **Abrir editor original**.
- `Ctrl+C` cierra el servidor. El acceso se termina en ese momento.
- Este proceso no modifica ni reemplaza tu progreso almacenado por F4a en GitHub Pages, porque es otro origen (servidor local).

### Reproducibilidad CI

`.github/workflows/f5-full-local.yml` clona y compila WOC completo con la página local (sin publicar ni adjuntar sus archivos). Un GREEN de CI valida compilación; **no prueba controles Android, licencia individual, rendimiento ni funcionalidad del Hunter universal**. Para calificar F5 HIGHFLY jugable todavía faltan F5-01 a F5-06 descritos en `docs/F5-BASELINE-COMPLETA.md`.

### Derechos de terceros

`CREDITS.md` del original autoriza algunos medios como parte de un fork y reserva otros para Levy Street o bajo términos no comerciales. No distribuir este checkout ni su `dist/` sin completar la clasificación, sustitución o autorización de cada recurso según los términos del autor. Este procedimiento es **para pruebas locales**, no un release público.

## Continuación técnica

1. Completar mapeo de cada recurso físico a `CREDITS.md`, reemplazando restricciones antes de cualquier hosting.
2. Aplicar la entrada HIGHFLY y un Hunter sin dependencia oculta de las nueve clases al original; mantener tests y guardado.
3. Integrar el motor FURY 360° y cuatro habilidades originales en render/sim/input.
4. Una vez limpia la distribución, hacer build Android/Pages con assets por streaming y QA táctil real.
