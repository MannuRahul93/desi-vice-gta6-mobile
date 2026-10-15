// Ambient Traffic & Civilian Pedestrians System
class TrafficSystem {
  constructor(scene, city) {
    this.scene = scene;
    this.city = city;
    this.civilians = [];
    this.trafficCars = [];
    this.maxCivilians = 12;
    this.maxTrafficCars = 6;
    
    this.initTraffic();
  }
  
  initTraffic() {
    // Spawn civilian pedestrians
    const skinTones = [0xd29b76, 0xc68642, 0x8d5524, 0xf1c27d];
    const shirtColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xffffff];
    
    for (let i = 0; i < this.maxCivilians; i++) {
      const civGroup = new THREE.Group();
      
      const sTone = skinTones[Math.floor(Math.random() * skinTones.length)];
      const sColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
      
      const matSkin = new THREE.MeshLambertMaterial({ color: sTone });
      const matShirt = new THREE.MeshLambertMaterial({ color: sColor });
      const matPants = new THREE.MeshLambertMaterial({ color: 0x334155 });
      
      // Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.65, 0.25), matShirt);
      torso.position.y = 1.05;
      civGroup.add(torso);
      
      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.24), matSkin);
      head.position.y = 1.55;
      civGroup.add(head);
      
      // Legs
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.18), matPants);
      legL.position.set(-0.13, 0.35, 0);
      civGroup.add(legL);
      
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.7, 0.18), matPants);
      legR.position.set(0.13, 0.35, 0);
      civGroup.add(legR);
      
      // Random sidewalk position
      const isEastWest = Math.random() > 0.5;
      let px, pz;
      if (isEastWest) {
        px = (Math.random() - 0.5) * 400;
        pz = [-110, -10, 10, 110][Math.floor(Math.random() * 4)] + (Math.random() - 0.5) * 4;
      } else {
        pz = (Math.random() - 0.5) * 400;
        px = [-110, -10, 10, 110][Math.floor(Math.random() * 4)] + (Math.random() - 0.5) * 4;
      }
      
      civGroup.position.set(px, 0, pz);
      this.scene.add(civGroup);
      
      this.civilians.push({
        mesh: civGroup,
        direction: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 0.8,
        alive: true,
        animTime: Math.random() * 5,
        legL: legL,
        legR: legR
      });
    }
    
    // Spawn ambient civilian cars
    const carTypes = ['suv', 'supercar'];
    const roadTracks = [-200, -100, 0, 100, 200];
    
    for (let i = 0; i < this.maxTrafficCars; i++) {
      const type = carTypes[i % carTypes.length];
      const rX = roadTracks[Math.floor(Math.random() * roadTracks.length)];
      const rZ = (Math.random() - 0.5) * 350;
      
      const car = new Vehicle(this.scene, type, new THREE.Vector3(rX, 0, rZ));
      car.rotationY = Math.random() > 0.5 ? 0 : Math.PI;
      this.trafficCars.push(car);
    }
  }
  
  update(delta, playerPos, onPedHit) {
    // Update pedestrians
    this.civilians.forEach(civ => {
      if (!civ.alive) return;
      
      civ.animTime += delta * 7;
      civ.legL.rotation.x = Math.sin(civ.animTime) * 0.5;
      civ.legR.rotation.x = -Math.sin(civ.animTime) * 0.5;
      
      // Move in current heading
      const forward = new THREE.Vector3(Math.sin(civ.direction), 0, Math.cos(civ.direction));
      civ.mesh.position.addScaledVector(forward, civ.speed * delta);
      civ.mesh.rotation.y = civ.direction;
      
      // Turn around if bounds hit
      if (Math.abs(civ.mesh.position.x) > 260 || Math.abs(civ.mesh.position.z) > 260) {
        civ.direction += Math.PI;
      }
      
      // Check collision with player
      const dist = civ.mesh.position.distanceTo(playerPos);
      if (dist < 1.2 && onPedHit) {
        onPedHit(civ);
      }
    });
    
    // Update ambient cars
    this.trafficCars.forEach(car => {
      // Auto drive straight along avenues
      if (!car.driver) {
        car.speed = 14;
        const forward = new THREE.Vector3(Math.sin(car.rotationY), 0, Math.cos(car.rotationY));
        car.position.addScaledVector(forward, car.speed * delta);
        car.mesh.position.copy(car.position);
        
        // Wrap around city boundary
        if (car.position.z > 280) car.position.z = -280;
        if (car.position.z < -280) car.position.z = 280;
      }
    });
  }
  
  knockoutCiv(civ) {
    if (!civ.alive) return;
    civ.alive = false;
    civ.mesh.rotation.x = Math.PI / 2; // Fall down
    civ.mesh.position.y = 0.2;
    AudioSys.playPunch();
  }
}
