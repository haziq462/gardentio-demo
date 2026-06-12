# Tile Garden Planner

An interactive 3D garden planner built with Three.js, HTML, CSS, and vanilla JavaScript.

Resize a tile-based garden, place different surface and decoration types, and move around the scene with mouse, keyboard, and zoom controls. This is a static demo build of a personal frontend/creative coding project.

## Features

- Adjustable garden width and length
- Placeable tile types: soil, grass, stepping stone, pot, and flowers
- Interactive 3D camera with orbit, pan, zoom, and keyboard movement
- Procedural canvas textures for soil, grass, stone, and pottery surfaces
- Local browser persistence with `localStorage`
- Responsive floating control panel
- Undo and reset actions

## Controls

- Drag: orbit the camera
- Right-drag or shift-drag: pan the camera
- Scroll: zoom in and out
- WASD or arrow keys: move the camera viewpoint
- Click a tile: place the selected tile type

## Tech Stack

- Three.js
- JavaScript ES modules
- HTML
- CSS
- Browser `localStorage`

## Run Locally

Serve the project from a local web server because it uses ES modules:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

If port `8000` is already in use, choose another port:

```bash
python3 -m http.server 8001
```

## Project Structure

```text
.
├── index.html
├── styles.css
├── app.js
└── src/
    ├── constants.js
    ├── garden-app.js
    ├── garden-scene.js
    ├── garden-state.js
    ├── materials.js
    ├── textures.js
    ├── tile-objects.js
    └── utils.js
```

## Notes

The app runs entirely in the browser. It does not require a backend or account system, and saved garden state stays in the user's local browser storage.

## Demo

<img width="1438" height="713" alt="image" src="https://github.com/user-attachments/assets/9548a7e6-8f8c-44fa-9a15-4ca6b628efc8" />

https://github.com/user-attachments/assets/b1fa970e-d741-432f-aef9-76b9a37caa48



