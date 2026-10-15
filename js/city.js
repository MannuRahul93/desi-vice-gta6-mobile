// Open World City Builder with Low-Drawcall Mobile Optimization
class CityBuilder {
  constructor(scene) {
    this.scene = scene;
    this.colliders = []; // Bounding boxes for vehicle/character collision
    this.ramps = [];
    this.safehouseLocation = new THREE.Vector3(180, 0, -160);
    this.spawnLocations = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(60, 0, 50),
      new THREE.Vector3(-80, 0, 70),
      new THREE.Vector3(120, 0, -90)
    ];
    
    this.buildWorld();
  }
  
  buildWorld() {
    this.buildGroundAndRoads();
    this.buildSkyscrapers();
    this.buildPalmTrees();
    this.buildStuntRamps();
    this.buildSafehouseDocks();
    this.buildStreetLights();
  }
  
  buildGroundAndRoads() {
    // Large ground plane (Grass / Beach sand outskirts)
    const groundGeo = new THREE.PlaneGeometry(700, 700);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x1a2e26 }); // Dark coastal lawn
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Roads Network (Asphalt Grid)
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x22252a });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b }); // Yellow highway divider
    const zebraMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White crosswalk
    
    // Main Avenues (East-West & North-South)
    const roadWidth = 18;
    const roadLengths = 560;
    
    const avenuePositions = [
      { x: 0, z: 0, rotY: 0 },
      { x: 100, z: 0, rotY: 0 },
      { x: -100, z: 0, rotY: 0 },
      { x: 200, z: 0, rotY: 0 },
      { x: -200, z: 0, rotY: 0 },
      { x: 0, z: 0, rotY: Math.PI / 2 },
      { x: 0, z: 100, rotY: Math.PI / 2 },
      { x: 0, z: -100, rotY: Math.PI / 2 },
      { x: 0, z: 200, rotY: Math.PI / 2 },
      { x: 0, z: -200, rotY: Math.PI / 2 }
    ];
    
    avenuePositions.forEach(road => {
      const rMesh = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, roadLengths), roadMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.rotation.z = road.rotY;
      rMesh.position.set(road.x, 0.02, road.z);
      rMesh.receiveShadow = true;
      this.scene.add(rMesh);
      
      // Dashed lane stripes along road
      for (let offset = -roadLengths / 2 + 10; offset < roadLengths / 2 - 10; offset += 14) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 6), lineMat);
        stripe.rotation.x = -Math.PI / 2;
        stripe.rotation.z = road.rotY;
        
        if (road.rotY === 0) {
          stripe.position.set(road.x, 0.03, road.z + offset);
        } else {
          stripe.position.set(road.x + offset, 0.03, road.z);
        }
        this.scene.add(stripe);
      }
    });
  }
  
  buildSkyscrapers() {
    // City block building clusters with neon accents
    const buildingPalette = [
      { body: 0x1f2937, trim: 0x06b6d4 }, // Cyan cyber tower
      { body: 0x111827, trim: 0xf43f5e }, // Neon pink high-rise
      { body: 0x374151, trim: 0x10b981 }, // Emerald glass complex
      { body: 0x1e1b4b, trim: 0x8b5cf6 }, // Indigo luxury suite
      { body: 0x27272a, trim: 0xfbbf24 }  // Gold modern corporate
    ];
    
    const blockOffsets = [-150, -50, 50, 150];
    
    blockOffsets.forEach(bx => {
      blockOffsets.forEach(bz => {
        // Skip central plaza and safehouse corner for gameplay space
        if (Math.abs(bx) < 60 && Math.abs(bz) < 60) return;
        if (bx > 120 && bz < -100) return; // Tommy's safehouse zone
        
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const w = 18 + Math.random() * 16;
          const d = 18 + Math.random() * 16;
          const h = 25 + Math.random() * 65;
          
          const px = bx + (Math.random() - 0.5) * 45;
          const pz = bz + (Math.random() - 0.5) * 45;
          
          const theme = buildingPalette[Math.floor(Math.random() * buildingPalette.length)];
          const bMat = new THREE.MeshLambertMaterial({ color: theme.body });
          const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
          building.position.set(px, h / 2, pz);
          building.castShadow = true;
          building.receiveShadow = true;
          this.scene.add(building);
          
          // Neon rooftop glow strip
          const rimMat = new THREE.MeshBasicMaterial({ color: theme.trim });
          const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 1.2, d + 0.4), rimMat);
          rim.position.set(px, h - 0.5, pz);
          this.scene.add(rim);
          
          // Add to collision checks
          this.colliders.push({
            minX: px - w / 2 - 1.2,
            maxX: px + w / 2 + 1.2,
            minZ: pz - d / 2 - 1.2,
            maxZ: pz + d / 2 + 1.2
          });
        }
      });
    });
  }
  
  buildPalmTrees() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    
    // Plant palm trees along sidewalk boulevards
    [-115, -15, 15, 115].forEach(x => {
      for (let z = -240; z <= 240; z += 35) {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(x, 0, z);
        
        // Slightly curved trunk
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 7, 6);
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 3.5;
        trunk.rotation.z = (Math.random() - 0.5) * 0.15;
        treeGroup.add(trunk);
        
        // Palm fronds canopy
        for (let a = 0; a < 6; a++) {
          const frondGeo = new THREE.BoxGeometry(0.6, 0.1, 4.2);
          const frond = new THREE.Mesh(frondGeo, leafMat);
          frond.position.set(0, 6.8, 1.8);
          frond.rotation.x = -0.35;
          
          const frondPivot = new THREE.Group();
          frondPivot.rotation.y = (a * Math.PI) / 3;
          frondPivot.add(frond);
          treeGroup.add(frondPivot);
        }
        
        this.scene.add(treeGroup);
      }
    });
  }
  
  buildStuntRamps() {
    const rampMat = new THREE.MeshLambertMaterial({ color: 0xe11d48 }); // High-visibility red
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const rampLocations = [
      { x: 0, z: 45, rotY: 0 },
      { x: 100, z: -40, rotY: Math.PI },
      { x: -100, z: 80, rotY: 0 },
      { x: 40, z: 100, rotY: Math.PI / 2 }
    ];
    
    rampLocations.forEach(loc => {
      const rampGroup = new THREE.Group();
      rampGroup.position.set(loc.x, 0, loc.z);
      rampGroup.rotation.y = loc.rotY;
      
      // Wedge geometry
      const rampW = 6.5;
      const rampL = 12.0;
      const rampH = 3.5;
      
      const rampGeo = new THREE.BoxGeometry(rampW, 0.6, rampL);
      const rampMesh = new THREE.Mesh(rampGeo, rampMat);
      rampMesh.position.set(0, rampH / 2, 0);
      rampMesh.rotation.x = -0.28; // Incline angle
      rampGroup.add(rampMesh);
      
      // Stunt arrows
      const arrowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3), stripMat);
      arrowMesh.rotation.x = -Math.PI / 2 - 0.28;
      arrowMesh.position.set(0, rampH / 2 + 0.35, 0);
      rampGroup.add(arrowMesh);
      
      this.scene.add(rampGroup);
      this.ramps.push({ pos: loc, width: rampW, length: rampL, height: rampH });
    });
  }
  
  buildSafehouseDocks() {
    // Tommy's Safehouse Mansion & Waterfront Docks
    const dockGroup = new THREE.Group();
    dockGroup.position.copy(this.safehouseLocation);
    
    // Main villa compound
    const villaMat = new THREE.MeshLambertMaterial({ color: 0xfdf4ff });
    const villa = new THREE.Mesh(new THREE.BoxGeometry(26, 12, 32), villaMat);
    villa.position.set(0, 6, 0);
    dockGroup.add(villa);
    
    // Golden gate
    const gateMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
    const gate = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 1), gateMat);
    gate.position.set(0, 2, 17);
    dockGroup.add(gate);
    
    // Safehouse delivery halo marker
    const markerGeo = new THREE.CylinderGeometry(4.5, 4.5, 0.2, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.65
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(0, 0.1, 24);
    dockGroup.add(marker);
    
    // Animated glowing beacon beam
    const beamGeo = new THREE.CylinderGeometry(0.6, 0.6, 60, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.35
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(0, 30, 24);
    dockGroup.add(beam);
    
    this.scene.add(dockGroup);
    
    // Collider for safehouse villa
    this.colliders.push({
      minX: this.safehouseLocation.x - 14,
      maxX: this.safehouseLocation.x + 14,
      minZ: this.safehouseLocation.z - 17,
      maxZ: this.safehouseLocation.z + 17
    });
  }
  
  buildStreetLights() {
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x475569 });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    
    for (let x = -100; x <= 100; x += 100) {
      for (let z = -200; z <= 200; z += 50) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 6, 6), poleMat);
        pole.position.set(x + 10, 3, z);
        this.scene.add(pole);
        
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), bulbMat);
        bulb.position.set(x + 10, 6, z);
        this.scene.add(bulb);
      }
    }
  }
  
  checkCollision(pos, radius = 1.0) {
    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      if (
        pos.x + radius > box.minX &&
        pos.x - radius < box.maxX &&
        pos.z + radius > box.minZ &&
        pos.z - radius < box.maxZ
      ) {
        return true;
      }
    }
    return false;
  }
}
