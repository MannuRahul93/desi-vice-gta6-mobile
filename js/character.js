// Humanoid Player Character with Realistic Proportions & Procedural Animation
class PlayerCharacter {
  constructor(scene) {
    this.scene = scene;
    this.mesh = new THREE.Group();
    
    // State
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotationY = 0;
    this.velocity = new THREE.Vector3();
    this.isGrounded = true;
    this.isSprinting = false;
    this.isPunching = false;
    this.punchProgress = 0;
    this.inVehicle = false;
    this.currentVehicle = null;
    
    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.armor = 50;
    this.cash = 2500;
    
    // Animation timing
    this.animTime = 0;
    this.speed = 0;
    
    this.buildCharacterMesh();
    this.scene.add(this.mesh);
  }
  
  buildCharacterMesh() {
    // Realistic stylized materials optimized for low-end mobile GPU
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd29b76 }); // Desi skin tone
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x1a1512 }); // Dark hair
    const jacketMat = new THREE.MeshLambertMaterial({ color: 0x1f2937 }); // Leather / modern jacket
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4 }); // Vibrant cyan tee
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x2563eb }); // Blue denim
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0xf3f4f6 }); // White sneakers
    
    // Root group
    this.charRoot = new THREE.Group();
    this.charRoot.position.y = 0.95; // Ground offset
    this.mesh.add(this.charRoot);
    
    // Torso (Jacket & Shirt)
    const torsoGeo = new THREE.BoxGeometry(0.52, 0.65, 0.28);
    this.torso = new THREE.Mesh(torsoGeo, jacketMat);
    this.torso.position.y = 0.35;
    this.torso.castShadow = true;
    this.charRoot.add(this.torso);
    
    // Shirt inner detail
    const shirtGeo = new THREE.BoxGeometry(0.24, 0.5, 0.29);
    const shirtMesh = new THREE.Mesh(shirtGeo, shirtMat);
    this.torso.add(shirtMesh);
    
    // Head & Face
    const headGeo = new THREE.BoxGeometry(0.28, 0.32, 0.28);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 0.52;
    this.head.castShadow = true;
    this.torso.add(this.head);
    
    // Stylish Hair
    const hairGeo = new THREE.BoxGeometry(0.3, 0.12, 0.3);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.16;
    this.head.add(hairMesh);
    
    // Sunglasses (Vice City style aviators)
    const glassesGeo = new THREE.BoxGeometry(0.26, 0.08, 0.08);
    const glassesMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
    const glasses = new THREE.Mesh(glassesGeo, glassesMat);
    glasses.position.set(0, 0.04, 0.14);
    this.head.add(glasses);
    
    // Shoulders & Arms
    // Left Arm
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.35, 0.24, 0);
    this.torso.add(this.leftArmPivot);
    
    const armGeo = new THREE.BoxGeometry(0.14, 0.62, 0.14);
    const leftArmMesh = new THREE.Mesh(armGeo, jacketMat);
    leftArmMesh.position.y = -0.25;
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);
    
    // Left Hand
    const handGeo = new THREE.BoxGeometry(0.12, 0.14, 0.12);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -0.32;
    leftArmMesh.add(leftHand);
    
    // Right Arm (Punching Arm)
    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.35, 0.24, 0);
    this.torso.add(this.rightArmPivot);
    
    const rightArmMesh = new THREE.Mesh(armGeo, jacketMat);
    rightArmMesh.position.y = -0.25;
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);
    
    // Right Hand
    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.y = -0.32;
    rightArmMesh.add(rightHand);
    
    // Legs & Feet
    // Left Leg
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.16, 0, 0);
    this.charRoot.add(this.leftLegPivot);
    
    const legGeo = new THREE.BoxGeometry(0.18, 0.72, 0.2);
    const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
    leftLegMesh.position.y = -0.36;
    leftLegMesh.castShadow = true;
    this.leftLegPivot.add(leftLegMesh);
    
    const shoeGeo = new THREE.BoxGeometry(0.18, 0.12, 0.28);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.36, 0.04);
    leftLegMesh.add(leftShoe);
    
    // Right Leg
    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.16, 0, 0);
    this.charRoot.add(this.rightLegPivot);
    
    const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
    rightLegMesh.position.y = -0.36;
    rightLegMesh.castShadow = true;
    this.rightLegPivot.add(rightLegMesh);
    
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.36, 0.04);
    rightLegMesh.add(rightShoe);
  }
  
  update(delta, inputVector, isSprint, cameraAngle) {
    if (this.inVehicle) {
      this.mesh.visible = false;
      return;
    }
    this.mesh.visible = true;
    
    this.isSprinting = isSprint;
    const moveLen = inputVector.length();
    const targetSpeed = moveLen > 0.05 ? (this.isSprinting ? 11.0 : 5.0) * Math.min(moveLen, 1) : 0;
    this.speed += (targetSpeed - this.speed) * 12 * delta;
    
    // Calculate movement world direction relative to camera
    if (moveLen > 0.05) {
      const inputAngle = Math.atan2(inputVector.x, inputVector.y);
      const targetRotationY = cameraAngle + inputAngle;
      
      // Smooth character rotation
      let diff = targetRotationY - this.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotationY += diff * 14 * delta;
      
      // Move in forward direction
      const forward = new THREE.Vector3(Math.sin(this.rotationY), 0, Math.cos(this.rotationY));
      this.position.addScaledVector(forward, this.speed * delta);
    }
    
    // Handle Gravity & Jump
    if (!this.isGrounded) {
      this.velocity.y -= 22 * delta; // Gravity
      this.position.y += this.velocity.y * delta;
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }
    
    // Keep character in world bounds
    this.position.x = Math.max(-280, Math.min(280, this.position.x));
    this.position.z = Math.max(-280, Math.min(280, this.position.z));
    
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;
    
    // Procedural Animation
    this.animate(delta);
  }
  
  jump() {
    if (this.isGrounded && !this.inVehicle) {
      this.velocity.y = 8.5;
      this.isGrounded = false;
    }
  }
  
  punch(onHitCallback) {
    if (this.isPunching || this.inVehicle) return;
    this.isPunching = true;
    this.punchProgress = 0;
    AudioSys.playPunch();
    
    // Calculate punch hit point in front of player
    const punchPos = this.position.clone();
    punchPos.add(new THREE.Vector3(Math.sin(this.rotationY) * 1.2, 1.2, Math.cos(this.rotationY) * 1.2));
    
    if (onHitCallback) {
      setTimeout(() => onHitCallback(punchPos), 120);
    }
  }
  
  animate(delta) {
    if (!this.isGrounded) {
      // In air jump pose
      this.leftLegPivot.rotation.x = -0.5;
      this.rightLegPivot.rotation.x = 0.3;
      this.leftArmPivot.rotation.x = -1.2;
      this.rightArmPivot.rotation.x = -1.2;
      return;
    }
    
    // Punching animation override
    if (this.isPunching) {
      this.punchProgress += delta * 7;
      if (this.punchProgress >= Math.PI) {
        this.isPunching = false;
        this.punchProgress = 0;
        this.rightArmPivot.rotation.x = 0;
      } else {
        // Punch punch forward extension
        this.rightArmPivot.rotation.x = -Math.sin(this.punchProgress) * 1.5;
        this.rightArmPivot.rotation.z = -Math.sin(this.punchProgress) * 0.4;
      }
    }
    
    if (this.speed > 0.1) {
      // Walk / Run cycle
      const animSpeed = this.isSprinting ? 16 : 9;
      this.animTime += delta * animSpeed;
      
      const swing = Math.sin(this.animTime);
      const legAmplitude = this.isSprinting ? 0.85 : 0.55;
      const armAmplitude = this.isSprinting ? 0.75 : 0.45;
      
      // Swing legs
      this.leftLegPivot.rotation.x = swing * legAmplitude;
      this.rightLegPivot.rotation.x = -swing * legAmplitude;
      
      // Swing arms opposite to legs (unless punching)
      if (!this.isPunching) {
        this.rightArmPivot.rotation.x = swing * armAmplitude;
        this.rightArmPivot.rotation.z = 0;
      }
      this.leftArmPivot.rotation.x = -swing * armAmplitude;
      
      // Torso bobbing
      this.charRoot.position.y = 0.95 + Math.abs(Math.sin(this.animTime * 2)) * 0.06;
      this.torso.rotation.y = swing * 0.08;
    } else {
      // Idle breathing
      this.animTime += delta * 2.5;
      const breathe = Math.sin(this.animTime);
      this.charRoot.position.y = 0.95 + breathe * 0.015;
      this.leftLegPivot.rotation.x = 0;
      this.rightLegPivot.rotation.x = 0;
      if (!this.isPunching) {
        this.leftArmPivot.rotation.x = breathe * 0.05;
        this.rightArmPivot.rotation.x = breathe * 0.05;
        this.leftArmPivot.rotation.z = 0.08;
        this.rightArmPivot.rotation.z = -0.08;
      }
      this.torso.rotation.y = 0;
    }
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
