// Realistic High-Fidelity Vehicles with Correct Steering, Drift Smoke & Nitro Flames
class Vehicle {
  constructor(scene, type = 'supercar', position = new THREE.Vector3()) {
    this.scene = scene;
    this.type = type; // 'supercar', 'suv', 'police'
    this.position = position.clone();
    this.position.y = 0.45;
    this.rotationY = 0;
    
    // Physics
    this.speed = 0;
    this.maxSpeed = type === 'supercar' ? 44 : (type === 'police' ? 40 : 34); // ~160 km/h
    this.acceleration = type === 'supercar' ? 26 : 20;
    this.braking = 35;
    this.reverseSpeed = 14;
    this.steerAngle = 0;
    this.driftAngle = 0;
    this.isBraking = false;
    this.isDrifting = false;
    this.nitro = 100;
    this.isNitroActive = false;
    
    // Driver reference
    this.driver = null;
    
    // 3D Meshes & Parts
    this.mesh = new THREE.Group();
    this.wheels = [];
    this.frontWheels = [];
    this.headlights = [];
    this.brakeLights = [];
    this.sirenLights = [];
    this.exhausts = [];
    this.smokeParticles = [];
    
    this.buildVehicleMesh();
    this.initParticleSystems();
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }
  
  buildVehicleMesh() {
    const isSupercar = this.type === 'supercar';
    const isPolice = this.type === 'police';
    const isSUV = this.type === 'suv';
    
    // Metallic modern shaders
    let bodyColor = 0xe11d48; // Vice Crimson Red
    if (isPolice) bodyColor = 0x111827; // Midnight Police
    if (isSUV) bodyColor = 0x1e293b; // Sleek Dark Charcoal
    
    const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
    const trimMat = new THREE.MeshLambertMaterial({ color: 0x0f172a }); // Matte carbon trim
    const glassMat = new THREE.MeshLambertMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45 // Transparent windshield to see driver!
    });
    const rimMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const tireMat = new THREE.MeshLambertMaterial({ color: 0x18181b });
    
    const length = isSupercar ? 4.5 : 4.6;
    const width = 2.1;
    const height = isSupercar ? 0.75 : (isSUV ? 1.35 : 0.95);
    
    // Main Chassis Base
    const chassisGeo = new THREE.BoxGeometry(width, height, length);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = height / 2 + 0.22;
    chassis.castShadow = true;
    this.mesh.add(chassis);
    
    // Aerodynamic Front Hood & Splitter
    const hoodGeo = new THREE.BoxGeometry(width * 0.95, 0.25, length * 0.35);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(0, height + 0.08, length * 0.3);
    hood.rotation.x = -0.06;
    this.mesh.add(hood);
    
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(width + 0.08, 0.08, 0.35), trimMat);
    splitter.position.set(0, 0.24, length / 2 + 0.12);
    this.mesh.add(splitter);
    
    // Cabin Greenhouse & Windshield
    const cabinLen = isSupercar ? 1.8 : 2.4;
    const cabinH = isSupercar ? 0.6 : 0.8;
    const cabinW = width * 0.86;
    const cabinGeo = new THREE.BoxGeometry(cabinW, cabinH, cabinLen);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, height + cabinH / 2 + 0.18, -0.2);
    this.mesh.add(cabin);
    
    // Roof Cap
    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(cabinW * 0.95, 0.08, cabinLen * 0.65), bodyMat);
    roofCap.position.set(0, height + cabinH + 0.18, -0.3);
    this.mesh.add(roofCap);
    
    // Steering wheel visible inside
    const wheelRingMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const steerWheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 16), wheelRingMat);
    steerWheel.position.set(-0.4, height + 0.42, 0.35);
    steerWheel.rotation.x = Math.PI / 3;
    this.mesh.add(steerWheel);
    
    // Supercar Aerodynamic Wing & Neon Underglow
    if (isSupercar) {
      const wingGeo = new THREE.BoxGeometry(width * 0.98, 0.08, 0.45);
      const wing = new THREE.Mesh(wingGeo, trimMat);
      wing.position.set(0, height + 0.45, -length / 2 + 0.35);
      this.mesh.add(wing);
      
      [-0.65, 0.65].forEach(x => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.1), trimMat);
        strut.position.set(x, height + 0.22, -length / 2 + 0.35);
        this.mesh.add(strut);
      });
      
      // Vice Cyan Underglow
      const underglowMat = new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });
      const underglow = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.9, length * 0.8), underglowMat);
      underglow.rotation.x = Math.PI / 2;
      underglow.position.y = 0.06;
      this.mesh.add(underglow);
    }
    
    // Police Cruiser Livery & Lightbar
    if (isPolice) {
      const doorWhite = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, height * 0.85, length * 0.4), new THREE.MeshLambertMaterial({ color: 0xffffff }));
      doorWhite.position.set(0, height / 2 + 0.22, -0.1);
      this.mesh.add(doorWhite);
      
      // Siren Lightbar
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.16, 0.25), trimMat);
      bar.position.set(0, height + cabinH + 0.28, -0.2);
      this.mesh.add(bar);
      
      const redSiren = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.22), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
      redSiren.position.set(-0.35, height + cabinH + 0.28, -0.2);
      this.mesh.add(redSiren);
      this.sirenLights.push(redSiren);
      
      const blueSiren = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.2, 0.22), new THREE.MeshBasicMaterial({ color: 0x0066ff }));
      blueSiren.position.set(0.35, height + cabinH + 0.28, -0.2);
      this.mesh.add(blueSiren);
      this.sirenLights.push(blueSiren);
    }
    
    // Headlights (Front is +Z)
    const headMat = new THREE.MeshBasicMaterial({ color: 0xfffbeb });
    [-0.75, 0.75].forEach(x => {
      const hLight = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.08), headMat);
      hLight.position.set(x, height / 2 + 0.22, length / 2 + 0.02);
      this.mesh.add(hLight);
      this.headlights.push(hLight);
    });
    
    // Tail / Brake Lights (Back is -Z)
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1100 });
    [-0.75, 0.75].forEach(x => {
      const bLight = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.08), tailMat);
      bLight.position.set(x, height / 2 + 0.22, -length / 2 - 0.02);
      this.mesh.add(bLight);
      this.brakeLights.push(bLight);
    });
    
    // Dual Exhaust Pipes with Nitro Flame Points
    [-0.45, 0.45].forEach(x => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8), trimMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(x, 0.28, -length / 2 - 0.08);
      this.mesh.add(pipe);
      
      // Nitro Flame Cone
      const flameMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0 });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 8), flameMat);
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.28, -length / 2 - 0.45);
      this.mesh.add(flame);
      this.exhausts.push(flame);
    });
    
    // Wheels & Chrome Rims
    const wheelR = isSUV ? 0.5 : 0.42;
    const wheelW = 0.3;
    const wheelGeo = new THREE.CylinderGeometry(wheelR, wheelR, wheelW, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    
    const wheelPositions = [
      { x: -width / 2 - 0.06, z: length / 2 - 0.95, isFront: true },
      { x: width / 2 + 0.06, z: length / 2 - 0.95, isFront: true },
      { x: -width / 2 - 0.06, z: -length / 2 + 0.95, isFront: false },
      { x: width / 2 + 0.06, z: -length / 2 + 0.95, isFront: false }
    ];
    
    wheelPositions.forEach(pos => {
      const wheelPivot = new THREE.Group();
      wheelPivot.position.set(pos.x, wheelR, pos.z);
      
      const wheelMesh = new THREE.Mesh(wheelGeo, tireMat);
      wheelMesh.castShadow = true;
      wheelPivot.add(wheelMesh);
      
      // Sport rim spokes
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(wheelR * 0.65, wheelR * 0.65, wheelW + 0.02, 10), rimMat);
      rim.rotateZ(Math.PI / 2);
      wheelPivot.add(rim);
      
      this.mesh.add(wheelPivot);
      this.wheels.push(wheelMesh);
      if (pos.isFront) {
        this.frontWheels.push(wheelPivot);
      }
    });
  }
  
  initParticleSystems() {
    // Drifting tire smoke particles
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.35
    });
    const smokeGeo = new THREE.SphereGeometry(0.35, 6, 6);
    
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Mesh(smokeGeo, smokeMat.clone());
      p.visible = false;
      this.scene.add(p);
      this.smokeParticles.push({ mesh: p, life: 0, maxLife: 0.45 });
    }
  }
  
  update(delta, inputY, inputX, isHandbrake, isNitro) {
    if (this.driver) {
      // Acceleration & Braking
      if (inputY > 0.05) {
        let accel = this.acceleration;
        if (isNitro && this.nitro > 0) {
          accel *= 1.85;
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
        if (this.speed > 1) {
          this.speed -= this.braking * Math.abs(inputY) * delta;
          this.isBraking = true;
        } else {
          this.speed -= this.acceleration * 0.65 * Math.abs(inputY) * delta;
          this.isBraking = false;
        }
      } else {
        this.speed *= (1.0 - 0.75 * delta);
        this.isBraking = false;
        this.isNitroActive = false;
      }
      
      // Recharge Nitro
      if (!isNitro) {
        this.nitro = Math.min(100, this.nitro + delta * 12);
      }
      
      // Handbrake / Drift
      if (isHandbrake) {
        this.speed *= (1.0 - 1.6 * delta);
        this.isBraking = true;
        if (Math.abs(this.speed) > 10 && Math.abs(inputX) > 0.15) {
          if (!this.isDrifting) {
            AudioSys.playTireScreech();
            this.isDrifting = true;
          }
          this.driftAngle += inputX * 2.8 * delta;
          this.emitDriftSmoke();
        }
      } else {
        this.isDrifting = false;
        this.driftAngle *= 0.88;
      }
      
      const maxSpd = this.isNitroActive ? this.maxSpeed * 1.35 : this.maxSpeed;
      this.speed = Math.max(-this.reverseSpeed, Math.min(maxSpd, this.speed));
      
      // Steering & Wheel Angle (Smooth response)
      const targetSteer = inputX * 0.58;
      this.steerAngle += (targetSteer - this.steerAngle) * 12 * delta;
      
      // Align front wheels with steering angle
      this.frontWheels.forEach(w => {
        w.rotation.y = this.steerAngle;
      });
      
      // **CORRECTED STEERING FORMULA**:
      // Right (+inputX) turns rotationY positive (towards +X right)!
      if (Math.abs(this.speed) > 0.4) {
        const turnDirection = this.speed >= 0 ? 1 : -1;
        this.rotationY += this.steerAngle * (Math.abs(this.speed) / 11) * turnDirection * delta * 2.3;
      }
      
      // Move vehicle along heading with drift slip
      const effectiveHeading = this.rotationY + this.driftAngle * 0.35;
      const forwardVec = new THREE.Vector3(Math.sin(effectiveHeading), 0, Math.cos(effectiveHeading));
      this.position.addScaledVector(forwardVec, this.speed * delta);
      
      // Audio RPM modulation
      AudioSys.updateEngineRPM(Math.abs(this.speed) / this.maxSpeed, inputY > 0.1);
    } else {
      this.speed *= (1.0 - 1.2 * delta);
      if (Math.abs(this.speed) > 0.1) {
        const forwardVec = new THREE.Vector3(Math.sin(this.rotationY), 0, Math.cos(this.rotationY));
        this.position.addScaledVector(forwardVec, this.speed * delta);
      }
      this.isBraking = false;
      this.isNitroActive = false;
    }
    
    // Spin wheels
    const wheelRotDelta = (this.speed * delta) / 0.42;
    this.wheels.forEach(w => {
      w.rotation.x += wheelRotDelta;
    });
    
    // Bounds check
    this.position.x = Math.max(-280, Math.min(280, this.position.x));
    this.position.z = Math.max(-280, Math.min(280, this.position.z));
    
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;
    
    // Brake lights
    this.brakeLights.forEach(b => {
      b.material.color.setHex(this.isBraking ? 0xff0000 : 0x550505);
    });
    
    // Nitro Flames Animation
    this.exhausts.forEach(flame => {
      if (this.isNitroActive) {
        flame.material.opacity = 0.85 + Math.random() * 0.15;
        flame.scale.set(1.0 + Math.random() * 0.3, 1.0 + Math.random() * 0.4, 1.0);
      } else {
        flame.material.opacity = 0;
      }
    });
    
    // Police siren flashing
    if (this.type === 'police' && this.sirenLights.length === 2) {
      const blink = Math.floor(Date.now() / 140) % 2 === 0;
      this.sirenLights[0].visible = blink;
      this.sirenLights[1].visible = !blink;
    }
    
    // Update drifting smoke particles
    this.updateParticles(delta);
  }
  
  emitDriftSmoke() {
    const rearPos = this.position.clone().add(new THREE.Vector3(
      -Math.sin(this.rotationY) * 2.0,
      0.2,
      -Math.cos(this.rotationY) * 2.0
    ));
    
    for (let i = 0; i < this.smokeParticles.length; i++) {
      const p = this.smokeParticles[i];
      if (!p.mesh.visible) {
        p.mesh.position.copy(rearPos);
        p.mesh.position.x += (Math.random() - 0.5) * 1.2;
        p.mesh.position.z += (Math.random() - 0.5) * 1.2;
        p.life = p.maxLife;
        p.mesh.visible = true;
        p.mesh.scale.set(1, 1, 1);
        break;
      }
    }
  }
  
  updateParticles(delta) {
    this.smokeParticles.forEach(p => {
      if (p.mesh.visible) {
        p.life -= delta;
        p.mesh.position.y += delta * 1.2;
        const scale = 1.0 + (1.0 - p.life / p.maxLife) * 1.8;
        p.mesh.scale.set(scale, scale, scale);
        p.mesh.material.opacity = (p.life / p.maxLife) * 0.35;
        if (p.life <= 0) {
          p.mesh.visible = false;
        }
      }
    });
  }
  
  getSpeedKmh() {
    return Math.round(Math.abs(this.speed) * 3.6);
  }
}
