import * as THREE from "three";
import { seededRandom } from "./utils.js";

export class TileObjectFactory {
  constructor(materials) {
    this.materials = materials;
  }

  create(type, x, z) {
    if (type === "soil") return this.createSoilSurface(x, z);
    if (type === "grass") return this.createGrassTufts(x, z);
    if (type === "stone") return this.createStoneSurface(x, z);
    if (type === "pot") return this.createPot();
    if (type === "flowers") return this.createFlowers();
    return null;
  }

  createSoilSurface(tileX, tileZ) {
    const group = new THREE.Group();

    for (let i = 0; i < 8; i += 1) {
      const seed = tileX * 43 + tileZ * 71 + i * 11;
      const pebble = new THREE.Mesh(
        new THREE.SphereGeometry(0.014 + seededRandom(seed + 2) * 0.02, 7, 5),
        this.materials.soilPebble
      );
      pebble.scale.y = 0.32;
      pebble.position.set(seededRandom(seed + 4) * 0.78 - 0.39, 0.065, seededRandom(seed + 6) * 0.78 - 0.39);
      pebble.castShadow = true;
      group.add(pebble);
    }

    for (let i = 0; i < 2; i += 1) {
      const seed = tileX * 89 + tileZ * 101 + i * 17;
      const twig = new THREE.Mesh(
        new THREE.BoxGeometry(0.16 + seededRandom(seed + 1) * 0.09, 0.014, 0.018),
        this.materials.twig
      );
      twig.position.set(seededRandom(seed + 3) * 0.6 - 0.3, 0.072, seededRandom(seed + 5) * 0.6 - 0.3);
      twig.rotation.y = seededRandom(seed + 7) * Math.PI;
      twig.castShadow = true;
      group.add(twig);
    }

    return group;
  }

  createGrassTufts(tileX, tileZ) {
    const group = new THREE.Group();
    const bladeGeometry = new THREE.PlaneGeometry(0.035, 0.16);

    for (let i = 0; i < 18; i += 1) {
      const seed = tileX * 97 + tileZ * 131 + i * 17;
      const blade = new THREE.Mesh(bladeGeometry, this.materials.grassBlade);
      const localX = seededRandom(seed + 1) * 0.72 - 0.36;
      const localZ = seededRandom(seed + 2) * 0.72 - 0.36;
      const height = 0.75 + seededRandom(seed + 3) * 0.85;

      blade.position.set(localX, 0.08 + height * 0.04, localZ);
      blade.scale.set(0.8 + seededRandom(seed + 4) * 0.9, height, 1);
      blade.rotation.y = seededRandom(seed + 5) * Math.PI;
      blade.rotation.x = (seededRandom(seed + 6) - 0.5) * 0.45;
      blade.castShadow = true;
      group.add(blade);
    }

    return group;
  }

  createStoneSurface(tileX, tileZ) {
    const group = new THREE.Group();
    const slab = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.45, 0.045, 18), this.materials.stone);
    slab.scale.set(1.05, 1, 0.82);
    slab.position.y = 0.065;
    slab.rotation.y = seededRandom(tileX * 13 + tileZ * 19) * Math.PI;
    slab.castShadow = true;
    slab.receiveShadow = true;
    group.add(slab);

    for (let i = 0; i < 7; i += 1) {
      const seed = tileX * 83 + tileZ * 109 + i * 23;
      const pebble = new THREE.Mesh(
        new THREE.SphereGeometry(0.018 + seededRandom(seed + 2) * 0.018, 8, 6),
        this.materials.stonePebble
      );
      pebble.scale.y = 0.35;
      pebble.position.set(seededRandom(seed + 4) * 0.62 - 0.31, 0.1, seededRandom(seed + 6) * 0.5 - 0.25);
      pebble.castShadow = true;
      group.add(pebble);
    }

    return group;
  }

  createPot() {
    const group = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.025, 8, 24), this.materials.pot);
    rim.position.y = 0.37;
    rim.castShadow = true;

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.19, 0.34, 22), this.materials.pot);
    pot.position.y = 0.19;
    pot.castShadow = true;
    pot.receiveShadow = true;

    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.026, 18), this.materials.potSoil);
    soil.position.y = 0.375;
    soil.castShadow = true;

    const leafA = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 8), this.materials.leaf);
    leafA.scale.set(1.4, 0.55, 0.8);
    leafA.position.set(-0.08, 0.47, 0.02);
    leafA.castShadow = true;

    const leafB = leafA.clone();
    leafB.position.set(0.09, 0.5, -0.03);
    leafB.rotation.y = 0.7;

    group.add(pot, rim, soil, leafA, leafB);
    return group;
  }

  createFlowers() {
    const group = new THREE.Group();
    const clumpPositions = [
      [-0.18, 0.02],
      [0.05, -0.12],
      [0.18, 0.16],
      [-0.02, 0.18]
    ];

    for (const [x, z] of clumpPositions) {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.34, 8), this.materials.stem);
      stem.position.set(x, 0.23, z);
      stem.castShadow = true;

      const bloom = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 12, 8),
        Math.abs(x) > 0.1 ? this.materials.flowerPink : this.materials.flowerYellow
      );
      bloom.scale.set(1, 0.65, 1);
      bloom.position.set(x, 0.43, z);
      bloom.castShadow = true;

      for (let petalIndex = 0; petalIndex < 5; petalIndex += 1) {
        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 10, 6),
          Math.abs(x) > 0.1 ? this.materials.flowerPink : this.materials.flowerYellow
        );
        const angle = (petalIndex / 5) * Math.PI * 2;
        petal.scale.set(1.3, 0.35, 0.8);
        petal.position.set(x + Math.cos(angle) * 0.055, 0.435, z + Math.sin(angle) * 0.055);
        petal.rotation.y = angle;
        petal.castShadow = true;
        group.add(petal);
      }

      group.add(stem, bloom);
    }

    const leafGeometry = new THREE.PlaneGeometry(0.14, 0.06);
    for (let i = 0; i < 7; i += 1) {
      const seed = i * 31;
      const leaf = new THREE.Mesh(leafGeometry, this.materials.leaf);
      leaf.position.set(seededRandom(seed + 1) * 0.62 - 0.31, 0.11, seededRandom(seed + 2) * 0.62 - 0.31);
      leaf.rotation.x = -Math.PI * 0.42;
      leaf.rotation.y = seededRandom(seed + 3) * Math.PI * 2;
      leaf.castShadow = true;
      group.add(leaf);
    }

    return group;
  }
}
