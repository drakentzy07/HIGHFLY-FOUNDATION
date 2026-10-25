# HIGHFLY FOUNDATION — F0: decisiones y control de importaciones

Fecha: 2026-10-25
Estado: PLANIFICACION — SIN MOTOR NI RECURSOS DE TERCEROS IMPORTADOS

## Objetivo
Juego RPG de mundo abierto e inspiracion isekai, orientado prioritariamente a Android horizontal (Samsung S23 Ultra), con personajes universales sin clases, combate FURY 360 y habilidades propias.

## Base de referencia
- World of ClaudeCraft 0.44.7 (referencia oficial fija `493c35a108cef6c8aa290e8793107b1cd117886e`).
- Su codigo fuente tiene licencia MIT; los recursos graficos y de audio se rigen por las licencias individuales declaradas en CREDITS.md.
- No copiar la distribucion original sin filtrar: separar assets CC0/compatibles de los de permisos restringidos.
- GitHub Pages para la prueba web offline; no confundir Pages con servidor multijugador.

## Reglas obligatorias
1. Antes de incorporar material de otro repositorio, version o pack, consultar con el propietario y registrar aprobacion explicita.
2. No mezclar los repositorios historicos ni fusionar ramas sin autorizacion.
3. No agregar modelos, imagenes, sonidos ni iconos de licencia desconocida.
4. El repositorio es PUBLICO: auditar licencias ANTES de cada commit de recursos externos, no solo antes de distribuir el juego.
5. Mantener procedencia, version, licencia, archivos importados y cambios realizados en un manifiesto de recursos.
6. Primero una prueba jugable Android: personaje + movimiento + guardado + 4 habilidades propias + NPC + monstruo + edificio transitable. Luego ampliar.

## Propuesta de personaje — pendiente de aprobacion

### Preferencia tecnica propuesta
- Cuerpo masculino y femenino de Quaternius Universal Base Characters (licencia CC0).
  https://quaternius.com/packs/universalbasecharacters.html
- Skins completas a partir de Modular Character Outfits - Fantasy (licencia CC0).
  https://quaternius.com/packs/modularcharacteroutfitsfantasy.html
- Posibles animaciones de la biblioteca Universal Animation Library 1/2 (CC0), sujetas a consulta adicional.
- KayKit Adventurers CC0 queda como alternativa tecnica de referencia; NO se presume que su esqueleto sea intercambiable con el de Quaternius.
- Antes de importar: verificar contenidos exactos del tier gratuito y rendimiento en el dispositivo.

### Separacion arquitectonica propuesta
- `CharacterIdentity`: nombre, nivel, progreso y atributos propios, sin clase de jugador.
- `CharacterAppearance`: cuerpo (masculino/femenino), skin completa, cabello y visual de armas.
- `UniversalSkillLoadout`: cuatro habilidades equipadas de un catalogo propio, mas ataques basicos y movimiento.
- `CombatDriver`: FURY 360, targeting, dash, salto, cancels, ventanas de combo y animacion.
- `EquipmentState`: armas y objetos con reglas del juego nuevo, no reglas de Warrior/Rogue/Mage.
- `LegacyAdapter`: puente temporal hacia los sistemas de World of ClaudeCraft; NO usar Warrior como clase definitiva.

### Riesgo detectado en la base 0.44.7
- `src/sim/entity.ts`: `createPlayer(id, cls, ...)` utiliza `CLASSES[cls]` y establece `entity.templateId = cls`.
- `src/render/characters/manifest.ts`: claves visuales `player_warrior`, `player_mage`, etc.
- `src/sim/entity.ts`: estadisticas derivadas por clase, equipamiento y modificadores de talentos.
- NO basta intercambiar `knight.glb`: hay que desacoplar identidad, stats, recursos, habilidades, equipo y visual por capas.

## Estatus
- [x] Repositorio HIGHFLY-FOUNDATION creado por el propietario y confirmado como publico.
- [x] Referencia tecnica 0.44.7 seleccionada.
- [x] Riesgo de dependencia de clases identificado.
- [ ] Propietario autoriza los packs exactos que se incorporaran.
- [ ] Auditoria de archivos y licencias antes de importar.
- [ ] Copia selectiva del motor MIT autorizada y realizada.
- [ ] Prototipo verificable en GitHub Pages.
- [ ] Prueba real Android S23 Ultra con guardado, camara, FURY 360 y 4 habilidades.

IMPORTANTE: este documento describe propuestas y no implica que se hayan importado recursos, integrado FURY o probado el juego.
