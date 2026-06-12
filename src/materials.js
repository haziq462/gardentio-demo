import * as THREE from "three";
import { makeMaterialTexture } from "./textures.js";

export const createMaterials = () => {
  const soilTexture = makeMaterialTexture("soil");
  const grassTexture = makeMaterialTexture("grass");
  const stoneTexture = makeMaterialTexture("stone");
  const potTexture = makeMaterialTexture("pot");

  return {
    soil: new THREE.MeshStandardMaterial({
      map: soilTexture,
      bumpMap: soilTexture,
      bumpScale: 0.045,
      color: 0xa07048,
      roughness: 0.98
    }),
    grass: new THREE.MeshStandardMaterial({
      map: grassTexture,
      bumpMap: grassTexture,
      bumpScale: 0.035,
      color: 0x5ca75f,
      roughness: 0.92
    }),
    stone: new THREE.MeshStandardMaterial({
      map: stoneTexture,
      bumpMap: stoneTexture,
      bumpScale: 0.03,
      color: 0xd3d2ca,
      roughness: 0.84
    }),
    pot: new THREE.MeshStandardMaterial({
      map: potTexture,
      bumpMap: potTexture,
      bumpScale: 0.025,
      color: 0xb76838,
      roughness: 0.78
    }),
    potSoil: new THREE.MeshStandardMaterial({
      map: soilTexture,
      bumpMap: soilTexture,
      bumpScale: 0.04,
      color: 0x5a3724,
      roughness: 0.98
    }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x2d7a43, roughness: 0.78, side: THREE.DoubleSide }),
    stem: new THREE.MeshStandardMaterial({ color: 0x2f7d4b, roughness: 0.72 }),
    flowerPink: new THREE.MeshStandardMaterial({ color: 0xd84a72, roughness: 0.64, side: THREE.DoubleSide }),
    flowerYellow: new THREE.MeshStandardMaterial({ color: 0xf5c84b, roughness: 0.54, side: THREE.DoubleSide }),
    grassBlade: new THREE.MeshStandardMaterial({
      color: 0x3f8f45,
      roughness: 0.7,
      side: THREE.DoubleSide,
      transparent: true
    }),
    stonePebble: new THREE.MeshStandardMaterial({ color: 0xe0ded7, roughness: 0.9 }),
    soilPebble: new THREE.MeshStandardMaterial({ color: 0x5f3d28, roughness: 1 }),
    twig: new THREE.MeshStandardMaterial({ color: 0x3d2a1f, roughness: 0.95 }),
    border: new THREE.MeshBasicMaterial({ color: 0x3d3025, transparent: true, opacity: 0.2 })
  };
};
