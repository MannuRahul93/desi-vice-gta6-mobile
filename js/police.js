// Police AI & Wanted Level System (1 - 5 Stars)
class PoliceSystem {
  constructor(scene, city) {
    this.scene = scene;
    this.city = city;
    this.wantedLevel = 0; // 0 to 5 stars
    this.evadeTimer = 0;
    this.policeUnits = []; // Active police cruisers
    this.maxPolice = 3;
    this.lastVoiceTime = 0;
  }
  
  setWantedLevel(level) {
    const oldLevel = this.wantedLevel;
    this.wantedLevel = Math.max(0, Math.min(5, level));
    
    if (this.wantedLevel > 0 && oldLevel === 0) {
      AudioSys.startPoliceSiren();
      // Voice alert
      if (Date.now() - this.lastVoiceTime > 8000) {
        AudioSys.speak(I18N.t('dialogCopAlert'), I18N.currentLang);
        this.lastVoiceTime = Date.now();
      }
    } else if (this.wantedLevel === 0 && oldLevel > 0) {
      AudioSys.stopPoliceSiren();
    }
    
    this.updateHUD();
  }
  
  addCrime(amount = 1) {
    this.setWantedLevel(this.wantedLevel + amount);
    this.evadeTimer = 0;
  }
  
  update(delta, playerPos) {
    // If wanted, manage police cruisers chase AI
    if (this.wantedLevel > 0) {
      const desiredUnits = Math.min(this.wantedLevel, this.maxPolice);
      
      // Spawn new police car if needed
      if (this.policeUnits.length < desiredUnits) {
        this.spawnPoliceCruiser(playerPos);
      }
      
      let closestCopDist = Infinity;
      
      // Update each police cruiser AI
      for (let i = this.policeUnits.length - 1; i >= 0; i--) {
        const cop = this.policeUnits[i];
        const distToPlayer = cop.position.distanceTo(playerPos);
        if (distToPlayer < closestCopDist) closestCopDist = distToPlayer;
        
        // AI Steering toward player
        const dx = playerPos.x - cop.position.x;
        const dz = playerPos.z - cop.position.z;
        const targetAngle = Math.atan2(dx, dz);
        
        let angleDiff = targetAngle - cop.rotationY;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        
        const steerInput = Math.max(-1, Math.min(1, angleDiff * 2.0));
        const throttleInput = distToPlayer > 8 ? 0.95 : 0.3; // Ram or box in
        
        cop.driver = true;
        cop.update(delta, throttleInput, steerInput, false, this.wantedLevel >= 3);
        
        // Ramming damage to player if close
        if (distToPlayer < 3.2 && cop.speed > 8) {
          AudioSys.playPunch();
        }
      }
      
      // Evade logic (Lose cops if far enough away)
      if (closestCopDist > 85) {
        this.evadeTimer += delta;
        if (this.evadeTimer > 10) {
          this.setWantedLevel(this.wantedLevel - 1);
          this.evadeTimer = 0;
        }
      } else {
        this.evadeTimer = 0;
      }
    } else {
      // Remove police units smoothly if peaceful
      if (this.policeUnits.length > 0) {
        this.policeUnits.forEach(u => this.scene.remove(u.mesh));
        this.policeUnits = [];
      }
    }
  }
  
  spawnPoliceCruiser(playerPos) {
    // Spawn 80m behind or in front of player
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = 70 + Math.random() * 25;
    const spawnPos = new THREE.Vector3(
      playerPos.x + Math.sin(spawnAngle) * spawnDist,
      0,
      playerPos.z + Math.cos(spawnAngle) * spawnDist
    );
    
    // Bounds check
    spawnPos.x = Math.max(-260, Math.min(260, spawnPos.x));
    spawnPos.z = Math.max(-260, Math.min(260, spawnPos.z));
    
    const copCar = new Vehicle(this.scene, 'police', spawnPos);
    copCar.rotationY = spawnAngle + Math.PI; // Face towards player
    this.policeUnits.push(copCar);
  }
  
  updateHUD() {
    const starContainer = document.getElementById('wanted-stars');
    if (!starContainer) return;
    
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= this.wantedLevel) {
        html += '<span class="star active">★</span>';
      } else {
        html += '<span class="star">☆</span>';
      }
    }
    starContainer.innerHTML = html;
  }
}
