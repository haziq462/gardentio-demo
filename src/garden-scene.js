import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TILE_GAP, TILE_HEIGHT, TILE_SIZE } from "./constants.js";
import { createMaterials } from "./materials.js";
import { TileObjectFactory } from "./tile-objects.js";
import { tileKey } from "./utils.js";

export class GardenScene {
  constructor(canvas, gardenState) {
    this.canvas = canvas;
    this.state = gardenState;
    this.tileMeshes = new Map();
    this.objectMeshes = new Map();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hoveredTile = null;
    this.selectedTile = null;
    this.pressedCameraKeys = new Set();
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdce5d3);
    this.scene.fog = new THREE.Fog(0xdce5d3, 24, 58);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = true;
    this.controls.panSpeed = 0.9;
    this.controls.screenSpacePanning = true;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 120;

    this.tileGroup = new THREE.Group();
    this.objectGroup = new THREE.Group();
    this.scene.add(this.tileGroup, this.objectGroup);

    this.materials = createMaterials();
    this.tileObjectFactory = new TileObjectFactory(this.materials);
    this.hoverMesh = this.createHighlight(0xffffff, 0.34);
    this.selectionMesh = this.createHighlight(0x2f7d4b, 0.42);
    this.scene.add(this.hoverMesh, this.selectionMesh);

    this.setupLights();
    this.setupEnvironment();
    this.generateGrid();
    this.bindKeyboardControls();
    this.bindResize();
    this.frameGarden();
    this.animate();
  }

  setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8c755d, 2.1));

    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(5, 8, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 25;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    this.scene.add(sun);
  }

  setupEnvironment() {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0xc9d6bd, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.045;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createHighlight(color, opacity) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(TILE_SIZE, 0.018, TILE_SIZE),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false
      })
    );
    mesh.visible = false;
    mesh.renderOrder = 2;
    return mesh;
  }

  generateGrid() {
    this.tileGroup.clear();
    this.objectGroup.clear();
    this.tileMeshes.clear();
    this.objectMeshes.clear();

    for (let z = 0; z < this.state.length; z += 1) {
      for (let x = 0; x < this.state.width; x += 1) {
        this.createTile(x, z);
      }
    }

    this.updateHighlights();
  }

  createTile(x, z) {
    const type = this.state.getTile(x, z);
    const baseType = type === "grass" || type === "stone" ? type : "soil";
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(TILE_SIZE - TILE_GAP, TILE_HEIGHT, TILE_SIZE - TILE_GAP),
      this.materials[baseType]
    );
    tile.position.copy(this.tilePosition(x, z));
    tile.userData.tile = { x, z };
    tile.receiveShadow = true;
    tile.castShadow = false;

    this.tileGroup.add(tile);
    this.tileMeshes.set(tileKey(x, z), tile);
    this.createTileObject(x, z, type);
  }

  createTileObject(x, z, type) {
    const key = tileKey(x, z);
    const existing = this.objectMeshes.get(key);
    if (existing) {
      this.objectGroup.remove(existing);
      this.objectMeshes.delete(key);
    }

    const object = this.tileObjectFactory.create(type, x, z);
    if (!object) return;

    const position = this.tilePosition(x, z);
    object.position.set(position.x, TILE_HEIGHT * 0.5, position.z);
    object.userData.tile = { x, z };
    this.objectGroup.add(object);
    this.objectMeshes.set(key, object);
  }

  tilePosition(x, z) {
    return new THREE.Vector3(
      x - (this.state.width - 1) / 2,
      TILE_HEIGHT / 2,
      z - (this.state.length - 1) / 2
    );
  }

  updateTile(x, z) {
    const key = tileKey(x, z);
    const type = this.state.getTile(x, z);
    const tile = this.tileMeshes.get(key);
    if (!tile) return;

    const baseType = type === "grass" || type === "stone" ? type : "soil";
    tile.material = this.materials[baseType];
    this.createTileObject(x, z, type);
  }

  setHoveredTile(tile) {
    this.hoveredTile = tile;
    this.updateHighlights();
  }

  setSelectedTile(tile) {
    this.selectedTile = tile;
    this.updateHighlights();
  }

  updateHighlights() {
    this.placeHighlight(this.hoverMesh, this.hoveredTile);
    this.placeHighlight(this.selectionMesh, this.selectedTile);
  }

  placeHighlight(mesh, tile) {
    if (!tile || !this.state.isInBounds(tile.x, tile.z)) {
      mesh.visible = false;
      return;
    }

    const position = this.tilePosition(tile.x, tile.z);
    mesh.position.set(position.x, TILE_HEIGHT + 0.012, position.z);
    mesh.visible = true;
  }

  getTileFromPointer(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.tileMeshes.values()], false);
    return hits[0]?.object.userData.tile ?? null;
  }

  resize() {
    const { clientWidth, clientHeight } = this.canvas;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
  }

  bindResize() {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.resize();
  }

  bindKeyboardControls() {
    window.addEventListener("keydown", (event) => {
      if (!this.isCameraKey(event.code) || this.isTypingTarget(event.target)) return;
      this.pressedCameraKeys.add(event.code);
      event.preventDefault();
    });

    window.addEventListener("keyup", (event) => {
      if (!this.isCameraKey(event.code)) return;
      this.pressedCameraKeys.delete(event.code);
      event.preventDefault();
    });

    window.addEventListener("blur", () => {
      this.pressedCameraKeys.clear();
    });
  }

  isCameraKey(code) {
    return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD"].includes(code);
  }

  isTypingTarget(target) {
    return target?.closest?.("input, textarea, select, button, [contenteditable='true']");
  }

  frameGarden() {
    const largestSide = Math.max(this.state.width, this.state.length);
    this.controls.target.copy(new THREE.Vector3(0, 0, 0));
    this.camera.position.set(largestSide * 0.85 + 2.6, largestSide * 0.82 + 3, largestSide * 1.04 + 3);
    this.controls.update();
  }

  moveCameraWithKeyboard(deltaSeconds) {
    if (!this.pressedCameraKeys.size) return;

    const moveX =
      (this.pressedCameraKeys.has("ArrowRight") || this.pressedCameraKeys.has("KeyD") ? 1 : 0) -
      (this.pressedCameraKeys.has("ArrowLeft") || this.pressedCameraKeys.has("KeyA") ? 1 : 0);
    const moveZ =
      (this.pressedCameraKeys.has("ArrowUp") || this.pressedCameraKeys.has("KeyW") ? 1 : 0) -
      (this.pressedCameraKeys.has("ArrowDown") || this.pressedCameraKeys.has("KeyS") ? 1 : 0);

    if (moveX === 0 && moveZ === 0) return;

    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, this.camera.up).normalize();
    const distance = this.camera.position.distanceTo(this.controls.target);
    const speed = Math.max(3.6, distance * 0.75);
    const movement = right.multiplyScalar(moveX).add(forward.multiplyScalar(moveZ)).normalize();
    movement.multiplyScalar(speed * deltaSeconds);

    this.camera.position.add(movement);
    this.controls.target.add(movement);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.moveCameraWithKeyboard(Math.min(this.clock.getDelta(), 0.05));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
