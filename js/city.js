// High-Fidelity Open World City with Neon Billboards, Swaying Palms & Street Furniture
class CityBuilder {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.ramps = [];
    this.safehouseLocation = new THREE.Vector3(180, 0, -160);
    this.palmCanopies = []; // For wind animation
    
    this.buildWorld();
  }
  
  buildWorld() {
    this.buildGroundAndRoads();
    this.buildSkyscrapers();
    this.buildPalmTrees();
    this.buildStuntRamps();
    this.buildSafehouseDocks();
    this.buildStreetLights();
    this.buildNeonBillboards();
  }
  
  buildGroundAndRoads() {
    // Coastal ocean / grass terrain
    const groundGeo = new THREE.PlaneGeometry(750, 750);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x162a22 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Asphalt Roads Network
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x1e2025 });
    const lineYellow = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const zebraWhite = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
    const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    
    const roadWidth = 20;
    const roadLengths = 580;
    
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
      // Asphalt Surface
      const rMesh = new THREE.Mesh(new THREE.PlaneGeometry(roadWidth, roadLengths), roadMat);
      rMesh.rotation.x = -Math.PI / 2;
      rMesh.rotation.z = road.rotY;
      rMesh.position.set(road.x, 0.02, road.z);
      rMesh.receiveShadow = true;
      this.scene.add(rMesh);
      
      // Sidewalk Curbs
      [-roadWidth / 2 - 1.5, roadWidth / 2 + 1.5].forEach(sideOffset => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.25, roadLengths), sidewalkMat);
        if (road.rotY === 0) {
          curb.position.set(road.x + sideOffset, 0.12, road.z);
        } else {
          curb.rotation.y = Math.PI / 2;
          curb.position.set(road.x, 0.12, road.z + sideOffset);
        }
        curb.receiveShadow = true;
        this.scene.add(curb);
      });
      
      // Dashed Highway Lane Dividers
      for (let offset = -roadLengths / 2 + 15; offset < roadLengths / 2 - 15; offset += 15) {
        const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 7), lineYellow);
        stripe.rotation.x = -Math.PI / 2;
        stripe.rotation.z = road.rotY;
        
        if (road.rotY === 0) {
          stripe.position.set(road.x, 0.035, road.z + offset);
        } else {
          stripe.position.set(road.x + offset, 0.035, road.z);
        }
        this.scene.add(stripe);
      }
      
      // Zebra Pedestrian Crossings at Intersections
      [-200, -100, 0, 100, 200].forEach(crossPos => {
        if (road.rotY === 0) {
          for (let zOffset of [-12, 12]) {
            for (let b = -roadWidth / 2 + 2; b < roadWidth / 2; b += 2.2) {
              const zebra = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.5), zebraWhite);
              zebra.rotation.x = -Math.PI / 2;
              zebra.position.set(road.x + b, 0.038, crossPos + zOffset);
              this.scene.add(zebra);
            }
          }
        }
      });
    });
  }
  
  buildSkyscrapers() {
    const buildingThemes = [
      { body: 0x1e293b, neon: 0x06b6d4, win: 0x67e8f9 }, // Cyber Cyan
      { body: 0x0f172a, neon: 0xf43f5e, win: 0xfda4af }, // Neon Magenta
      { body: 0x1f2430, neon: 0xf59e0b, win: 0xfde68a }, // Gold Corporate
      { body: 0x141e28, neon: 0x10b981, win: 0xa7f3d0 }  // Emerald Heights
    ];
    
    const blockOffsets = [-150, -50, 50, 150];
    
    blockOffsets.forEach(bx => {
      blockOffsets.forEach(bz => {
        // Keep central plaza & safehouse docks open
        if (Math.abs(bx) < 60 && Math.abs(bz) < 60) return;
        if (bx > 120 && bz < -100) return;
        
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const w = 20 + Math.random() * 18;
          const d = 20 + Math.random() * 18;
          const h = 30 + Math.random() * 75;
          
          const px = bx + (Math.random() - 0.5) * 44;
          const pz = bz + (Math.random() - 0.5) * 44;
          
          const theme = buildingThemes[Math.floor(Math.random() * buildingThemes.length)];
          const bMat = new THREE.MeshLambertMaterial({ color: theme.body });
          const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bMat);
          building.position.set(px, h / 2, pz);
          building.castShadow = true;
          building.receiveShadow = true;
          this.scene.add(building);
          
          // Glowing Window Grids on Façades
          const winMat = new THREE.MeshBasicMaterial({ color: theme.win });
          const winCols = 4;
          const winRows = Math.floor(h / 8);
          
          for (let r = 0; r < winRows; r++) {
            const y = (r + 1) * 7.5;
            for (let c = 0; c < winCols; c++) {
              if (Math.random() > 0.3) { // Lit windows
                const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), winMat);
                win.position.set(px - w / 2 + (c + 1) * (w / (winCols + 1)), y, pz + d / 2 + 0.05);
                this.scene.add(win);
              }
            }
          }
          
          // Rooftop Neon Strip
          const rimMat = new THREE.MeshBasicMaterial({ color: theme.neon });
          const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 1.4, d + 0.6), rimMat);
          rim.position.set(px, h - 0.7, pz);
          this.scene.add(rim);
          
          // Rooftop Water Tank or Antenna
          if (Math.random() > 0.5) {
            const antMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
            const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 14, 6), antMat);
            antenna.position.set(px, h + 7, pz);
            this.scene.add(antenna);
            
            // Blinking red aviation warning beacon on antenna tip
            const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
            beacon.position.set(px, h + 14, pz);
            this.scene.add(beacon);
          } else {
            const tankMat = new THREE.MeshLambertMaterial({ color: 0x78716c });
            const waterTank = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 4.5, 12), tankMat);
            waterTank.position.set(px, h + 2.25, pz);
            this.scene.add(waterTank);
          }
          
          // Add collider
          this.colliders.push({
            minX: px - w / 2 - 1.5,
            maxX: px + w / 2 + 1.5,
            minZ: pz - d / 2 - 1.5,
            maxZ: pz + d / 2 + 1.5
          });
        }
      });
    });
  }
  
  buildPalmTrees() {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x16a34a });
    
    [-115, -15, 15, 115].forEach(x => {
      for (let z = -250; z <= 250; z += 32) {
        const treeGroup = new THREE.Group();
        treeGroup.position.set(x, 0, z);
        
        // Realistic curved trunk
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 8.5, 8), trunkMat);
        trunk.position.y = 4.25;
        trunk.rotation.z = (Math.sin(z) * 0.12);
        treeGroup.add(trunk);
        
        // Canopy pivot for animated wind swaying
        const canopy = new THREE.Group();
        canopy.position.set(0, 8.5, 0);
        treeGroup.add(canopy);
        this.palmCanopies.push(canopy);
        
        // 8 Multi-layered arching palm fronds
        for (let a = 0; a < 8; a++) {
          const frond = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 4.8), leafMat);
          frond.position.set(0, 0, 2.1);
          frond.rotation.x = -0.45;
          
          const pivot = new THREE.Group();
          pivot.rotation.y = (a * Math.PI) / 4;
          pivot.add(frond);
          canopy.add(pivot);
        }
        
        this.scene.add(treeGroup);
      }
    });
  }
  
  buildNeonBillboards() {
    const boardMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    
    const billboardLocs = [
      { x: 25, z: 25, rotY: 0, text: 'DESI VICE 6' },
      { x: -25, z: -25, rotY: Math.PI, text: 'CLUB NIRVANA' },
      { x: 125, z: 25, rotY: Math.PI / 2, text: 'TURBO GT' }
    ];
    
    billboardLocs.forEach(loc => {
      const group = new THREE.Group();
      group.position.set(loc.x, 0, loc.z);
      group.rotation.y = loc.rotY;
      
      // Steel support legs
      [-4.5, 4.5].forEach(x => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10, 6), frameMat);
        leg.position.set(x, 5, 0);
        group.add(leg);
      });
      
      // Giant Glowing Neon Board
      const board = new THREE.Mesh(new THREE.BoxGeometry(11, 4.5, 0.6), boardMat);
      board.position.set(0, 10, 0);
      group.add(board);
      
      this.scene.add(group);
    });
  }
  
  buildStuntRamps() {
    const rampMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e });
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    
    const rampLocations = [
      { x: 0, z: 50, rotY: 0 },
      { x: 100, z: -40, rotY: Math.PI },
      { x: -100, z: 80, rotY: 0 },
      { x: 50, z: 100, rotY: Math.PI / 2 }
    ];
    
    rampLocations.forEach(loc => {
      const rampGroup = new THREE.Group();
      rampGroup.position.set(loc.x, 0, loc.z);
      rampGroup.rotation.y = loc.rotY;
      
      const rampW = 7.0;
      const rampL = 14.0;
      const rampH = 4.2;
      
      const rampGeo = new THREE.BoxGeometry(rampW, 0.6, rampL);
      const rampMesh = new THREE.Mesh(rampGeo, rampMat);
      rampMesh.position.set(0, rampH / 2, 0);
      rampMesh.rotation.x = -0.3; // Stunt launch angle
      rampGroup.add(rampMesh);
      
      // Stunt Neon Chevron
      const chevron = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 5.0), stripMat);
      chevron.rotation.x = -Math.PI / 2 - 0.3;
      chevron.position.set(0, rampH / 2 + 0.35, 0);
      rampGroup.add(chevron);
      
      this.scene.add(rampGroup);
      this.ramps.push({ pos: loc, width: rampW, length: rampL, height: rampH });
    });
  }
  
  buildSafehouseDocks() {
    const dockGroup = new THREE.Group();
    dockGroup.position.copy(this.safehouseLocation);
    
    // Waterfront Luxury Compound
    const villaMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc });
    const villa = new THREE.Mesh(new THREE.BoxGeometry(28, 14, 34), villaMat);
    villa.position.set(0, 7, 0);
    dockGroup.add(villa);
    
    // Glass balcony
    const balconyMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(28.2, 1.2, 6), balconyMat);
    balcony.position.set(0, 7.5, 17.1);
    dockGroup.add(balcony);
    
    // Glowing Safehouse Zone Ring
    const markerGeo = new THREE.RingGeometry(3.5, 6.0, 32);
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(0, 0.15, 26);
    dockGroup.add(marker);
    
    // Skyward Destination Light Pillar
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 80, 16),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45 })
    );
    beam.position.set(0, 40, 26);
    dockGroup.add(beam);
    
    this.scene.add(dockGroup);
    
    this.colliders.push({
      minX: this.safehouseLocation.x - 15,
      maxX: this.safehouseLocation.x + 15,
      minZ: this.safehouseLocation.z - 18,
      maxZ: this.safehouseLocation.z + 18
    });
  }
  
  buildStreetLights() {
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    
    for (let x = -100; x <= 100; x += 100) {
      for (let z = -200; z <= 200; z += 45) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7, 8), poleMat);
        pole.position.set(x + 11.5, 3.5, z);
        this.scene.add(pole);
        
        const arm = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.12), poleMat);
        arm.position.set(x + 10.5, 7, z);
        this.scene.add(arm);
        
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), bulbMat);
        bulb.position.set(x + 9.5, 6.8, z);
        this.scene.add(bulb);
      }
    }
  }
  
  update(delta) {
    // Gentle palm tree wind animation
    const time = Date.now() * 0.002;
    this.palmCanopies.forEach((canopy, i) => {
      canopy.rotation.z = Math.sin(time + i) * 0.08;
    });
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
