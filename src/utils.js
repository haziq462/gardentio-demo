import { MAX_GARDEN_SIZE } from "./constants.js";

export const clampSize = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 1;
  return Math.min(MAX_GARDEN_SIZE, Math.max(1, parsed));
};

export const tileKey = (x, z) => `${x},${z}`;

export const seededRandom = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};
