# HIGHFLY F3 — prioridad absoluta: ENTRAR AL MUNDO

Estado: pantalla, creador, lógica del Hunter, escena 3D provisional y controles desarrollados en la rama `feature/f3-entry-kaykit-world`.

## Recorrido que vamos a probar
1. Abrir app web y comprobar entrada HIGHFLY en español (sin marcas ClaudeCraft).
2. Crear un **Hunter universal**, escoger nombre y apariencia KayKit; **no escoger clase ni especialización**.
3. Entrar a una **zona 3D provisional propia**, mover joystick izq, arrastrar sobre el lado derecho para girar cámara; WASD en escritorio.
4. Saltar y dash en movimiento; volver a menú, pulsar CONTINUAR y recuperar nombre, apariencia y posición.

## Límites IMPORTANTES
- **No es todavía el mapa original de WOC v0.44.7.** Este es un recinto técnico de integración generado con geometría nuestra, etiquetado de forma visible como provisional. No lo presentar como entregable del mundo definitivo.
- La integración del simulador, terreno, poblaciones y ciudades de WOC 0.44.7 exige depuración de licencias y un adaptador real sin clases. Sigue siendo la prioridad posterior al smoke test.
- Los modelos KayKit Knight/Mage/Rogue se descargan durante la compilación desde el repositorio oficial CC0 a una versión fijada por SHA; se comprueba el hash de Git blob de cada GLB y se conserva su licencia. No se importan recursos reservados de WOC.
- Three.js `0.185.1` y Vite `8.0.16` son versiones exactas ya presentes en el WOC v0.44.7 aprobado.
- El selector masculino/femenino almacena la presentación, **sin prometer variantes morfológicas independientes** hasta verificarlas visualmente.
- El "dash" de esta primera prueba es velocidad acelerada temporal, no FURY física final. El salto doble tiene giro experimental, no está certificado como animación del rig.
- Sin monstruos/NPC ni daño real en este primer ingreso; habilidades archivadas para fase posterior. Progreso guardado en localStorage con el Hunter propio, no en el simulador original.
- No afirmar que funciona en Android hasta prueba en S23 Ultra.

## KayKit — procedencia exacta
Repositorio oficial: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0
Referencia fija: `672074b73ba276876a19e8816ecdc5241817ab47`
GLBs:
- Knight.glb Git blob `717b56ca2b5ff5392679774725201ba03a3eefab`
- Mage.glb Git blob `c89f19f6e707f6e07e4632a08876bd6d0172b082`
- Rogue.glb Git blob `c8827661105eef7b2bfbef3bc676d41a47625733`
Licencia: CC0 1.0 (archivo `LICENSE.txt` original).

## Puerta de aceptación
- [ ] Compilación Vite GREEN de GitHub Actions.
- [ ] Descarga de KayKit validada por hashes.
- [ ] Pages publicada y URL verificada.
- [ ] Primera carga en Android S23 Ultra sin pantalla negra.
- [ ] GLB KayKit realmente visible, sin figura técnica sustituta.
- [ ] Movimiento izquierdo no controla cámara; derecha orbita cámara.
- [ ] Guardado y restauración del cazador y posición.
- [ ] Próximo corte: reutilizar terreno y sim v0.44.7 con filtrado de medios, no rehacer un MMORPG desde cero.
