// Mission System with Waypoints, Dialogues & Cash Rewards
class MissionManager {
  constructor(scene, player, city, police) {
    this.scene = scene;
    this.player = player;
    this.city = city;
    this.police = police;
    
    this.activeMissionId = 1;
    this.stage = 0;
    this.timer = 0;
    this.targetVehicle = null;
    this.targetPoint = null;
    this.isCompleted = false;
    
    // 3D Mission Marker Beacon
    this.markerMesh = null;
    this.buildMarker();
    
    this.startMission(1);
  }
  
  buildMarker() {
    const group = new THREE.Group();
    
    // Outer floating cylinder beacon
    const cylGeo = new THREE.CylinderGeometry(3.0, 3.0, 0.45, 24);
    const cylMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.75 });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    group.add(cyl);
    
    // Glowing diamond crest
    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2, 0),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    diamond.position.y = 3.5;
    group.add(diamond);
    
    // Vertical beam of light
    const beamGeo = new THREE.CylinderGeometry(0.35, 0.35, 60, 12);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.4 });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 30;
    group.add(beam);
    
    this.markerMesh = group;
    this.markerMesh.visible = false;
    this.scene.add(this.markerMesh);
  }
  
  startMission(id) {
    this.activeMissionId = id;
    this.stage = 1;
    this.isCompleted = false;
    
    if (id === 1) {
      // Mission 1: Steal the Supercar and deliver to safehouse
      this.timer = 90;
      
      // Spawn mission car at Central Plaza (20, 0, 30)
      this.targetVehicle = new Vehicle(this.scene, 'supercar', new THREE.Vector3(20, 0, 30));
      this.setMarker(new THREE.Vector3(20, 0, 30));
      
      this.showMissionDialog(I18N.t('mission1Title'), I18N.t('mission1Step1'));
      AudioSys.speak(I18N.t('mission1Step1'), I18N.currentLang);
    } else if (id === 2) {
      // Mission 2: Evade Police
      this.stage = 1;
      this.police.setWantedLevel(2);
      this.setMarker(null);
      this.showMissionDialog(I18N.t('mission2Title'), I18N.t('mission2Step1'));
      AudioSys.speak(I18N.t('mission2Step1'), I18N.currentLang);
    } else if (id === 3) {
      // Mission 3: Mega Stunt Jump
      const rampLoc = this.city.ramps[0].pos;
      this.setMarker(new THREE.Vector3(rampLoc.x, 0, rampLoc.z));
      this.showMissionDialog(I18N.t('mission3Title'), I18N.t('mission3Step1'));
      AudioSys.speak(I18N.t('mission3Step1'), I18N.currentLang);
    }
  }
  
  setMarker(pos) {
    if (pos) {
      this.targetPoint = pos.clone();
      this.markerMesh.position.copy(pos);
      this.markerMesh.visible = true;
    } else {
      this.targetPoint = null;
      this.markerMesh.visible = false;
    }
  }
  
  update(delta, playerPos, playerInVehicle) {
    if (this.isCompleted) return;
    
    // Animate marker spin & bob
    if (this.markerMesh.visible) {
      this.markerMesh.rotation.y += delta * 2.2;
      this.markerMesh.position.y = Math.sin(Date.now() / 250) * 0.35;
    }
    
    // Mission 1 Logic
    if (this.activeMissionId === 1) {
      if (this.stage === 1) {
        if (playerInVehicle && this.player.currentVehicle === this.targetVehicle) {
          this.stage = 2;
          this.setMarker(this.city.safehouseLocation);
          this.showMissionDialog(I18N.t('mission1Title'), I18N.t('mission1Step2'));
          AudioSys.speak(I18N.t('mission1Step2'), I18N.currentLang);
        }
      } else if (this.stage === 2) {
        this.timer -= delta;
        this.updateTimerHUD(Math.ceil(this.timer));
        
        const dist = playerPos.distanceTo(this.city.safehouseLocation);
        if (dist < 14.0) {
          this.completeMission(5000);
        } else if (this.timer <= 0) {
          this.failMission();
        }
      }
    }
    
    // Mission 2 Logic (Evade Wanted Level)
    else if (this.activeMissionId === 2) {
      if (this.police.wantedLevel === 0) {
        this.completeMission(8000);
      }
    }
    
    // Mission 3 Logic (Stunt Ramp Jump at 110+ km/h)
    else if (this.activeMissionId === 3) {
      const rampLoc = this.city.ramps[0].pos;
      const distToRamp = playerPos.distanceTo(new THREE.Vector3(rampLoc.x, 0, rampLoc.z));
      if (playerInVehicle && distToRamp < 16 && this.player.currentVehicle.getSpeedKmh() > 95) {
        this.completeMission(12000);
      }
    }
  }
  
  completeMission(rewardCash) {
    this.isCompleted = true;
    this.setMarker(null);
    this.player.cash += rewardCash;
    
    const banner = document.getElementById('mission-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="banner-title">${I18N.t('missionPassed')}</div>
        <div class="banner-sub">+₹${rewardCash.toLocaleString()} ${I18N.t('reward')}</div>
      `;
      banner.style.display = 'block';
      setTimeout(() => { banner.style.display = 'none'; }, 4000);
    }
    
    AudioSys.speak(`${I18N.t('missionPassed')} +₹${rewardCash}`, I18N.currentLang);
    
    setTimeout(() => {
      let nextId = this.activeMissionId + 1;
      if (nextId > 3) nextId = 1;
      this.startMission(nextId);
    }, 5000);
  }
  
  failMission() {
    this.isCompleted = true;
    const banner = document.getElementById('mission-banner');
    if (banner) {
      banner.innerHTML = `<div class="banner-title fail">${I18N.t('missionFailed')}</div>`;
      banner.style.display = 'block';
      setTimeout(() => { banner.style.display = 'none'; }, 3000);
    }
    setTimeout(() => {
      this.startMission(this.activeMissionId);
    }, 4000);
  }
  
  showMissionDialog(title, text) {
    const titleEl = document.getElementById('mission-title');
    const descEl = document.getElementById('mission-desc');
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = text;
    
    const promptEl = document.getElementById('mission-card');
    if (promptEl) {
      promptEl.style.display = 'block';
    }
  }
  
  updateTimerHUD(seconds) {
    const timerEl = document.getElementById('mission-timer');
    if (timerEl) {
      if (seconds > 0) {
        timerEl.textContent = `⏱️ ${seconds}s`;
        timerEl.style.display = 'block';
      } else {
        timerEl.style.display = 'none';
      }
    }
  }
}
