import { INITIAL_TOOL, MAX_GARDEN_SIZE, TILE_TYPES } from "./constants.js";
import { GardenScene } from "./garden-scene.js";
import { GardenState } from "./garden-state.js";
import { clampSize } from "./utils.js";

export class GardenApp {
  constructor() {
    this.state = new GardenState();
    this.selectedTool = INITIAL_TOOL;
    this.wasPointerDragged = false;
    this.pointerDown = null;
    this.elements = this.getElements();
    this.scene = new GardenScene(this.elements.canvas, this.state);

    this.renderTools();
    this.syncControls();
    this.bindUI();
    this.bindSceneInteractions();
  }

  getElements() {
    return {
      canvas: document.getElementById("garden-canvas"),
      controlPanel: document.getElementById("control-panel"),
      panelToggle: document.getElementById("panel-toggle"),
      dimensionForm: document.getElementById("dimension-form"),
      width: document.getElementById("garden-width"),
      length: document.getElementById("garden-length"),
      widthValue: document.getElementById("width-value"),
      lengthValue: document.getElementById("length-value"),
      sizeHelp: document.getElementById("size-help"),
      toolGrid: document.getElementById("tool-grid"),
      activeToolLabel: document.getElementById("active-tool-label"),
      resetButton: document.getElementById("reset-button"),
      undoButton: document.getElementById("undo-button"),
      hoverReadout: document.getElementById("hover-readout"),
      sizeReadout: document.getElementById("size-readout"),
      selectedReadout: document.getElementById("selected-readout"),
      saveReadout: document.getElementById("save-readout")
    };
  }

  renderTools() {
    this.elements.toolGrid.innerHTML = Object.entries(TILE_TYPES)
      .map(
        ([type, config]) => `
          <button
            class="tool-button"
            type="button"
            role="radio"
            aria-checked="${type === this.selectedTool}"
            data-tool="${type}"
          >
            <span class="tool-swatch" style="background:${config.color}"></span>
            <span class="tool-name">${config.label}</span>
          </button>
        `
      )
      .join("");
  }

  bindUI() {
    this.elements.dimensionForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    this.elements.width.addEventListener("input", () => {
      this.resizeFromSliders();
    });

    this.elements.length.addEventListener("input", () => {
      this.resizeFromSliders();
    });

    this.elements.panelToggle.addEventListener("click", () => {
      const isCollapsed = this.elements.controlPanel.classList.toggle("is-collapsed");
      this.elements.panelToggle.classList.toggle("is-collapsed", isCollapsed);
      this.elements.panelToggle.setAttribute("aria-expanded", String(!isCollapsed));
      this.elements.panelToggle.textContent = isCollapsed ? "Controls" : "Hide";
    });

    this.elements.toolGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-tool]");
      if (!button) return;
      this.selectedTool = button.dataset.tool;
      this.renderTools();
      this.syncControls();
    });

    this.elements.resetButton.addEventListener("click", () => {
      this.state.reset();
      this.scene.generateGrid();
      this.scene.frameGarden();
      this.scene.setHoveredTile(null);
      this.scene.setSelectedTile(null);
      this.syncControls();
    });

    this.elements.undoButton.addEventListener("click", () => {
      const restored = this.state.undo();
      if (!restored) return;
      this.scene.generateGrid();
      this.scene.frameGarden();
      this.scene.setHoveredTile(null);
      this.scene.setSelectedTile(null);
      this.syncControls();
    });
  }

  resizeFromSliders() {
    const width = clampSize(this.elements.width.value);
    const length = clampSize(this.elements.length.value);
    const changed = this.state.resize(width, length);

    this.syncControls();
    if (!changed) return;

    this.scene.generateGrid();
    this.scene.frameGarden();
    this.scene.setHoveredTile(null);
    this.scene.setSelectedTile(null);
  }

  bindSceneInteractions() {
    this.elements.canvas.addEventListener("pointermove", (event) => {
      if (this.pointerDown) {
        const dx = event.clientX - this.pointerDown.x;
        const dy = event.clientY - this.pointerDown.y;
        this.wasPointerDragged = Math.hypot(dx, dy) > 5;
      }

      const tile = this.scene.getTileFromPointer(event);
      this.scene.setHoveredTile(tile);
      this.updateHoverReadout(tile);
    });

    this.elements.canvas.addEventListener("pointerleave", () => {
      this.scene.setHoveredTile(null);
      this.updateHoverReadout(null);
      this.pointerDown = null;
    });

    this.elements.canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      this.pointerDown = { x: event.clientX, y: event.clientY };
      this.wasPointerDragged = false;
    });

    this.elements.canvas.addEventListener("pointerup", (event) => {
      if (event.button !== 0 || !this.pointerDown) return;
      const tile = this.scene.getTileFromPointer(event);
      const canPlace = tile && !this.wasPointerDragged;
      this.pointerDown = null;

      if (!canPlace) return;

      this.scene.setSelectedTile(tile);
      const changed = this.state.setTile(tile.x, tile.z, this.selectedTool);
      if (changed) {
        this.scene.updateTile(tile.x, tile.z);
        this.updateHoverReadout(tile);
        this.syncControls();
      }
    });

    this.elements.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  updateHoverReadout(tile) {
    if (!tile) {
      this.elements.hoverReadout.textContent = "Hover a tile";
      return;
    }

    const type = TILE_TYPES[this.state.getTile(tile.x, tile.z)].label;
    this.elements.hoverReadout.textContent = `Tile ${tile.x + 1}, ${tile.z + 1}: ${type}`;
  }

  syncControls() {
    this.elements.width.value = this.state.width;
    this.elements.length.value = this.state.length;
    this.elements.width.max = MAX_GARDEN_SIZE;
    this.elements.length.max = MAX_GARDEN_SIZE;
    this.elements.widthValue.textContent = this.state.width;
    this.elements.lengthValue.textContent = this.state.length;
    this.elements.sizeHelp.textContent = `Drag from 1 to ${MAX_GARDEN_SIZE}. In-bounds tiles stay; new tiles become soil.`;
    this.elements.activeToolLabel.textContent = TILE_TYPES[this.selectedTool].label;
    this.elements.sizeReadout.textContent = `${this.state.width} x ${this.state.length}`;
    this.elements.selectedReadout.textContent = TILE_TYPES[this.selectedTool].label;
    this.elements.saveReadout.textContent = "Local";
    this.elements.undoButton.disabled = !this.state.canUndo();
  }
}
