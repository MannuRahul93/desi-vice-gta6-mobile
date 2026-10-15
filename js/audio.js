// Procedural Web Audio Engine & Speech Voice System
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.initialized = false;
    this.muted = false;
    
    // Engine sound state
    this.engineOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.isPlayingEngine = false;
    
    // Siren sound state
    this.sirenOsc = null;
    this.sirenGain = null;
    this.sirenTimer = null;
    this.isSirenPlaying = false;
    
    // Radio music state
    this.radioChannel = 0; // 0 = off, 1 = Desi Beats, 2 = Synthwave
    this.radioTimer = null;
  }
  
  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }
  
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  
  startEngine() {
    if (!this.initialized || this.muted) return;
    this.resume();
    if (this.isPlayingEngine) return;
    
    try {
      const t = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(45, t); // Idle RPM
      
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(260, t);
      this.engineFilter.Q.setValueAtTime(3.0, t);
      
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, t);
      
      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      
      this.engineOsc.start(t);
      this.isPlayingEngine = true;
    } catch (e) {
      console.warn('Engine sound error:', e);
    }
  }
  
  updateEngineRPM(speedNormalized, isAccelerating) {
    if (!this.isPlayingEngine || !this.engineOsc || this.muted) return;
    try {
      const t = this.ctx.currentTime;
      // Idle 45Hz up to 220Hz redline
      const targetFreq = 48 + (speedNormalized * 160) + (isAccelerating ? 25 : 0);
      const targetFilter = 220 + (speedNormalized * 700) + (isAccelerating ? 150 : 0);
      const targetGain = 0.06 + (speedNormalized * 0.08) + (isAccelerating ? 0.04 : 0);
      
      this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.08);
      this.engineFilter.frequency.setTargetAtTime(targetFilter, t, 0.08);
      this.engineGain.gain.setTargetAtTime(targetGain, t, 0.08);
    } catch (e) {}
  }
  
  stopEngine() {
    if (!this.isPlayingEngine) return;
    try {
      if (this.engineGain) {
        this.engineGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      }
      setTimeout(() => {
        if (this.engineOsc) {
          this.engineOsc.stop();
          this.engineOsc.disconnect();
          this.engineOsc = null;
        }
        this.isPlayingEngine = false;
      }, 250);
    } catch (e) {
      this.isPlayingEngine = false;
    }
  }
  
  playTireScreech() {
    if (!this.initialized || this.muted) return;
    this.resume();
    try {
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(5.0, this.ctx.currentTime);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }
  
  playHorn() {
    if (!this.initialized || this.muted) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;
      [340, 410].forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    } catch (e) {}
  }
  
  startPoliceSiren() {
    if (!this.initialized || this.muted || this.isSirenPlaying) return;
    this.resume();
    try {
      this.isSirenPlaying = true;
      let toggle = false;
      
      const playChirp = () => {
        if (!this.isSirenPlaying) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        
        const f1 = toggle ? 720 : 960;
        const f2 = toggle ? 960 : 720;
        toggle = !toggle;
        
        osc.frequency.setValueAtTime(f1, t);
        osc.frequency.linearRampToValueAtTime(f2, t + 0.4);
        
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
        
        this.sirenTimer = setTimeout(playChirp, 420);
      };
      playChirp();
    } catch (e) {}
  }
  
  stopPoliceSiren() {
    this.isSirenPlaying = false;
    if (this.sirenTimer) {
      clearTimeout(this.sirenTimer);
      this.sirenTimer = null;
    }
  }
  
  playPunch() {
    if (!this.initialized || this.muted) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }
  
  playNitro() {
    if (!this.initialized || this.muted) return;
    this.resume();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(480, t + 0.4);
      
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.5);
    } catch (e) {}
  }
  
  toggleRadio() {
    this.radioChannel = (this.radioChannel + 1) % 3;
    if (this.radioChannel === 0) {
      this.stopRadio();
      return I18N.t('radioOff');
    } else if (this.radioChannel === 1) {
      this.startRadioDesiBeats();
      return I18N.t('radioDesiBeats');
    } else {
      this.startRadioSynthwave();
      return I18N.t('radioViceSynth');
    }
  }
  
  stopRadio() {
    if (this.radioTimer) {
      clearInterval(this.radioTimer);
      this.radioTimer = null;
    }
  }
  
  startRadioDesiBeats() {
    this.stopRadio();
    if (!this.initialized || this.muted) return;
    this.resume();
    
    // Fun rhythmic electronic beat pattern
    const scale = [110, 130.81, 146.83, 164.81, 196.00]; // Pentatonic bass
    let step = 0;
    
    this.radioTimer = setInterval(() => {
      if (this.radioChannel !== 1) return;
      const t = this.ctx.currentTime;
      const note = scale[step % scale.length];
      
      // Bass note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
      
      // Hi-hat click
      if (step % 2 === 1) {
        const click = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        click.type = 'square';
        click.frequency.setValueAtTime(1400, t);
        clickGain.gain.setValueAtTime(0.03, t);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        click.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        click.start(t);
        click.stop(t + 0.05);
      }
      
      step++;
    }, 220);
  }
  
  startRadioSynthwave() {
    this.stopRadio();
    if (!this.initialized || this.muted) return;
    this.resume();
    
    // 80s Miami Synth bass
    const chords = [82.4, 98.0, 110.0, 73.4];
    let chordIdx = 0;
    
    this.radioTimer = setInterval(() => {
      if (this.radioChannel !== 2) return;
      const t = this.ctx.currentTime;
      const root = chords[chordIdx % chords.length];
      
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(root, t);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.35);
      
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.35);
      
      chordIdx++;
    }, 280);
  }
  
  // Voice Speech Announcements in Hindi & English
  speak(text, lang = 'hi') {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }
}

const AudioSys = new SoundEngine();
