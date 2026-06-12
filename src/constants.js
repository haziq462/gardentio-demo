export const STORAGE_KEY = "tile-garden-planner-state-v1";
export const DEFAULT_WIDTH = 5;
export const DEFAULT_LENGTH = 5;

// Change this value to raise or lower the supported garden size everywhere.
export const MAX_GARDEN_SIZE = 14;

export const TILE_SIZE = 1;
export const TILE_GAP = 0.035;
export const TILE_HEIGHT = 0.08;
export const INITIAL_TOOL = "soil";
export const TEXTURE_SIZE = 192;

export const TILE_TYPES = {
  soil: {
    label: "Soil",
    color: "#8b5a35"
  },
  grass: {
    label: "Grass",
    color: "#3f9654"
  },
  stone: {
    label: "Stepping Stone",
    color: "#bfc5c3"
  },
  pot: {
    label: "Pot",
    color: "#b76838"
  },
  flowers: {
    label: "Flowers",
    color: "#d54c70"
  }
};
