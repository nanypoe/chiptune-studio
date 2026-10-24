# Estado

Género: folk-metal-espanol
Estado: tested
Archivos: library/folk-metal-espanol/DOSSIER.md, library/folk-metal-espanol/SPEC.json, library/folk-metal-espanol/TEST.json, inbox/folk-metal-español.md
Decisiones:
- Célula acotada al folk metal español de base heavy metal con color celta-ibérico y vocación de estadio, no al folk metal finlandés ni al black/viking.
- Id normalizado a folk-metal-espanol; el inbox traía folk-metal-celta-iberico y no coincidía con el slug.
- Tempo 100–150 BPM, típico 128; mapa por secciones con bar 0-based (intro 112, estrofa/estribillo 128, puente 120, outro 132).
- Densidades recalculadas incluyendo batería; el inbox las subestimaba.
- 8 pistas en el test: pulse, dos saw (riff y doblez), bass, drums, strings, triangle y guitar.
- El doblez de la melodía en el estribillo usa una segunda capa de saw; la quinta sustituye a la octava cuando choca con la raíz del riff.
- Test «Alborada de hierro»: 16 compases, A menor, 112→128 BPM, 387 notas, 100/100 en check, sin avisos.
Limitaciones:
- Sin transcripciones verificables; BPM, patrones y progresiones son inferencias (confianza 0.62).
- Sin voces, samples, microtonalidad, vibrato por nota ni cambio de compás.
- El colchón usa tercera y quinta para no duplicar la raíz del riff; el bajo alterna raíz y quinta en el estribillo.
- El test comprime las secciones de 8 compases a 4; el spec completo mantiene 34 compases.
Pendiente: escucha humana del TEST.json; si se reconoce el género, pasar a validated. No está validado.
No releer: catálogo completo, demos, otros dossiers.

## Handoff

```text
Continúa en ai/dossiers. Lee sessions/STATE.md y library/folk-metal-espanol/SPEC.json.
Género: folk-metal-espanol. Estado: tested.
Siguiente: escuchar library/folk-metal-espanol/TEST.json (Menú → Abrir JSON) y, si convence, marcarlo validated.
No recargues el catálogo entero.
```
