/* Instrumento de Chiptune Studio. Formato: cs-instrument@1 (ver README). Solo datos: edítalo y recarga. */
CS.registerInstrument({
  "schema": "cs-instrument@1",
  "id": "drums",
  "name": "Batería",
  "family": "Percusión",
  "color": "#9aa3c7",
  "pan": 0,
  "aliases": [],
  "tip": "12 piezas, de abajo hacia arriba: bombo y caja marcan el pulso; platillos y shaker llenan los huecos; toms y crash para los cambios de sección.",
  "pieces": {
    "kick": {
      "name": "Bombo",
      "layers": [
        {
          "type": "osc",
          "wave": "sine",
          "freq": [
            160,
            42
          ],
          "sweep": 0.1,
          "decay": 0.28,
          "gain": 0.9
        },
        {
          "type": "noise",
          "filter": "highpass",
          "freq": 3000,
          "q": 1,
          "decay": 0.012,
          "gain": 0.15,
          "delay": 0
        }
      ]
    },
    "snare": {
      "name": "Caja",
      "layers": [
        {
          "type": "noise",
          "filter": "highpass",
          "freq": 1500,
          "q": 1,
          "decay": 0.16,
          "gain": 0.35,
          "delay": 0
        },
        {
          "type": "osc",
          "wave": "triangle",
          "freq": [
            190,
            150
          ],
          "sweep": 0.05,
          "decay": 0.08,
          "gain": 0.25
        }
      ]
    },
    "rim": {
      "name": "Aro",
      "layers": [
        {
          "type": "osc",
          "wave": "square",
          "freq": [
            820,
            700
          ],
          "sweep": 0.02,
          "decay": 0.03,
          "gain": 0.3
        },
        {
          "type": "noise",
          "filter": "bandpass",
          "freq": 2500,
          "q": 1,
          "decay": 0.02,
          "gain": 0.2,
          "delay": 0
        }
      ]
    },
    "clap": {
      "name": "Palmada",
      "layers": [
        {
          "type": "noise",
          "filter": "bandpass",
          "freq": 1400,
          "q": 1,
          "decay": 0.03,
          "gain": 0.5,
          "delay": 0
        },
        {
          "type": "noise",
          "filter": "bandpass",
          "freq": 1400,
          "q": 1,
          "decay": 0.03,
          "gain": 0.5,
          "delay": 0.011
        },
        {
          "type": "noise",
          "filter": "bandpass",
          "freq": 1400,
          "q": 1,
          "decay": 0.18,
          "gain": 0.5,
          "delay": 0.022
        }
      ]
    },
    "hat": {
      "name": "Hi-hat",
      "layers": [
        {
          "type": "noise",
          "filter": "highpass",
          "freq": 7500,
          "q": 1,
          "decay": 0.05,
          "gain": 0.18,
          "delay": 0
        }
      ]
    },
    "openhat": {
      "name": "Hi-hat abierto",
      "layers": [
        {
          "type": "noise",
          "filter": "highpass",
          "freq": 6500,
          "q": 1,
          "decay": 0.3,
          "gain": 0.18,
          "delay": 0
        }
      ]
    },
    "shaker": {
      "name": "Shaker",
      "layers": [
        {
          "type": "noise",
          "filter": "bandpass",
          "freq": 6000,
          "q": 1,
          "decay": 0.09,
          "gain": 0.12,
          "delay": 0
        }
      ]
    },
    "ride": {
      "name": "Ride",
      "layers": [
        {
          "type": "noise",
          "filter": "bandpass",
          "freq": 7000,
          "q": 1,
          "decay": 0.6,
          "gain": 0.1,
          "delay": 0
        },
        {
          "type": "osc",
          "wave": "square",
          "freq": [
            3400,
            3400
          ],
          "sweep": 0.01,
          "decay": 0.35,
          "gain": 0.025
        }
      ]
    },
    "crash": {
      "name": "Crash",
      "layers": [
        {
          "type": "noise",
          "filter": "highpass",
          "freq": 5000,
          "q": 1,
          "decay": 0.95,
          "gain": 0.22,
          "delay": 0
        }
      ]
    },
    "tomlo": {
      "name": "Tom grave",
      "layers": [
        {
          "type": "osc",
          "wave": "sine",
          "freq": [
            120,
            70
          ],
          "sweep": 0.2,
          "decay": 0.4,
          "gain": 0.6
        }
      ]
    },
    "tommid": {
      "name": "Tom medio",
      "layers": [
        {
          "type": "osc",
          "wave": "sine",
          "freq": [
            180,
            95
          ],
          "sweep": 0.18,
          "decay": 0.35,
          "gain": 0.6
        }
      ]
    },
    "tomhi": {
      "name": "Tom agudo",
      "layers": [
        {
          "type": "osc",
          "wave": "sine",
          "freq": [
            260,
            140
          ],
          "sweep": 0.15,
          "decay": 0.3,
          "gain": 0.6
        }
      ]
    }
  }
});
