import { DEFAULT_LENGTH, DEFAULT_WIDTH, STORAGE_KEY, TILE_TYPES } from "./constants.js";
import { clampSize, tileKey } from "./utils.js";

export class GardenState {
  constructor() {
    const stored = this.load();
    this.width = stored.width;
    this.length = stored.length;
    this.tiles = stored.tiles;
    this.history = [];
  }

  load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed) return this.createDefaultState();

      const width = clampSize(parsed.width);
      const length = clampSize(parsed.length);
      const tiles = new Map();

      for (let z = 0; z < length; z += 1) {
        for (let x = 0; x < width; x += 1) {
          const savedType = parsed.tiles?.[tileKey(x, z)];
          tiles.set(tileKey(x, z), TILE_TYPES[savedType] ? savedType : "soil");
        }
      }

      return { width, length, tiles };
    } catch {
      return this.createDefaultState();
    }
  }

  createDefaultState() {
    const tiles = new Map();
    for (let z = 0; z < DEFAULT_LENGTH; z += 1) {
      for (let x = 0; x < DEFAULT_WIDTH; x += 1) {
        tiles.set(tileKey(x, z), "soil");
      }
    }
    return { width: DEFAULT_WIDTH, length: DEFAULT_LENGTH, tiles };
  }

  toJSON() {
    return {
      width: this.width,
      length: this.length,
      tiles: Object.fromEntries(this.tiles)
    };
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.toJSON()));
  }

  getTile(x, z) {
    return this.tiles.get(tileKey(x, z)) ?? "soil";
  }

  setTile(x, z, type, shouldRecord = true) {
    if (!TILE_TYPES[type] || !this.isInBounds(x, z)) return false;

    const key = tileKey(x, z);
    const previous = this.tiles.get(key);
    if (previous === type) return false;

    if (shouldRecord) {
      this.history.push({ kind: "tile", x, z, previous, next: type });
    }

    this.tiles.set(key, type);
    this.save();
    return true;
  }

  resize(width, length) {
    const nextWidth = clampSize(width);
    const nextLength = clampSize(length);
    if (nextWidth === this.width && nextLength === this.length) return false;

    const previous = this.toJSON();
    const nextTiles = new Map();

    // Resizing preserves existing tile contents that remain inside the new bounds.
    // Newly exposed coordinates are initialized as soil, and cropped coordinates are removed.
    for (let z = 0; z < nextLength; z += 1) {
      for (let x = 0; x < nextWidth; x += 1) {
        nextTiles.set(tileKey(x, z), this.tiles.get(tileKey(x, z)) ?? "soil");
      }
    }

    this.history.push({ kind: "resize", previous });
    this.width = nextWidth;
    this.length = nextLength;
    this.tiles = nextTiles;
    this.save();
    return true;
  }

  reset() {
    this.history.push({ kind: "reset", previous: this.toJSON() });
    const fresh = this.createDefaultState();
    this.width = fresh.width;
    this.length = fresh.length;
    this.tiles = fresh.tiles;
    this.save();
  }

  undo() {
    const entry = this.history.pop();
    if (!entry) return false;

    if (entry.kind === "tile") {
      this.setTile(entry.x, entry.z, entry.previous, false);
    } else {
      this.restore(entry.previous);
    }

    this.save();
    return true;
  }

  restore(snapshot) {
    this.width = clampSize(snapshot.width);
    this.length = clampSize(snapshot.length);
    this.tiles = new Map(Object.entries(snapshot.tiles));
  }

  isInBounds(x, z) {
    return x >= 0 && x < this.width && z >= 0 && z < this.length;
  }

  canUndo() {
    return this.history.length > 0;
  }
}
