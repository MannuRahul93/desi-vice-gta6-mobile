// Mobile Virtual Joystick & Touch Controller + Desktop Keyboard Support
class InputController {
  constructor() {
    // Analog Stick Vector (-1.0 to 1.0)
    this.moveVector = new THREE.Vector2(0, 0);
    
    // Camera Orbit Delta
    this.cameraDelta = new THREE.Vector2(0, 0);
    
    // Action States
    this.isSprinting = false;
    this.isJumping = false;
    this.isPunching = false;
    this.isHandbrake = false;
    this.isNitro = false;
    this.interactPressed = false;
    
    // Joystick Touch Tracking
    this.stickTouchId = null;
    this.stickOrigin = { x: 0, y: 0 };
    this.stickRadius = 55;
    
    // Camera Touch Tracking
    this.cameraTouchId = null;
    this.cameraLastPos = { x: 0, y: 0 };
    
    // Keyboard State
    this.keys = {};
    
    this.initKeyboard();
    this.initTouchControls();
  }
  
  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyF' || e.code === 'Enter') {
        this.interactPressed = true;
      }
      if (e.code === 'KeyH') {
        AudioSys.playHorn();
      }
      if (e.code === 'KeyR') {
        AudioSys.toggleRadio();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'KeyF' || e.code === 'Enter') {
        this.interactPressed = false;
      }
    });
  }
  
  initTouchControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const stickNub = document.getElementById('joystick-nub');
    const touchCameraZone = document.getElementById('touch-camera-zone');
    
    if (!joystickZone || !stickNub) return;
    
    // --- JOYSTICK TOUCH EVENTS ---
    joystickZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.stickTouchId = touch.identifier;
      const rect = joystickZone.getBoundingClientRect();
      this.stickOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      this.handleJoystickMove(touch.clientX, touch.clientY, stickNub);
    }, { passive: false });
    
    window.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.stickTouchId) {
          e.preventDefault();
          this.handleJoystickMove(touch.clientX, touch.clientY, stickNub);
        } else if (touch.identifier === this.cameraTouchId) {
          e.preventDefault();
          const dx = touch.clientX - this.cameraLastPos.x;
          const dy = touch.clientY - this.cameraLastPos.y;
          this.cameraDelta.x += dx * 0.005;
          this.cameraDelta.y += dy * 0.005;
          this.cameraLastPos = { x: touch.clientX, y: touch.clientY };
        }
      }
    }, { passive: false });
    
    const endStick = (touchId) => {
      if (touchId === this.stickTouchId) {
        this.stickTouchId = null;
        this.moveVector.set(0, 0);
        stickNub.style.transform = `translate(0px, 0px)`;
      }
    };
    
    window.addEventListener('touchend', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        endStick(touch.identifier);
        if (touch.identifier === this.cameraTouchId) {
          this.cameraTouchId = null;
        }
      }
    });
    
    window.addEventListener('touchcancel', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        endStick(e.changedTouches[i].identifier);
      }
    });
    
    // --- CAMERA TOUCH SWIPE ZONE ---
    if (touchCameraZone) {
      touchCameraZone.addEventListener('touchstart', (e) => {
        if (this.cameraTouchId === null) {
          const touch = e.changedTouches[0];
          this.cameraTouchId = touch.identifier;
          this.cameraLastPos = { x: touch.clientX, y: touch.clientY };
        }
      });
    }
    
    // --- ONSCREEN BUTTON BINDS ---
    this.bindTouchButton('btn-drive', (down) => { if (down) this.interactPressed = true; });
    this.bindTouchButton('btn-punch', (down) => { this.isPunching = down; });
    this.bindTouchButton('btn-sprint', (down) => {
      this.isSprinting = down;
      this.isNitro = down;
    });
    this.bindTouchButton('btn-jump', (down) => {
      this.isJumping = down;
      this.isHandbrake = down;
    });
    this.bindTouchButton('btn-horn', (down) => { if (down) AudioSys.playHorn(); });
    this.bindTouchButton('btn-radio', (down) => { if (down) AudioSys.toggleRadio(); });
  }
  
  handleJoystickMove(clientX, clientY, stickNub) {
    let dx = clientX - this.stickOrigin.x;
    let dy = clientY - this.stickOrigin.y;
    const distance = Math.hypot(dx, dy);
    
    if (distance > this.stickRadius) {
      dx = (dx / distance) * this.stickRadius;
      dy = (dy / distance) * this.stickRadius;
    }
    
    stickNub.style.transform = `translate(${dx}px, ${dy}px)`;
    
    // Normalized move vector: X is steer/strafe, Y is forward/reverse
    this.moveVector.set(dx / this.stickRadius, -dy / this.stickRadius);
  }
  
  bindTouchButton(elementId, callback) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const handleDown = (e) => {
      e.preventDefault();
      el.classList.add('active');
      callback(true);
    };
    const handleUp = (e) => {
      e.preventDefault();
      el.classList.remove('active');
      callback(false);
    };
    
    el.addEventListener('touchstart', handleDown, { passive: false });
    el.addEventListener('touchend', handleUp, { passive: false });
    el.addEventListener('mousedown', handleDown);
    el.addEventListener('mouseup', handleUp);
  }
  
  update() {
    // Merge Keyboard inputs if keyboard is being used
    if (this.keys['KeyW'] || this.keys['ArrowUp']) this.moveVector.y = 1.0;
    else if (this.keys['KeyS'] || this.keys['ArrowDown']) this.moveVector.y = -1.0;
    else if (this.stickTouchId === null) this.moveVector.y = 0;
    
    if (this.keys['KeyD'] || this.keys['ArrowRight']) this.moveVector.x = 1.0;
    else if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.moveVector.x = -1.0;
    else if (this.stickTouchId === null) this.moveVector.x = 0;
    
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
      this.isSprinting = true;
      this.isNitro = true;
    }
    if (this.keys['Space']) {
      this.isJumping = true;
      this.isHandbrake = true;
    }
    if (this.keys['KeyE']) {
      this.isPunching = true;
    }
  }
  
  resetCameraDelta() {
    this.cameraDelta.set(0, 0);
  }
  
  consumeInteract() {
    const p = this.interactPressed;
    this.interactPressed = false;
    return p;
  }
}
