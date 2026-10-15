// Realistic Multi-Joint Humanoid Rig with Smooth Kinematic Animations
class PlayerCharacter {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    
    // Position & Orientation
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotationY = 0;
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.isSprinting = false;
    this.isPunching = false;
    this.punchTime = 0;
    this.punchCombo = 0; // 0 = jab, 1 = cross
    this.inVehicle = false;
    this.currentVehicle = null;
    
    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.armor = 50;
    this.cash = 2500;
    
    // Animation timing & state
    this.animTime = 0;
    this.speed = 0;
    this.torsoLean = 0;
    
    this.buildRealisticCharacter();
    this.scene.add(this.mesh);
  }
  
  buildRealisticCharacter() {
    // High-fidelity stylized materials
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd29b76 }); // Natural desi skin tone
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x181412 }); // Dark pompadour hair
    const jacketMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 }); // Black leather jacket
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 }); // Cyan urban tee
    const jeansMat = new THREE.MeshLambertMaterial({ color: 0x2563eb }); // Blue denim
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0xf3f4f6 }); // White sneakers
    const soleMat = new THREE.MeshLambertMaterial({ color: 0xef4444 }); // Red sneaker accents
    const glassesMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    
    // Root group
    this.charRoot = new THREE.Group();
    this.charRoot.position.y = 0.96;
    this.mesh.add(this.charRoot);
    
    // --- PELVIS & HIPS ---
    this.pelvis = new THREE.Group();
    this.charRoot.add(this.pelvis);
    
    const hipGeo = new THREE.BoxGeometry(0.42, 0.22, 0.26);
    const hipMesh = new THREE.Mesh(hipGeo, jeansMat);
    hipMesh.castShadow = true;
    this.pelvis.add(hipMesh);
    
    // --- SPINE & CHEST (Torso) ---
    this.torso = new THREE.Group();
    this.torso.position.y = 0.16;
    this.pelvis.add(this.torso);
    
    // Muscular chest & leather jacket
    const chestGeo = new THREE.BoxGeometry(0.52, 0.52, 0.32);
    const chestMesh = new THREE.Mesh(chestGeo, jacketMat);
    chestMesh.position.y = 0.26;
    chestMesh.castShadow = true;
    this.torso.add(chestMesh);
    
    // Inner cyan shirt V-cut
    const shirtGeo = new THREE.BoxGeometry(0.26, 0.46, 0.33);
    const shirtMesh = new THREE.Mesh(shirtGeo, shirtMat);
    shirtMesh.position.y = 0.26;
    this.torso.add(shirtMesh);
    
    // Collar & Lapels
    const lapelL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.04), jacketMat);
    lapelL.position.set(-0.16, 0.28, 0.17);
    lapelL.rotation.z = -0.15;
    this.torso.add(lapelL);
    
    const lapelR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.04), jacketMat);
    lapelR.position.set(0.16, 0.28, 0.17);
    lapelR.rotation.z = 0.15;
    this.torso.add(lapelR);
    
    // --- NECK & HEAD ---
    this.neck = new THREE.Group();
    this.neck.position.y = 0.54;
    this.torso.add(this.neck);
    
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.14, 8), skinMat);
    neckMesh.position.y = 0.06;
    this.neck.add(neckMesh);
    
    this.head = new THREE.Group();
    this.head.position.y = 0.14;
    this.neck.add(this.head);
    
    // Head shape with defined jawline
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), skinMat);
    headMesh.position.y = 0.14;
    headMesh.castShadow = true;
    this.head.add(headMesh);
    
    // Nose
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), skinMat);
    nose.position.set(0, 0.12, 0.16);
    this.head.add(nose);
    
    // Styled GTA hair (pompadour)
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.14, 0.32), hairMat);
    hairTop.position.set(0, 0.31, -0.01);
    this.head.add(hairTop);
    
    const hairFront = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.1, 0.12), hairMat);
    hairFront.position.set(0, 0.29, 0.16);
    hairFront.rotation.x = -0.2;
    this.head.add(hairFront);
    
    // Aviator sunglasses
    const glasses = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.09, 0.08), glassesMat);
    glasses.position.set(0, 0.16, 0.145);
    this.head.add(glasses);
    
    // --- ARMS WITH WORKING ELBOW JOINTS ---
    // Left Shoulder / Upper Arm
    this.leftUpperArm = new THREE.Group();
    this.leftUpperArm.position.set(-0.35, 0.44, 0);
    this.torso.add(this.leftUpperArm);
    
    const upperArmGeo = new THREE.BoxGeometry(0.16, 0.32, 0.16);
    const leftUpperMesh = new THREE.Mesh(upperArmGeo, jacketMat);
    leftUpperMesh.position.y = -0.14;
    leftUpperMesh.castShadow = true;
    this.leftUpperArm.add(leftUpperMesh);
    
    // Left Forearm / Elbow Joint
    this.leftForearm = new THREE.Group();
    this.leftForearm.position.set(0, -0.28, 0);
    this.leftUpperArm.add(this.leftForearm);
    
    const forearmGeo = new THREE.BoxGeometry(0.14, 0.3, 0.14);
    const leftForearmMesh = new THREE.Mesh(forearmGeo, skinMat);
    leftForearmMesh.position.y = -0.13;
    leftForearmMesh.castShadow = true;
    this.leftForearm.add(leftForearmMesh);
    
    // Left Hand (Fist)
    const handGeo = new THREE.BoxGeometry(0.12, 0.14, 0.14);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(0, -0.3, 0);
    this.leftForearm.add(leftHand);
    
    // Right Shoulder / Upper Arm (Punching Arm)
    this.rightUpperArm = new THREE.Group();
    this.rightUpperArm.position.set(0.35, 0.44, 0);
    this.torso.add(this.rightUpperArm);
    
    const rightUpperMesh = new THREE.Mesh(upperArmGeo, jacketMat);
    rightUpperMesh.position.y = -0.14;
    rightUpperMesh.castShadow = true;
    this.rightUpperArm.add(rightUpperMesh);
    
    // Right Forearm / Elbow Joint
    this.rightForearm = new THREE.Group();
    this.rightForearm.position.set(0, -0.28, 0);
    this.rightUpperArm.add(this.rightForearm);
    
    const rightForearmMesh = new THREE.Mesh(forearmGeo, skinMat);
    rightForearmMesh.position.y = -0.13;
    rightForearmMesh.castShadow = true;
    this.rightForearm.add(rightForearmMesh);
    
    // Right Hand (Fist)
    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0, -0.3, 0);
    this.rightForearm.add(rightHand);
    
    // --- LEGS WITH WORKING KNEE JOINTS & SNEAKERS ---
    // Left Thigh / Hip Joint
    this.leftThigh = new THREE.Group();
    this.leftThigh.position.set(-0.16, -0.1, 0);
    this.pelvis.add(this.leftThigh);
    
    const thighGeo = new THREE.BoxGeometry(0.2, 0.42, 0.22);
    const leftThighMesh = new THREE.Mesh(thighGeo, jeansMat);
    leftThighMesh.position.y = -0.19;
    leftThighMesh.castShadow = true;
    this.leftThigh.add(leftThighMesh);
    
    // Left Knee Joint / Shin
    this.leftShin = new THREE.Group();
    this.leftShin.position.set(0, -0.38, 0);
    this.leftThigh.add(this.leftShin);
    
    const shinGeo = new THREE.BoxGeometry(0.18, 0.44, 0.2);
    const leftShinMesh = new THREE.Mesh(shinGeo, jeansMat);
    leftShinMesh.position.y = -0.19;
    leftShinMesh.castShadow = true;
    this.leftShin.add(leftShinMesh);
    
    // Left Sneaker
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.32), shoeMat);
    leftShoe.position.set(0, -0.39, 0.05);
    leftShoe.castShadow = true;
    this.leftShin.add(leftShoe);
    
    const leftSole = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.33), soleMat);
    leftSole.position.set(0, -0.45, 0.05);
    this.leftShin.add(leftSole);
    
    // Right Thigh / Hip Joint
    this.rightThigh = new THREE.Group();
    this.rightThigh.position.set(0.16, -0.1, 0);
    this.pelvis.add(this.rightThigh);
    
    const rightThighMesh = new THREE.Mesh(thighGeo, jeansMat);
    rightThighMesh.position.y = -0.19;
    rightThighMesh.castShadow = true;
    this.rightThigh.add(rightThighMesh);
    
    // Right Knee Joint / Shin
    this.rightShin = new THREE.Group();
    this.rightShin.position.set(0, -0.38, 0);
    this.rightThigh.add(this.rightShin);
    
    const rightShinMesh = new THREE.Mesh(shinGeo, jeansMat);
    rightShinMesh.position.y = -0.19;
    rightShinMesh.castShadow = true;
    this.rightShin.add(rightShinMesh);
    
    // Right Sneaker
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.32), shoeMat);
    rightShoe.position.set(0, -0.39, 0.05);
    rightShoe.castShadow = true;
    this.rightShin.add(rightShoe);
    
    const rightSole = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.33), soleMat);
    rightSole.position.set(0, -0.45, 0.05);
    this.rightShin.add(rightSole);
  }
  
  update(delta, inputVector, isSprint, cameraAngle) {
    if (this.inVehicle) {
      // Driver visible inside car seat
      this.mesh.visible = true;
      this.updateDrivingPose(delta);
      return;
    }
    this.mesh.visible = true;
    
    this.isSprinting = isSprint;
    const moveLen = inputVector.length();
    const maxSpd = this.isSprinting ? 12.0 : 5.5;
    const targetSpeed = moveLen > 0.05 ? maxSpd * Math.min(moveLen, 1) : 0;
    this.speed += (targetSpeed - this.speed) * 14 * delta;
    
    // Calculate movement world direction relative to camera
    if (moveLen > 0.05) {
      // Input direction from camera viewpoint
      const inputAngle = Math.atan2(inputVector.x, inputVector.y);
      const targetRotationY = cameraAngle + inputAngle;
      
      // Smooth angular interpolation
      let diff = targetRotationY - this.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotationY += diff * 16 * delta;
      
      // Forward translation in 3D world
      const forward = new THREE.Vector3(Math.sin(this.rotationY), 0, Math.cos(this.rotationY));
      this.position.addScaledVector(forward, this.speed * delta);
    }
    
    // Gravity & Jump physics
    if (!this.isGrounded) {
      this.velocity.y -= 24 * delta;
      this.position.y += this.velocity.y * delta;
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }
    
    // World boundary
    this.position.x = Math.max(-280, Math.min(280, this.position.x));
    this.position.z = Math.max(-280, Math.min(280, this.position.z));
    
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;
    
    // Play realistic kinematic locomotion & combat
    this.animateKinematics(delta);
  }
  
  jump() {
    if (this.isGrounded && !this.inVehicle) {
      this.velocity.y = 9.2;
      this.isGrounded = false;
    }
  }
  
  punch(onHitCallback) {
    if (this.isPunching || this.inVehicle) return;
    this.isPunching = true;
    this.punchTime = 0;
    this.punchCombo = (this.punchCombo + 1) % 2;
    AudioSys.playPunch();
    
    const punchPos = this.position.clone();
    punchPos.add(new THREE.Vector3(Math.sin(this.rotationY) * 1.4, 1.2, Math.cos(this.rotationY) * 1.4));
    
    if (onHitCallback) {
      setTimeout(() => onHitCallback(punchPos), 100);
    }
  }
  
  animateKinematics(delta) {
    // --- JUMPING POSE ---
    if (!this.isGrounded) {
      this.charRoot.position.y = 0.96;
      this.torso.rotation.x = -0.15;
      
      // Tuck legs in air
      this.leftThigh.rotation.x = -0.7;
      this.leftShin.rotation.x = 1.1; // Bend knee
      this.rightThigh.rotation.x = -0.4;
      this.rightShin.rotation.x = 0.8;
      
      // Arms flare for balance
      this.leftUpperArm.rotation.set(-1.1, 0, -0.4);
      this.leftForearm.rotation.x = -0.5;
      this.rightUpperArm.rotation.set(-1.1, 0, 0.4);
      this.rightForearm.rotation.x = -0.5;
      return;
    }
    
    // --- PUNCH / MELEE ATTACK COMBO ---
    if (this.isPunching) {
      this.punchTime += delta * 8.5;
      if (this.punchTime >= Math.PI) {
        this.isPunching = false;
        this.punchTime = 0;
      } else {
        const p = Math.sin(this.punchTime);
        if (this.punchCombo === 1) {
          // Powerful Right Cross Punch
          this.torso.rotation.y = -p * 0.55; // Body torque
          this.torso.rotation.x = -p * 0.15;
          this.rightUpperArm.rotation.x = -p * 1.6; // Shoulder extension
          this.rightUpperArm.rotation.y = p * 0.3;
          this.rightForearm.rotation.x = -p * 0.2; // Snap elbow straight
          
          // Left hand guards face
          this.leftUpperArm.rotation.x = -0.6;
          this.leftForearm.rotation.x = -1.2;
        } else {
          // Quick Left Jab
          this.torso.rotation.y = p * 0.45;
          this.leftUpperArm.rotation.x = -p * 1.5;
          this.leftUpperArm.rotation.y = -p * 0.25;
          this.leftForearm.rotation.x = -p * 0.15;
          
          this.rightUpperArm.rotation.x = -0.5;
          this.rightForearm.rotation.x = -1.1;
        }
        return;
      }
    }
    
    // --- RUNNING / SPRINTING / WALKING ---
    if (this.speed > 0.15) {
      const animRate = this.isSprinting ? 18.0 : 10.5;
      this.animTime += delta * animRate;
      
      const stride = Math.sin(this.animTime);
      const strideCos = Math.cos(this.animTime);
      
      // Dynamic sprint lean & chest torque
      const targetLean = this.isSprinting ? -0.25 : -0.08;
      this.torsoLean += (targetLean - this.torsoLean) * 10 * delta;
      this.torso.rotation.x = this.torsoLean;
      this.torso.rotation.y = -stride * 0.12; // Athletic counter-rotation
      
      // Vertical hip bounce
      this.charRoot.position.y = 0.96 + Math.abs(strideCos) * (this.isSprinting ? 0.1 : 0.05);
      
      // Leg kinematics: Thigh swings forward & Knee bends on backswing!
      const legAmp = this.isSprinting ? 0.95 : 0.6;
      this.leftThigh.rotation.x = stride * legAmp;
      this.rightThigh.rotation.x = -stride * legAmp;
      
      // Knee flexion: Bend knee when leg is behind or swinging forward
      this.leftShin.rotation.x = Math.max(0, -stride * 1.1) + (this.isSprinting ? 0.3 : 0.15);
      this.rightShin.rotation.x = Math.max(0, stride * 1.1) + (this.isSprinting ? 0.3 : 0.15);
      
      // Arm kinematics: 90-degree athletic pumping elbow!
      const armAmp = this.isSprinting ? 1.05 : 0.65;
      this.leftUpperArm.rotation.x = -stride * armAmp;
      this.leftUpperArm.rotation.z = -0.15;
      this.leftForearm.rotation.x = -0.85 - Math.max(0, stride * 0.4); // Natural bend
      
      this.rightUpperArm.rotation.x = stride * armAmp;
      this.rightUpperArm.rotation.z = 0.15;
      this.rightForearm.rotation.x = -0.85 - Math.max(0, -stride * 0.4);
    } else {
      // --- IDLE RELAXED GTA STANCE ---
      this.animTime += delta * 2.2;
      const breathe = Math.sin(this.animTime);
      
      this.torso.rotation.x = 0;
      this.torso.rotation.y = 0;
      this.charRoot.position.y = 0.96 + breathe * 0.015;
      
      // Weight shifted slightly to right leg
      this.leftThigh.rotation.set(0.05, 0, -0.04);
      this.leftShin.rotation.set(0.05, 0, 0);
      this.rightThigh.rotation.set(-0.02, 0, 0.04);
      this.rightShin.rotation.set(0.02, 0, 0);
      
      // Relaxed arms hanging by hips with slight elbow bend
      this.leftUpperArm.rotation.set(breathe * 0.04, 0, 0.1);
      this.leftForearm.rotation.set(-0.25, 0, 0);
      
      this.rightUpperArm.rotation.set(breathe * 0.04, 0, -0.1);
      this.rightForearm.rotation.set(-0.25, 0, 0);
    }
  }
  
  updateDrivingPose(delta) {
    if (!this.currentVehicle) return;
    
    // Position player inside vehicle cockpit
    const vPos = this.currentVehicle.position.clone();
    this.mesh.position.copy(vPos);
    this.mesh.rotation.y = this.currentVehicle.rotationY;
    
    // Sit in driver seat: Lower pelvis, bend knees 90 deg, hands on wheel
    this.charRoot.position.set(-0.4, 0.45, 0.1);
    this.torso.rotation.set(-0.15, 0, 0);
    
    // Seated knees
    this.leftThigh.rotation.set(-1.45, 0, -0.1);
    this.leftShin.rotation.set(1.45, 0, 0);
    
    this.rightThigh.rotation.set(-1.45, 0, 0.1);
    this.rightShin.rotation.set(1.45, 0, 0);
    
    // Hands reaching forward to steering wheel
    const steerInput = this.currentVehicle.steerAngle || 0;
    this.leftUpperArm.rotation.set(-0.85, 0.2, -0.2);
    this.leftForearm.rotation.set(-0.6 + steerInput * 0.3, 0, 0);
    
    this.rightUpperArm.rotation.set(-0.85, -0.2, 0.2);
    this.rightForearm.rotation.set(-0.6 - steerInput * 0.3, 0, 0);
  }
  
  takeDamage(amount) {
    if (this.armor > 0) {
      this.armor -= amount;
      if (this.armor < 0) {
        this.health += this.armor;
        this.armor = 0;
      }
    } else {
      this.health -= amount;
    }
    this.health = Math.max(0, this.health);
    return this.health <= 0;
  }
  
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}
