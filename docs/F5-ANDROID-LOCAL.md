# F5 FULL — Pruebas privadas en Android con APK local

**Experimental, no release público.** La compilación del mundo completo + HUD táctil WOC ya pasó CI web. Este archivo explica el mecanismo **local** de APK; hasta una prueba real en Android, **no se declara APK jugable ni probado**.

## ¿Es legal cambiar Pages por APK?

No existe una exención de derechos por usar formato APK o por alojar la web en otro servidor. Es diferente clonar el código del autor y probarlo **personalmente** sin entregar los archivos a terceros, frente a distribuir el paquete que contiene modelos, sonidos e íconos. El primer caso reduce el problema de redistribución pública, pero no convierte en libres los recursos reservados. Para redistribuir, respetar el CREDITS original (MIT del código, medios por licencia).

Leer obligatoriamente `CREDITS.md`, `LICENSE` y `docs/F5-BASELINE-COMPLETA.md`. Cuando un recurso no figura en CREDITS, su situación es desconocida, **no autorizada** para lanzamiento.

## Prueba recomendada ahora: navegador del Samsung por Wi-Fi

Con Windows+Node+Git ejecutar `scripts/f5-full-local.ps1` (desde esta rama) y abrir en tu celular la dirección LAN que imprime. Mantiene terreno y sistemas originales y evita el peso y complejidad de la compilación Android. El acceso es por red privada mientras está encendida la PC; **no abrir puertos del router al exterior**.

## Opción APK privado compilado directamente en la PC

Requisitos: Windows 10/11, Node 22+, Git, Corepack, **Android Studio + SDK + JDK (incluido en Android Studio)** y **varios GB libres**, mucho más que para Pages. Los 8 GB de RAM del equipo de prueba pueden resultar insuficientes. No se necesita cuenta Play Store ni Play Console para instalar tu propio APK de depuración.

1. Ejecutar una vez desde la raíz `powershell -ExecutionPolicy Bypass -File .\scripts\f5-full-local.ps1`, esperar a que el servidor arranque y detenerlo con `Ctrl+C`. El original exacto se clona en `.highfly-local/world-of-claudecraft-0447` y se instala.
2. Configurar `ANDROID_HOME` o `ANDROID_SDK_ROOT` al directorio del Android SDK.
3. Ejecutar `powershell -ExecutionPolicy Bypass -File .\scripts\f5-android-local-apk.ps1`.
4. Si Gradle termina exitosamente, el APK estará **solo en tu disco local**: `.highfly-local/private-test-output/HIGHFLY-F5-PRIVATE-LOCAL-TEST.apk`. Pasarlo manualmente a **tu propio** dispositivo para verificar.
5. Entrar en modo **Offline**. Este prototipo hereda sistemas y dependencias del original; aunque se desactiva su actualizador OTA y se asigna identidad `com.highfly.f5local`, no garantiza aislamiento completo de comunicaciones remotas. No usar cuentas ni servidores oficiales de terceros para probar funcionalidades derivadas.

### Qué hace técnicamente

- Obtiene la versión oficial `v0.44.7` de WOC y verifica el commit inmutable; no sube sus binarios a HIGHFLY.
- Agrega lanzador y HUD nativo HIGHFLY al checkout local. El HUD utiliza ATK y cuatro slots **existentes de WOC**, todavía no skills propias.
- Configura temporalmente `CapacitorUpdater.autoUpdate=false`, identidad `com.highfly.f5local` y endpoint API inválido en la build nativa para evitar el uso intencional del backend oficial.
- Ejecuta build nativa, `build_media_manifest.mjs prune`, Capacitor sync y Gradle `:app:assemblePlayDebug` (APK sideload, no AAB/Play Store).
- NO sube el APK a GitHub, NO crea release, NO publica los medios en Pages.
- Por defecto la compilación puede incluir medios de **redistribución restringida**; no compartir el archivo APK fuera de tus pruebas personales.

## Para el release público

Se debe reemplazar cada medio `No, permission required` y resolver el registro de procedencia/autoría de todos los medios enviados. También falta el Hunter universal sin clases, el motor FURY 360 completo y las cuatro skills originales con VFX. La rama PR #9 es un **prototipo de integración**, no una versión pública aprobada.

**Nota:** desarrollo local no significa permiso general de uso comercial ni de redistribución. Si se planea liberar binarios con algún recurso de licencia no clara, solicitar autorización expresa de Levy Street o del titular correspondiente antes del lanzamiento.
