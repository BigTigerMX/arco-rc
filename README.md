# ARCO · Arquitectura & Construcción

Portal web para **arco-rc.com**, estudio de arquitectura y construcción (Arq. Rodrigo Cabrera).

Sitio estático (HTML + CSS + JavaScript, sin dependencias de build) listo para publicarse en GitHub Pages o cualquier hosting.

## Estructura

```
arco_rc/
├── index.html          # Página principal (hero, estudio, servicios, proyectos, proceso, contacto)
├── proyectos.html      # Portafolio completo con filtros por categoría + lightbox
└── assets/
    ├── css/style.css   # Identidad visual y estilos
    ├── js/main.js      # Slider, filtros, lightbox, animaciones
    └── img/
        ├── gallery/    # 19 fotos de proyectos (G1–G19)
        └── slider/     # imágenes de apoyo
```

## Características

- Diseño responsivo (escritorio, tablet y móvil).
- Hero con slider automático.
- Galería filtrable por categoría (Casas · Interiorismo · Diseño · Construcción) con lightbox.
- Animaciones de aparición al hacer scroll.
- Tipografías: Cormorant Garamond (títulos) + Jost (texto).
- Logo: monograma en forma de arco (ARCO = *arco* arquitectónico).

## Ver en local

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

## Pendientes de contenido real (reemplazar placeholders)

- Teléfono, correo y dirección reales.
- Nombres reales de los proyectos y sus descripciones.
- Textos de "Estudio" y cifras del estudio.
- Redes sociales (Instagram / Facebook / LinkedIn).

---

Fotografías originales del portafolio de Arco / Rodrigo Cabrera.
