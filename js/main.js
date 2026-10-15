// Desi Vice: Mobile - Main Game Controller with GTA Rotating GPS & Smart Camera
class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    
    // Quality preset: 'low', 'med', 'high'
    this.quality = 'med';
    
    // Smart Camera parameters
    this.cameraAngleY = 0;
    this.cameraAngleX = 0.28; // Pitch
    this.cameraDistance = 6.2;
    this.targetCameraAngleY = 0;
    this.userLookTimeout = 0; // Timer when player drags camera
    
    // Minimap Canvas
    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;
    
    // 3D Navigation Guide Arrow
    this.navArrow = null;
    
    this.initThree();
    this.initComponents();
    this.initEventListeners();
    
    // Start game loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }
  
  initThree() {
    this.scene = new THREE.Scene();
    
    // GTA 6 Miami Sunset / Golden Hour Sky & Atmosphere
    this.scene.background = new THREE.Color(0xf59e0b); // Rich warm sunset
    this.scene.fog = new THREE.FogExp2(0xf59e0b, 0.0022);
    
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.5,
      650
    );
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.container.appendChild(this.renderer.domElement);
    
    // Sun Directional Light & Soft Sky Ambient
    this.ambientLight = new THREE.AmbientLight(0xffedd5, 0.7);
    this.scene.add(this.ambientLight);
    
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 0.95);
    this.sunLight.position.set(130, 160, 90);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 420;
    this.sunLight.shadow.camera.left = -160;
    this.sunLight.shadow.camera.right = 160;
    this.sunLight.shadow.camera.top = 160;
    this.sunLight.shadow.camera.bottom = -160;
    this.scene.add(this.sunLight);
  }
  
  initComponents() {
    this.input = new InputController();
    this.city = new CityBuilder(this.scene);
    this.player = new PlayerCharacter(this.scene);
    this.player.position.set(0, 0, 0);
    
    this.police = new PoliceSystem(this.scene, this.city);
    this.traffic = new TrafficSystem(this.scene, this.city);
    this.missions = new MissionManager(this.scene, this.player, this.city, this.police);
    
    // Spawn initial drivable vehicles
    this.vehicles = [];
    const car1 = new Vehicle(this.scene, 'supercar', new THREE.Vector3(12, 0, 10));
    const car2 = new Vehicle(this.scene, 'suv', new THREE.Vector3(-14, 0, 16));
    this.vehicles.push(car1, car2);
    
    // Build 3D In-World Navigation Compass Arrow
    this.build3DNavigationArrow();
  }
  
  build3DNavigationArrow() {
    const arrowGroup = new THREE.Group();
    
    // Glowing cyan 3D Chevron Arrow floating near feet/car
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 });
    const arrowGeo = new THREE.ConeGeometry(0.5, 1.4, 3);
    arrowGeo.rotateX(Math.PI / 2); // Point forward
    
    const arrowMesh = new THREE.Mesh(arrowGeo, arrowMat);
    arrowGroup.add(arrowMesh);
    
    this.navArrow = arrowGroup;
    this.scene.add(this.navArrow);
  }
  
  initEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    const btnLang = document.getElementById('btn-lang-toggle');
    if (btnLang) {
      btnLang.addEventListener('click', () => {
        I18N.toggleLanguage();
      });
    }
    
    const btnSettings = document.getElementById('btn-settings-open');
    const modalSettings = document.getElementById('modal-settings');
    const btnCloseSettings = document.getElementById('btn-settings-close');
    
    if (btnSettings && modalSettings) {
      btnSettings.addEventListener('click', () => { modalSettings.style.display = 'flex'; });
    }
    if (btnCloseSettings && modalSettings) {
      btnCloseSettings.addEventListener('click', () => { modalSettings.style.display = 'none'; });
    }
    
    const btnLow = document.getElementById('opt-quality-low');
    const btnMed = document.getElementById('opt-quality-med');
    const btnHigh = document.getElementById('opt-quality-high');
    
    if (btnLow) btnLow.addEventListener('click', () => this.setGraphicsQuality('low'));
    if (btnMed) btnMed.addEventListener('click', () => this.setGraphicsQuality('med'));
    if (btnHigh) btnHigh.addEventListener('click', () => this.setGraphicsQuality('high'));
    
    const btnCam = document.getElementById('btn-cam-switch');
    if (btnCam) {
      btnCam.addEventListener('click', () => {
        this.cameraDistance = this.cameraDistance === 6.2 ? 11.5 : (this.cameraDistance === 11.5 ? 3.8 : 6.2);
      });
    }
    
    const startAudio = () => {
      AudioSys.init();
      window.removeEventListener('touchstart', startAudio);
      window.removeEventListener('click', startAudio);
    };
    window.addEventListener('touchstart', startAudio, { once: true });
    window.addEventListener('click', startAudio, { once: true });
  }
  
  setGraphicsQuality(level) {
    this.quality = level;
    document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
    
    if (level === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
      this.scene.fog.density = 0.0035;
      const b = document.getElementById('opt-quality-low');
      if (b) b.classList.add('active');
    } else if (level === 'med') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      this.scene.fog.density = 0.0022;
      const b = document.getElementById('opt-quality-med');
      if (b) b.classList.add('active');
    } else if (level === 'high') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.scene.fog.density = 0.0016;
      const b = document.getElementById('opt-quality-high');
      if (b) b.classList.add('active');
    }
  }
  
  animate() {
    requestAnimationFrame(this.animate);
    
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.input.update();
    
    // User touch camera swipe detection
    const isSwipingCamera = Math.abs(this.input.cameraDelta.x) > 0.001 || Math.abs(this.input.cameraDelta.y) > 0.001;
    if (isSwipingCamera) {
      this.cameraAngleY -= this.input.cameraDelta.x * 3.2;
      this.cameraAngleX = Math.max(0.08, Math.min(1.2, this.cameraAngleX + this.input.cameraDelta.y * 3.0));
      this.userLookTimeout = 2.0; // Wait 2s before auto-recentering
      this.input.resetCameraDelta();
    } else if (this.userLookTimeout > 0) {
      this.userLookTimeout -= delta;
    }
    
    // Handle Enter/Exit Vehicle
    this.handleVehicleInteraction();
    
    // Update Player or Vehicle
    if (this.player.inVehicle && this.player.currentVehicle) {
      const v = this.player.currentVehicle;
      v.update(delta, this.input.moveVector.y, this.input.moveVector.x, this.input.isHandbrake, this.input.isNitro);
      this.player.position.copy(v.position);
      
      // SMART CAMERA AUTO-FOLLOW (Glides behind car heading!)
      if (this.userLookTimeout <= 0 && Math.abs(v.speed) > 0.5) {
        // Smoothly rotate camera behind the car
        let angleDiff = v.rotationY - this.cameraAngleY;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        this.cameraAngleY += angleDiff * 5.5 * delta;
      }
      
      this.updateSpeedometer(v.getSpeedKmh(), v.nitro);
    } else {
      this.player.update(delta, this.input.moveVector, this.input.isSprinting, this.cameraAngleY);
      
      // Auto-recenter behind running player
      if (this.userLookTimeout <= 0 && this.player.speed > 3.0) {
        let diff = this.player.rotationY - this.cameraAngleY;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.cameraAngleY += diff * 2.8 * delta;
      }
      
      if (this.input.isJumping) {
        this.player.jump();
      }
      
      if (this.input.isPunching) {
        this.player.punch((hitPos) => this.checkPunchHit(hitPos));
        this.input.isPunching = false;
      }
      
      this.hideSpeedometer();
    }
    
    // Update Camera Follow & Speed Zoom
    this.updateCameraFollow(delta);
    
    // Update City Animations (swaying palm fronds)
    this.city.update(delta);
    
    // Update AI Systems
    const targetPos = this.player.position;
    this.police.update(delta, targetPos);
    this.traffic.update(delta, targetPos, (hitCiv) => {
      if (this.player.inVehicle && Math.abs(this.player.currentVehicle.speed) > 4) {
        this.traffic.knockoutCiv(hitCiv);
        this.police.addCrime(1);
        this.player.cash += 80;
      }
    });
    
    // Update Missions
    this.missions.update(delta, targetPos, this.player.inVehicle);
    
    // Update 3D Navigation Arrow
    this.update3DNavigationArrow();
    
    // Render GTA Rotating GPS Radar
    this.renderRotatingMinimap();
    this.updateHUD();
    
    this.renderer.render(this.scene, this.camera);
  }
  
  handleVehicleInteraction() {
    let nearestCar = null;
    let nearestDist = 4.5;
    
    const allCars = [...this.vehicles, ...this.traffic.trafficCars];
    if (this.missions.targetVehicle) allCars.push(this.missions.targetVehicle);
    
    allCars.forEach(car => {
      const d = car.position.distanceTo(this.player.position);
      if (d < nearestDist) {
        nearestDist = d;
        nearestCar = car;
      }
    });
    
    const btnDrive = document.getElementById('btn-drive');
    const driveLabel = document.getElementById('lbl-drive-btn');
    
    if (this.player.inVehicle) {
      if (btnDrive) btnDrive.classList.add('in-car');
      if (driveLabel) driveLabel.textContent = I18N.t('btnExit');
      
      if (this.input.consumeInteract()) {
        const car = this.player.currentVehicle;
        car.driver = null;
        this.player.inVehicle = false;
        this.player.currentVehicle = null;
        this.player.position.copy(car.position).add(new THREE.Vector3(-2.2, 0, 0));
        AudioSys.stopEngine();
      }
    } else {
      if (btnDrive) {
        if (nearestCar) {
          btnDrive.classList.add('pulse-active');
          btnDrive.style.opacity = '1.0';
        } else {
          btnDrive.classList.remove('pulse-active');
          btnDrive.style.opacity = '0.55';
        }
      }
      if (driveLabel) driveLabel.textContent = I18N.t('btnDrive');
      
      if (nearestCar && this.input.consumeInteract()) {
        this.player.inVehicle = true;
        this.player.currentVehicle = nearestCar;
        nearestCar.driver = this.player;
        AudioSys.startEngine();
        AudioSys.speak(I18N.t('dialogCarEnter'), I18N.currentLang);
      }
    }
  }
  
  checkPunchHit(punchPos) {
    this.traffic.civilians.forEach(civ => {
      if (civ.alive && civ.mesh.position.distanceTo(punchPos) < 1.7) {
        this.traffic.knockoutCiv(civ);
        this.police.addCrime(1);
        this.player.cash += 50;
      }
    });
  }
  
  updateCameraFollow(delta) {
    const target = this.player.inVehicle && this.player.currentVehicle
      ? this.player.currentVehicle.position
      : this.player.position;
    
    // Dynamic pullback zoom proportional to vehicle speed
    let dist = this.cameraDistance;
    if (this.player.inVehicle && this.player.currentVehicle) {
      const speedNorm = Math.abs(this.player.currentVehicle.speed) / 38;
      dist = this.cameraDistance + speedNorm * 5.5; // Smooth cinematic pullback
    }
    
    const camY = target.y + Math.sin(this.cameraAngleX) * dist + 1.25;
    const horizontalDist = Math.cos(this.cameraAngleX) * dist;
    const camX = target.x - Math.sin(this.cameraAngleY) * horizontalDist;
    const camZ = target.z - Math.cos(this.cameraAngleY) * horizontalDist;
    
    this.camera.position.x += (camX - this.camera.position.x) * 16 * delta;
    this.camera.position.y += (camY - this.camera.position.y) * 16 * delta;
    this.camera.position.z += (camZ - this.camera.position.z) * 16 * delta;
    
    const lookTarget = target.clone();
    lookTarget.y += 1.35;
    this.camera.lookAt(lookTarget);
  }
  
  update3DNavigationArrow() {
    if (!this.navArrow) return;
    
    // Active destination waypoint
    const targetPos = this.missions.targetPoint;
    if (!targetPos) {
      this.navArrow.visible = false;
      return;
    }
    
    this.navArrow.visible = true;
    
    // Float arrow right in front of player / car on ground
    const pPos = this.player.position;
    const forwardOffset = this.player.inVehicle ? 3.5 : 1.8;
    const heading = this.player.inVehicle && this.player.currentVehicle
      ? this.player.currentVehicle.rotationY
      : this.player.rotationY;
    
    this.navArrow.position.set(
      pPos.x + Math.sin(heading) * forwardOffset,
      0.25 + Math.sin(Date.now() / 250) * 0.08,
      pPos.z + Math.cos(heading) * forwardOffset
    );
    
    // Point arrow towards destination
    const dx = targetPos.x - pPos.x;
    const dz = targetPos.z - pPos.z;
    const arrowAngle = Math.atan2(dx, dz);
    this.navArrow.rotation.y = arrowAngle;
  }
  
  renderRotatingMinimap() {
    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = cx - 3;
    const radarScale = 0.42; // meters to radar pixels
    
    // Clear & Circular Mask
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    
    // Dark Blueprint Ocean Background
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, w, h);
    
    // ROTATION: The radar rotates so player heading is ALWAYS UP!
    const heading = this.player.inVehicle && this.player.currentVehicle
      ? this.player.currentVehicle.rotationY
      : this.player.rotationY;
    
    ctx.translate(cx, cy);
    ctx.rotate(-heading); // Head-Up Radar rotation!
    
    // Draw Roads Network relative to player position
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    [-200, -100, 0, 100, 200].forEach(roadPos => {
      const rx = (roadPos - this.player.position.x) * radarScale;
      const rz = (roadPos - this.player.position.z) * radarScale;
      
      // Vertical Avenues
      ctx.beginPath();
      ctx.moveTo(rx, -350);
      ctx.lineTo(rx, 350);
      ctx.stroke();
      
      // Horizontal Avenues
      ctx.beginPath();
      ctx.moveTo(-350, rz);
      ctx.lineTo(350, rz);
      ctx.stroke();
    });
    
    // Safehouse marker
    const shX = (this.city.safehouseLocation.x - this.player.position.x) * radarScale;
    const shZ = (this.city.safehouseLocation.z - this.player.position.z) * radarScale;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(shX, shZ, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Mission target marker
    if (this.missions.targetPoint) {
      const mX = (this.missions.targetPoint.x - this.player.position.x) * radarScale;
      const mZ = (this.missions.targetPoint.z - this.player.position.z) * radarScale;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(mX, mZ, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Police Units (Flashing Red)
    this.police.policeUnits.forEach(cop => {
      const pX = (cop.position.x - this.player.position.x) * radarScale;
      const pZ = (cop.position.z - this.player.position.z) * radarScale;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pX, pZ, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore(); // Restore unrotated frame for Player Needle & Outer Rim
    
    // Outer Neon Radar Ring
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // North Indicator (N) rotating around rim
    const northAngle = -heading;
    const nX = cx + Math.sin(northAngle) * (radius - 10);
    const nY = cy - Math.cos(northAngle) * (radius - 10);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', nX, nY);
    
    // Player Icon: ALWAYS POINTING STRAIGHT UP (True GTA Style!)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Cyan Player Triangle pointing UP
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx - 6, cy + 6);
    ctx.lineTo(cx + 6, cy + 6);
    ctx.closePath();
    ctx.fill();
    
    // Edge Compass Blip for Off-Screen Mission Target
    if (this.missions.targetPoint) {
      const dx = this.missions.targetPoint.x - this.player.position.x;
      const dz = this.missions.targetPoint.z - this.player.position.z;
      const dist = Math.hypot(dx, dz);
      const angleToTarget = Math.atan2(dx, dz) - heading;
      
      // If target is far from radar center, draw arrow on rim!
      const rimX = cx + Math.sin(angleToTarget) * (radius - 8);
      const rimY = cy - Math.cos(angleToTarget) * (radius - 8);
      
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(rimX, rimY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Update Distance readout on card
      const distEl = document.getElementById('mission-timer');
      if (distEl && this.missions.stage === 2) {
        distEl.textContent = `⏱️ ${Math.ceil(this.missions.timer)}s | 🎯 ${Math.round(dist)}m`;
      }
    }
  }
  
  updateHUD() {
    const hpBar = document.getElementById('hud-hp-bar');
    if (hpBar) hpBar.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
    
    const armorBar = document.getElementById('hud-armor-bar');
    if (armorBar) armorBar.style.width = `${this.player.armor}%`;
    
    const cashEl = document.getElementById('hud-cash-val');
    if (cashEl) cashEl.textContent = `₹${this.player.cash.toLocaleString()}`;
  }
  
  updateSpeedometer(kmh, nitroVal) {
    const spdBox = document.getElementById('speedo-container');
    const spdVal = document.getElementById('speedo-value');
    const nitroFill = document.getElementById('nitro-fill');
    
    if (spdBox) spdBox.style.display = 'flex';
    if (spdVal) spdVal.textContent = kmh;
    if (nitroFill) nitroFill.style.width = `${nitroVal}%`;
  }
  
  hideSpeedometer() {
    const spdBox = document.getElementById('speedo-container');
    if (spdBox) spdBox.style.display = 'none';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameApp();
  I18N.updateDOM();
});
