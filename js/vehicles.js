// Vehicle Systems with Arcade Physics, Drifting, Headlights & Nitro
class Vehicle {
  constructor(scene, type = 'supercar', position = new THREE.Vector3()) {
    this.scene = scene;
    this.type = type; // 'supercar', 'suv', 'police'
    this.position = position.clone();
    this.position.y = 0.45;
    this.rotationY = 0;
    
    // Physics
    this.speed = 0;
    this.maxSpeed = type === 'supercar' ? 42 : (type === 'police' ? 38 : 32); // m/s (~150 km/h)
    this.acceleration = type === 'supercar' ? 24 : 18;
    this.braking = 32;
    this.reverseSpeed = 12;
    this.steering = 0;
    this.steerAngle = 0;
    this.driftAngle = 0;
    this.isBraking = false;
    this.isDrifting = false;
    this.nitro = 100; // 0 - 100
    this.isNitroActive = false;
    
    // Driver
    this.driver = null; // Reference to player or AI
    
    // 3D Meshes
    this.mesh = new THREE.Group();
    this.wheels = [];
    this.frontWheels = [];
    this.headlights = [];
    this.brakeLights = [];
    this.sirenLights = [];
    
    this.buildVehicleMesh();
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }
  
  buildVehicleMesh() {
    const isSupercar = this.type === 'supercar';
    const isPolice = this.type === 'police';
    const isSUV = this.type === 'suv';
    
    // Primary Body Colors
    let bodyColor = 0xff0055; // GTA Vice Neon Magenta
    if (isPolice) bodyColor = 0x111827; // Police Black & White
    if (isSUV) bodyColor = 0x1e293b; // Sleek Dark Slate
    
    const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x1e1e24 });
    const chromeMat = new THREE.MeshLambertMaterial({ color: 0xd1d5db });
    const wheelMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    
    // Main Chassis
    const length = isSupercar ? 4.2 : 4.4;
    const width = 2.0;
    const height = isSupercar ? 0.8 : (isSUV ? 1.3 : 0.95);
    
    const chassisGeo = new THREE.BoxGeometry(width, height, length);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = height / 2 + 0.2;
    chassis.castShadow = true;
    this.mesh.add(chassis);
    
    // Police White Doors/Decal
    if (isPolice) {
      const doorWhiteGeo = new THREE.BoxGeometry(width + 0.02, height * 0.9, length * 0.45);
      const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const doorWhite = new THREE.Mesh(doorWhiteGeo, whiteMat);
      doorWhite.position.y = height / 2 + 0.2;
      this.mesh.add(doorWhite);
      
      // Police Roof Lightbar
      const barGeo = new THREE.BoxGeometry(1.2, 0.15, 0.25);
      const barMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, height + 0.55, -0.2);
      this.mesh.add(bar);
      
      // Red & Blue Siren Bulbs
      const sirenGeo = new THREE.BoxGeometry(0.45, 0.18, 0.22);
      const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const blueMat = new THREE.MeshBasicMaterial({ color: 0x0044ff });
      
      const redSiren = new THREE.Mesh(sirenGeo, redMat);
      redSiren.position.set(-0.35, height + 0.55, -0.2);
      this.mesh.add(redSiren);
      this.sirenLights.push(redSiren);
      
      const blueSiren = new THREE.Mesh(sirenGeo, blueMat);
      blueSiren.position.set(0.35, height + 0.55, -0.2);
      this.mesh.add(blueSiren);
      this.sirenLights.push(blueSiren);
    }
    
    // Cabin / Roof & Windows
    const cabinLen = isSupercar ? 1.9 : 2.4;
    const cabinH = isSupercar ? 0.55 : 0.75;
    const cabinW = width * 0.85;
    const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinLen);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, height + cabinH / 2 + 0.18, -0.2);
    this.mesh.add(cabin);
    
    // Supercar Rear Spoiler
    if (isSupercar) {
      const wingGeo = new THREE.BoxGeometry(width * 0.95, 0.08, 0.45);
      const wing = new THREE.Mesh(wingGeo, bodyMat);
      wing.position.set(0, height + 0.4, -length / 2 + 0.3);
      this.mesh.add(wing);
      
      // Spoiler struts
      [-0.6, 0.6].forEach(x => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.1), bodyMat);
        strut.position.set(x, height + 0.2, -length / 2 + 0.3);
        this.mesh.add(strut);
      });
      
      // Neon Underglow (Vice Cyan)
      const glowGeo = new THREE.PlaneGeometry(width * 0.9, length * 0.8);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const underglow = new THREE.Mesh(glowGeo, glowMat);
      underglow.rotation.x = Math.PI / 2;
      underglow.position.y = 0.05;
      this.mesh.add(underglow);
    }
    
    // Headlights (Front is +Z)
    const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.7, 0.7].forEach(x => {
      const hLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.1), headMat);
      hLight.position.set(x, height / 2 + 0.2, length / 2 + 0.02);
      this.mesh.add(hLight);
      this.headlights.push(hLight);
    });
    
    // Tail / Brake Lights (Back is -Z)
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1100 });
    [-0.7, 0.7].forEach(x => {
      const bLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.1), tailMat);
      bLight.position.set(x, height / 2 + 0.2, -length / 2 - 0.02);
      this.mesh.add(bLight);
      this.brakeLights.push(bLight);
    });
    
    // Wheels (4 Wheels with Hubs)
    const wheelR = isSUV ? 0.48 : 0.4;
    const wheelW = 0.28;
    const wheelGeo = new THREE.CylinderGeometry(wheelR, wheelR, wheelW, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    
    const wheelPositions = [
      { x: -width / 2 - 0.05, z: length / 2 - 0.9, isFront: true },  // Front Left
      { x: width / 2 + 0.05, z: length / 2 - 0.9, isFront: true },   // Front Right
      { x: -width / 2 - 0.05, z: -length / 2 + 0.9, isFront: false },// Rear Left
      { x: width / 2 + 0.05, z: -length / 2 + 0.9, isFront: false }  // Rear Right
    ];
    
    wheelPositions.forEach(pos => {
      const wheelPivot = new THREE.Group();
      wheelPivot.position.set(pos.x, wheelR, pos.z);
      
      const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
      wheelMesh.castShadow = true;
      wheelPivot.add(wheelMesh);
      
      // Rim cap
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(wheelR * 0.6, wheelR * 0.6, wheelW + 0.02, 8), rimMat);
      rim.rotateZ(Math.PI / 2);
      wheelPivot.add(rim);
      
      this.mesh.add(wheelPivot);
      this.wheels.push(wheelMesh);
      if (pos.isFront) {
        this.frontWheels.push(wheelPivot);
      }
    });
  }
  
  update(delta, inputY, inputX, isHandbrake, isNitro) {
    // If player or AI is driving
    if (this.driver) {
      // Acceleration & Braking
      if (inputY > 0.05) {
        // Accelerate Forward
        let accel = this.acceleration;
        if (isNitro && this.nitro > 0) {
          accel *= 1.8;
          this.nitro = Math.max(0, this.nitro - delta * 35);
          if (!this.isNitroActive) {
            AudioSys.playNitro();
            this.isNitroActive = true;
          }
        } else {
          this.isNitroActive = false;
        }
        this.speed += accel * inputY * delta;
      } else if (inputY < -0.05) {
        // Reverse or Brake
        if (this.speed > 1) {
          this.speed -= this.braking * Math.abs(inputY) * delta;
          this.isBraking = true;
        } else {
          this.speed -= this.acceleration * 0.6 * Math.abs(inputY) * delta;
          this.isBraking = false;
        }
      } else {
        // Rolling resistance / engine drag
        this.speed *= (1.0 - 0.7 * delta);
        this.isBraking = false;
        this.isNitroActive = false;
      }
      
      // Recharge Nitro over time
      if (!isNitro) {
        this.nitro = Math.min(100, this.nitro + delta * 12);
      }
      
      // Handbrake / Drift
      if (isHandbrake) {
        this.speed *= (1.0 - 1.8 * delta);
        this.isBraking = true;
        if (Math.abs(this.speed) > 12 && Math.abs(inputX) > 0.2) {
          if (!this.isDrifting) {
            AudioSys.playTireScreech();
            this.isDrifting = true;
          }
          this.driftAngle += inputX * 2.5 * delta;
        }
      } else {
        this.isDrifting = false;
        this.driftAngle *= 0.88;
      }
      
      // Speed clamp
      const maxSpd = this.isNitroActive ? this.maxSpeed * 1.35 : this.maxSpeed;
      this.speed = Math.max(-this.reverseSpeed, Math.min(maxSpd, this.speed));
      
      // Steering & Wheel Angle
      const targetSteer = inputX * 0.55;
      this.steerAngle += (targetSteer - this.steerAngle) * 10 * delta;
      
      this.frontWheels.forEach(w => {
        w.rotation.y = -this.steerAngle;
      });
      
      // Turn car chassis proportionally to forward speed
      if (Math.abs(this.speed) > 0.5) {
        const turnDirection = this.speed > 0 ? 1 : -1;
        this.rotationY -= this.steerAngle * (this.speed / 12) * turnDirection * delta * 2.0;
      }
      
      // Move vehicle along forward heading
      const effectiveHeading = this.rotationY + this.driftAngle * 0.4;
      const forwardVec = new THREE.Vector3(Math.sin(effectiveHeading), 0, Math.cos(effectiveHeading));
      this.position.addScaledVector(forwardVec, this.speed * delta);
      
      // Update Audio Engine RPM
      AudioSys.updateEngineRPM(Math.abs(this.speed) / this.maxSpeed, inputY > 0.1);
    } else {
      // Natural deceleration when empty
      this.speed *= (1.0 - 1.2 * delta);
      if (Math.abs(this.speed) > 0.1) {
        const forwardVec = new THREE.Vector3(Math.sin(this.rotationY), 0, Math.cos(this.rotationY));
        this.position.addScaledVector(forwardVec, this.speed * delta);
      }
      this.isBraking = false;
    }
    
    // Spin wheels visually
    const wheelRotDelta = (this.speed * delta) / 0.4;
    this.wheels.forEach(w => {
      w.rotation.x += wheelRotDelta;
    });
    
    // Bounds check
    this.position.x = Math.max(-280, Math.min(280, this.position.x));
    this.position.z = Math.max(-280, Math.min(280, this.position.z));
    
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;
    
    // Brake light indicator
    this.brakeLights.forEach(b => {
      b.material.color.setHex(this.isBraking ? 0xff0000 : 0x550505);
    });
    
    // Siren flashing if police
    if (this.type === 'police' && this.sirenLights.length === 2) {
      const blink = Math.floor(Date.now() / 150) % 2 === 0;
      this.sirenLights[0].visible = blink;
      this.sirenLights[1].visible = !blink;
    }
  }
  
  getSpeedKmh() {
    return Math.round(Math.abs(this.speed) * 3.6);
  }
}
