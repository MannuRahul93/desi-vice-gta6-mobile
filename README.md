# 🚗 DESI VICE: MOBILE (GTA 6 STYLE OPEN-WORLD GAME)
### Hindi & English Bilingual | Optimized for Low-Configuration Mobile Devices (60 FPS on 2GB+ RAM)

---

## 🌟 Game Overview

**Desi Vice: Mobile** is a full 3D open-world action-adventure game inspired by the GTA 6 aesthetics, built from the ground up to run smoothly on **low-end mobile devices** (2GB / 3GB RAM smartphones) directly in mobile browsers or packaged into an Android APK.

### 🔑 Key Highlights:
1. **Low Configuration Mobile Optimization**:
   - WebGL 3D rendering with low draw-calls and combined batching.
   - 3 Graphics Quality Presets: **Low (60 FPS on 2GB RAM phones)**, **Medium (Balanced)**, and **Ultra HD**.
   - Zero bulky external asset downloads — procedural textures, audio synthesizers, and lighting.
2. **Realistic Character & Vehicle Mechanics**:
   - Articulated 3D humanoid character with procedural walking, running, jumping, punching, and ragdoll response.
   - Drivable **Hyper GT Supercars**, **Desi Muscular SUVs**, and **Police Cruisers**.
   - Realistic vehicle physics: drifting, tire smoke, steering angles, suspension pitch, headlights, and rechargeable **Nitro Boost**.
3. **Dual Language Support (हिन्दी + English)**:
   - Instant language switcher toggle on screen at any time.
   - All HUD elements, mission descriptions, subtitles, tutorial prompts, and radio chatter available in both **Hindi** and **English**.
   - Text-to-Speech audio cues for mission instructions and police radio in both languages!
4. **GTA Open-World Systems**:
   - **Minimap / GPS Radar**: Rotating circular radar showing player direction, nearby vehicles, mission waypoints, and police alerts.
   - **Wanted Level System (1 to 5 Stars ⭐⭐⭐⭐⭐)**: Police sirens, pursuit cruisers, aggressive flanking, and evasion cool-down radius.
   - **Mission Progression**: Story missions with cash rewards (delivering stolen supercars to Tommy's Safehouse docks, police evasions, rooftop stunt jumps).
   - **Web Audio Sound Synthesizer**: Interactive engine RPM pitch, drifting tire screeches, horns, sirens, and 2 procedural radio stations (*Mumbai Heat 98.4 FM* & *Vice City Waves*).

---

## 🚀 How to Run and Play

### 1. Instant Play on Local PC Browser:
Open your browser and navigate to:
```
http://localhost:3000
```

### 2. Play on Your Mobile Phone (Android / iPhone):
Make sure your phone is connected to the same Wi-Fi network as this computer, then open Chrome or Safari on your phone and go to:
```
http://192.168.1.13:3000
```
> **Tip for Fullscreen App Mode**: On Android Chrome, tap the 3 dots menu and select **"Add to Home Screen"** / **"Install App"**. It will launch like a native mobile game with no browser borders!

---

## 🎮 Controls

### 📱 Mobile Touch Controls:
- **Left Thumb (Virtual Joystick)**: Walk, run, and steer vehicles with 360° analog precision.
- **Right Thumb (Swipe Zone)**: Touch and drag anywhere on the right screen half to rotate the camera.
- **[🚗 DRIVE / EXIT]**: Glows when near a car. Tap to get in or get out of any vehicle.
- **[⚡ SPRINT / NITRO]**: Hold on foot to sprint; hold while driving for Nitro speed boost!
- **[🦘 JUMP / DRIFT]**: Jump on foot; handbrake drift around corners while driving.
- **[👊 PUNCH]**: Punch pedestrians or defend yourself.
- **[📢 HORN]**: Honk vehicle dual-tone horn.
- **[📻 RADIO]**: Switch radio stations (*Desi Beats*, *Synthwave*, *Off*).
- **[📷 CAM]**: Cycle camera zoom distance.
- **[🇮🇳 हिंदी / 🇬🇧 EN]**: Toggle language between Hindi and English instantly.

### 💻 Desktop Keyboard & Mouse:
| Action | Key |
|---|---|
| Move / Steer | **W, A, S, D** or **Arrow Keys** |
| Sprint / Nitro | **Shift** |
| Jump / Handbrake | **Space** |
| Enter / Exit Car | **F** or **Enter** |
| Punch / Attack | **E** or **Left Click** |
| Car Horn | **H** |
| Radio Station | **R** |
| Camera Switch | **C** |

---

## 📦 Converting to Native Android APK

To package this into an installable `.apk` for Android using **Capacitor**:
1. Open terminal inside `gta-mobile-game`:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init "Desi Vice" com.desivice.game --web-dir .
   npx cap add android
   npx cap open android
   ```
2. In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Transfer the generated `app-debug.apk` to any Android phone and install!

---

## 📂 Project Architecture

```
gta-mobile-game/
├── index.html          # Responsive Mobile Viewport, HUD & Touch UI
├── style.css           # Vice Neon Design, Responsive Touch Buttons, Radar
├── manifest.json       # PWA Web App Manifest (Landscape Fullscreen)
├── package.json        # Node configuration
├── server.js           # Local HTTP Server (LAN accessible)
└── js/
    ├── three.min.js    # Three.js 3D Engine Library
    ├── i18n.js         # Hindi & English Dictionary & DOM Localizer
    ├── audio.js        # Web Audio Engine (V8 Engine, Siren, Drift, Radio, Speech)
    ├── character.js    # Humanoid Character Rig & Procedural Animations
    ├── vehicles.js     # Supercars, SUVs, Police Cruiser & Drift Physics
    ├── city.js         # Open-World City Grid, Skyscrapers, Ramps, Safehouse
    ├── police.js       # Wanted Level (1-5 Stars) & Police AI Pursuit
    ├── traffic.js      # Ambient Pedestrians & Traffic Simulation
    ├── missions.js     # Mission Objectives, Safehouse Delivery, Stunts
    ├── controls.js     # Touch Joystick & Multi-Touch Event System
    └── main.js         # Core Game Loop, Minimap Radar & Camera Damping
```
