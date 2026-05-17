# DigiTarjetas

Landing y demos de invitaciones digitales organizadas por planes comerciales.

## Organizacion de assets

Los recursos compartidos viven en la raiz del proyecto para evitar duplicar imagenes y musica dentro de cada demo.

- Imagenes de demos: `assets/img/demos/nombre-plantilla/`
- Imagenes de clientes reales: `assets/img/clientes/nombre-cliente/`
- Imagenes de UI: `assets/img/ui/`
- Placeholder general: `assets/img/ui/placeholders/placeholder-evento.jpg`
- Musica generica: `assets/music/`
- Musica de clientes reales: `assets/music/clientes/nombre-cliente/`

Las carpetas de demos no deben tener `img/` ni `music/`. Cada demo debe quedar con:

- `index.html`
- `styles.css`
- `script.js`
- `config.json`

## Configuracion de rutas

Cada `config.json` define los recursos desde `assets`:

```json
{
  "assets": {
    "imagesBasePath": "../../../assets/img/demos/neon-party/",
    "musicPath": "../../../assets/music/party-soft.mp3",
    "heroImage": "",
    "coverImage": "",
    "gallery": [
      "foto horizontal 1.png",
      "foto vertical 1.png"
    ],
    "placeholderImage": "../../../assets/img/ui/placeholders/placeholder-evento.jpg"
  }
}
```

Desde demos ubicadas en `demos/tipo-plan/nombre-plantilla/`, usar:

```text
../../../assets/img/...
../../../assets/music/...
```

Si se copia una demo para un cliente real en `clientes/nombre-cliente/`, cambiar las rutas a:

```text
../../assets/img/clientes/nombre-cliente/
../../assets/music/clientes/nombre-cliente/cancion.mp3
```

## Planes y demos

- `demos/quince/` representa Plan Esencial.
- `demos/quince-plus/` representa Plan Plus.
- `demos/quince-premium/` representa Plan Premium.
- `demos/bautismo-esencial/` representa Plan Esencial para bautismos.
- `demos/bautismo-plus/` representa Plan Plus para bautismos.
- `demos/bautismo-premium/` representa Plan Premium para bautismos.

Los nombres de carpetas son internos. En la landing se muestran como Esencial, Plus y Premium.

## Agregar una nueva plantilla

1. Crear la demo en la carpeta del plan correspondiente.
2. Crear `assets/img/demos/nombre-plantilla/`.
3. Guardar ahi las imagenes y un `preview.jpg` para la landing.
4. Si usa musica generica, guardar o reutilizar un archivo en `assets/music/`.
5. Configurar `config.json` con `assets.imagesBasePath`, `assets.musicPath` y `assets.gallery`.
6. Agregar la plantilla en `js/main.js`, dentro del array `templates`.
7. Agregar sus rutas por plan en `demos`.
8. Si la demo tiene selector interno de planes, agregar el slug en `js/demo-switcher.js`.

## Convertir una demo en cliente real

1. Copiar la carpeta de la demo a `clientes/nombre-cliente/`.
2. Subir fotos reales a `assets/img/clientes/nombre-cliente/`.
3. Subir musica real a `assets/music/clientes/nombre-cliente/` si aplica.
4. Cambiar en `config.json`:
   - `imagesBasePath` a `../../assets/img/clientes/nombre-cliente/`
   - `musicPath` a `../../assets/music/clientes/nombre-cliente/cancion.mp3`
5. Cambiar solo textos, fecha, ubicacion, alias y datos del evento en `config.json`.

## Evitar duplicados

No guardes imagenes ni musica dentro de `demos/.../nombre-plantilla/`. Si una plantilla existe en Esencial, Plus y Premium, las tres versiones deben apuntar a la misma carpeta de assets.



