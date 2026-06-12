import * as THREE from "three";
import { TEXTURE_SIZE } from "./constants.js";
import { seededRandom } from "./utils.js";

const makeCanvasTexture = (paint) => {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const context = canvas.getContext("2d");
  paint(context, TEXTURE_SIZE);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
};

export const makeMaterialTexture = (kind) => {
  if (kind === "soil") {
    return makeCanvasTexture((context, size) => {
      context.fillStyle = "#7a4b2e";
      context.fillRect(0, 0, size, size);

      for (let i = 0; i < 950; i += 1) {
        const shade = seededRandom(i + 12);
        const radius = 0.8 + seededRandom(i + 93) * 2.4;
        context.fillStyle = shade > 0.68 ? "#9c6840" : shade > 0.34 ? "#684027" : "#4c3021";
        context.globalAlpha = 0.18 + seededRandom(i + 41) * 0.34;
        context.beginPath();
        context.arc(seededRandom(i + 3) * size, seededRandom(i + 7) * size, radius, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 0.18;
      context.strokeStyle = "#3b271b";
      for (let i = 0; i < 24; i += 1) {
        const y = seededRandom(i + 201) * size;
        context.beginPath();
        context.moveTo(0, y);
        for (let x = 0; x <= size; x += 18) {
          context.lineTo(x, y + Math.sin(x * 0.08 + i) * 4);
        }
        context.stroke();
      }
      context.globalAlpha = 1;
    });
  }

  if (kind === "grass") {
    return makeCanvasTexture((context, size) => {
      const gradient = context.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, "#4f9d58");
      gradient.addColorStop(1, "#286f3f");
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);

      for (let i = 0; i < 620; i += 1) {
        const x = seededRandom(i + 19) * size;
        const y = seededRandom(i + 29) * size;
        const length = 8 + seededRandom(i + 31) * 16;
        context.strokeStyle = seededRandom(i + 37) > 0.5 ? "#6dbd62" : "#1f6638";
        context.globalAlpha = 0.28 + seededRandom(i + 43) * 0.36;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + Math.sin(i) * 3, y - length);
        context.stroke();
      }
      context.globalAlpha = 1;
    });
  }

  if (kind === "stone") {
    return makeCanvasTexture((context, size) => {
      context.fillStyle = "#bec3bf";
      context.fillRect(0, 0, size, size);

      for (let i = 0; i < 520; i += 1) {
        const shade = Math.floor(160 + seededRandom(i + 5) * 70);
        context.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade})`;
        context.globalAlpha = 0.18 + seededRandom(i + 13) * 0.22;
        context.beginPath();
        context.arc(
          seededRandom(i + 17) * size,
          seededRandom(i + 23) * size,
          1 + seededRandom(i + 31) * 4,
          0,
          Math.PI * 2
        );
        context.fill();
      }

      context.globalAlpha = 0.28;
      context.strokeStyle = "#727a76";
      context.lineWidth = 1;
      for (let i = 0; i < 9; i += 1) {
        context.beginPath();
        const startX = seededRandom(i + 70) * size;
        const startY = seededRandom(i + 80) * size;
        context.moveTo(startX, startY);
        for (let j = 0; j < 4; j += 1) {
          context.lineTo(startX + seededRandom(i * 10 + j) * 80 - 40, startY + j * 18);
        }
        context.stroke();
      }
      context.globalAlpha = 1;
    });
  }

  return makeCanvasTexture((context, size) => {
    context.fillStyle = "#b56535";
    context.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 18) {
      context.fillStyle = y % 36 === 0 ? "rgba(132, 65, 35, 0.28)" : "rgba(232, 143, 82, 0.18)";
      context.fillRect(0, y, size, 6);
    }
    for (let i = 0; i < 300; i += 1) {
      context.fillStyle = seededRandom(i + 4) > 0.45 ? "#8f4c2b" : "#d78348";
      context.globalAlpha = 0.16;
      context.fillRect(seededRandom(i + 11) * size, seededRandom(i + 22) * size, 2, 2);
    }
    context.globalAlpha = 1;
  });
};
