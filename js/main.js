// Desi Vice: Mobile - Main Game Controller & 3D Engine Loop
class GameApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();
    
    // Quality preset: 'low', 'med', 'high'
    this.quality = 'med';
    
    // Camera params
    this.cameraAngleY = 0;
    this.cameraAngleX = 0.25; // Pitch
    this.cameraDistance = 6.0;
    
    // Minimap Canvas
    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas ? this.radarCanvas.getContext('2d') : null;
    
    this.initThree();
    this.initComponents();
    this.initEventListeners();
    
    // Start game loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }
  
  initThree() {
    // 3D Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Miami blue sky
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0025);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.5,
      600
    );
    
    // Optimized WebGL Renderer for Mobile
    this.renderer = new THREE.WebGLRenderer({
      antialias: false, // Disabled by default for maximum mobile FPS
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Very light on mobile GPU
    this.container.appendChild(this.renderer.domElement);
    
    // Sunlight & Ambient Lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(this.ambientLight);
    
    this.sunLight = new THREE.DirectionalLight(0xfff5ea, 0.85);
    this.sunLight.position.set(120, 160, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    this.sunLight.shadow.camera.left = -150;
    this.sunLight.shadow.camera.right = 150;
    this.sunLight.shadow.camera.top = 150;
    this.sunLight.shadow.camera.bottom = -150;
    this.scene.add(this.sunLight);
  }
  
  initComponents() {
    // Input controller
    this.input = new InputController();
    
    // City world
    this.city = new CityBuilder(this.scene);
    
    // Player character
    this.player = new PlayerCharacter(this.scene);
    this.player.position.set(0, 0, 0);
    
    // Police wanted system
    this.police = new PoliceSystem(this.scene, this.city);
    
    // Ambient traffic & peds
    this.traffic = new TrafficSystem(this.scene, this.city);
    
    // Mission manager
    this.missions = new MissionManager(this.scene, this.player, this.city, this.police);
    
    // Spawn initial drivable vehicles around player
    this.vehicles = [];
    const car1 = new Vehicle(this.scene, 'supercar', new THREE.Vector3(12, 0, 8));
    const car2 = new Vehicle(this.scene, 'suv', new THREE.Vector3(-14, 0, 16));
    this.vehicles.push(car1, car2);
  }
  
  initEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // UI Language Toggle
    const btnLang = document.getElementById('btn-lang-toggle');
    if (btnLang) {
      btnLang.addEventListener('click', () => {
        I18N.toggleLanguage();
      });
    }
    
    // Settings Modal
    const btnSettings = document.getElementById('btn-settings-open');
    const modalSettings = document.getElementById('modal-settings');
    const btnCloseSettings = document.getElementById('btn-settings-close');
    
    if (btnSettings && modalSettings) {
      btnSettings.addEventListener('click', () => {
        modalSettings.style.display = 'flex';
      });
    }
    if (btnCloseSettings && modalSettings) {
      btnCloseSettings.addEventListener('click', () => {
        modalSettings.style.display = 'none';
      });
    }
    
    // Graphics Preset Selection
    const btnLow = document.getElementById('opt-quality-low');
    const btnMed = document.getElementById('opt-quality-med');
    const btnHigh = document.getElementById('opt-quality-high');
    
    if (btnLow) btnLow.addEventListener('click', () => this.setGraphicsQuality('low'));
    if (btnMed) btnMed.addEventListener('click', () => this.setGraphicsQuality('med'));
    if (btnHigh) btnHigh.addEventListener('click', () => this.setGraphicsQuality('high'));
    
    // Camera View Toggle
    const btnCam = document.getElementById('btn-cam-switch');
    if (btnCam) {
      btnCam.addEventListener('click', () => {
        this.cameraDistance = this.cameraDistance === 6.0 ? 11.0 : (this.cameraDistance === 11.0 ? 3.5 : 6.0);
      });
    }
    
    // Audio init on first user touch / click
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
      this.scene.fog.density = 0.004;
      const b = document.getElementById('opt-quality-low');
      if (b) b.classList.add('active');
    } else if (level === 'med') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      this.scene.fog.density = 0.0025;
      const b = document.getElementById('opt-quality-med');
      if (b) b.classList.add('active');
    } else if (level === 'high') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
      this.scene.fog.density = 0.0018;
      const b = document.getElementById('opt-quality-high');
      if (b) b.classList.add('active');
    }
  }
  
  animate() {
    requestAnimationFrame(this.animate);
    
    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.input.update();
    
    // Update Camera Orbit Angles from touch drag / mouse
    this.cameraAngleY -= this.input.cameraDelta.x * 3.0;
    this.cameraAngleX = Math.max(0.05, Math.min(1.2, this.cameraAngleX + this.input.cameraDelta.y * 3.0));
    this.input.resetCameraDelta();
    
    // Handle Vehicle Interaction (Enter/Exit)
    this.handleVehicleInteraction();
    
    // Update Player or Vehicle
    if (this.player.inVehicle && this.player.currentVehicle) {
      const v = this.player.currentVehicle;
      v.update(delta, this.input.moveVector.y, this.input.moveVector.x, this.input.isHandbrake, this.input.isNitro);
      this.player.position.copy(v.position);
      
      // Update Speedometer UI
      this.updateSpeedometer(v.getSpeedKmh(), v.nitro);
    } else {
      // Update foot player
      this.player.update(delta, this.input.moveVector, this.input.isSprinting, this.cameraAngleY);
      
      // Jump
      if (this.input.isJumping) {
        this.player.jump();
      }
      
      // Punch attack
      if (this.input.isPunching) {
        this.player.punch((hitPos) => {
          this.checkPunchHit(hitPos);
        });
        this.input.isPunching = false;
      }
      
      this.hideSpeedometer();
    }
    
    // Update Camera Follow Target
    this.updateCameraFollow(delta);
    
    // Update AI Systems
    const targetPos = this.player.position;
    this.police.update(delta, targetPos);
    this.traffic.update(delta, targetPos, (hitCiv) => {
      // Car ran over civilian
      if (this.player.inVehicle && Math.abs(this.player.currentVehicle.speed) > 4) {
        this.traffic.knockoutCiv(hitCiv);
        this.police.addCrime(1);
        this.player.cash += 80;
      }
    });
    
    // Update Missions
    this.missions.update(delta, targetPos, this.player.inVehicle);
    
    // Update Minimap Radar & HUD
    this.renderMinimap();
    this.updateHUD();
    
    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }
  
  handleVehicleInteraction() {
    // Find nearest drivable vehicle
    let nearestCar = null;
    let nearestDist = 4.2;
    
    const allCars = [...this.vehicles, ...this.traffic.trafficCars];
    if (this.missions.targetVehicle) allCars.push(this.missions.targetVehicle);
    
    allCars.forEach(car => {
      const d = car.position.distanceTo(this.player.position);
      if (d < nearestDist) {
        nearestDist = d;
        nearestCar = car;
      }
    });
    
    // Contextual button prompt
    const btnDrive = document.getElementById('btn-drive');
    const driveLabel = document.getElementById('lbl-drive-btn');
    
    if (this.player.inVehicle) {
      if (btnDrive) btnDrive.classList.add('in-car');
      if (driveLabel) driveLabel.textContent = I18N.t('btnExit');
      
      if (this.input.consumeInteract()) {
        // Exit Vehicle
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
          btnDrive.style.opacity = '0.5';
        }
      }
      if (driveLabel) driveLabel.textContent = I18N.t('btnDrive');
      
      if (nearestCar && this.input.consumeInteract()) {
        // Enter Vehicle
        this.player.inVehicle = true;
        this.player.currentVehicle = nearestCar;
        nearestCar.driver = this.player;
        AudioSys.startEngine();
        AudioSys.speak(I18N.t('dialogCarEnter'), I18N.currentLang);
      }
    }
  }
  
  checkPunchHit(punchPos) {
    // Check against civilians
    this.traffic.civilians.forEach(civ => {
      if (civ.alive && civ.mesh.position.distanceTo(punchPos) < 1.6) {
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
    
    // Dynamic pullback distance if vehicle is moving fast
    let dist = this.cameraDistance;
    if (this.player.inVehicle && this.player.currentVehicle) {
      const speedNorm = Math.abs(this.player.currentVehicle.speed) / 35;
      dist = this.cameraDistance + speedNorm * 5.0;
    }
    
    const camY = target.y + Math.sin(this.cameraAngleX) * dist + 1.2;
    const horizontalDist = Math.cos(this.cameraAngleX) * dist;
    const camX = target.x - Math.sin(this.cameraAngleY) * horizontalDist;
    const camZ = target.z - Math.cos(this.cameraAngleY) * horizontalDist;
    
    // Smooth camera damping
    this.camera.position.x += (camX - this.camera.position.x) * 14 * delta;
    this.camera.position.y += (camY - this.camera.position.y) * 14 * delta;
    this.camera.position.z += (camZ - this.camera.position.z) * 14 * delta;
    
    const lookTarget = target.clone();
    lookTarget.y += 1.4;
    this.camera.lookAt(lookTarget);
  }
  
  renderMinimap() {
    if (!this.radarCtx) return;
    const ctx = this.radarCtx;
    const w = this.radarCanvas.width;
    const h = this.radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radarScale = 0.45; // meters to radar pixels
    
    // Clear radar background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#06b6d4';
    ctx.stroke();
    
    // Roads grid on radar
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 4;
    [-200, -100, 0, 100, 200].forEach(roadPos => {
      // Relative offset
      const ox = (roadPos - this.player.position.x) * radarScale;
      const oz = (roadPos - this.player.position.z) * radarScale;
      
      // Vertical road
      ctx.beginPath();
      ctx.moveTo(cx + ox, 0);
      ctx.lineTo(cx + ox, h);
      ctx.stroke();
      
      // Horizontal road
      ctx.beginPath();
      ctx.moveTo(0, cy + oz);
      ctx.lineTo(w, cy + oz);
      ctx.stroke();
    });
    
    // Draw Safehouse Icon (Green)
    const shX = cx + (this.city.safehouseLocation.x - this.player.position.x) * radarScale;
    const shZ = cy + (this.city.safehouseLocation.z - this.player.position.z) * radarScale;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(shX, shZ, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw Mission Marker (Yellow Pulse)
    if (this.missions.markerMesh && this.missions.markerMesh.visible) {
      const mPos = this.missions.markerMesh.position;
      const mX = cx + (mPos.x - this.player.position.x) * radarScale;
      const mZ = cy + (mPos.z - this.player.position.z) * radarScale;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(mX, mZ, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw Police Cars (Flashing Red)
    this.police.policeUnits.forEach(cop => {
      const pX = cx + (cop.position.x - this.player.position.x) * radarScale;
      const pZ = cy + (cop.position.z - this.player.position.z) * radarScale;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(pX, pZ, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw Player Dot & Heading Needle (Center)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Player Facing Triangle
    const heading = this.player.inVehicle && this.player.currentVehicle
      ? this.player.currentVehicle.rotationY
      : this.player.rotationY;
    
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(heading) * 12, cy + Math.cos(heading) * 12);
    ctx.lineTo(cx + Math.sin(heading + 2.5) * 6, cy + Math.cos(heading + 2.5) * 6);
    ctx.lineTo(cx + Math.sin(heading - 2.5) * 6, cy + Math.cos(heading - 2.5) * 6);
    ctx.closePath();
    ctx.fill();
  }
  
  updateHUD() {
    // Health bar
    const hpBar = document.getElementById('hud-hp-bar');
    if (hpBar) hpBar.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
    
    // Armor bar
    const armorBar = document.getElementById('hud-armor-bar');
    if (armorBar) armorBar.style.width = `${this.player.armor}%`;
    
    // Cash
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

// Boot the game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameApp();
  I18N.updateDOM();
});
