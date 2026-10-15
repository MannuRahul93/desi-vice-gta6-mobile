// Language and Localization Dictionary (Hindi & English)
const I18N = {
  currentLang: 'en', // 'en' or 'hi'
  
  translations: {
    en: {
      gameTitle: 'DESI VICE: MOBILE',
      tagline: 'Open World Mobile Action',
      play: 'PLAY NOW',
      settings: 'SETTINGS',
      language: 'LANGUAGE: ENGLISH',
      graphicsQuality: 'GRAPHICS',
      qualityLow: 'LOW (Smooth 60 FPS)',
      qualityMed: 'MEDIUM (Balanced)',
      qualityHigh: 'ULTRA (Realistic HD)',
      touchControls: 'Touch Controls Active',
      resume: 'RESUME',
      restart: 'RESPAWN',
      
      // HUD
      health: 'HEALTH',
      armor: 'ARMOR',
      cash: 'CASH',
      wanted: 'WANTED',
      speedUnit: 'KM/H',
      nitro: 'NITRO',
      
      // Action buttons
      btnDrive: 'DRIVE',
      btnExit: 'EXIT',
      btnPunch: 'PUNCH',
      btnSprint: 'SPRINT',
      btnJump: 'JUMP',
      btnBrake: 'DRIFT',
      btnHorn: 'HORN',
      btnNitro: 'NITRO',
      btnCam: 'CAM',
      btnRadio: 'RADIO',
      
      // Prompts & Tips
      nearCarPrompt: 'Tap [DRIVE] or press [F] to enter vehicle',
      copsChasing: 'POLICE ARE CHASING YOU! ESCAPE THE RADIUS!',
      copsLost: 'WANTED LEVEL EVADED!',
      missionPassed: 'MISSION PASSED!',
      missionFailed: 'BUSTED / WASTED!',
      reward: 'REWARD',
      
      // Missions
      mission1Title: 'Mission 1: The Vice Arrival',
      mission1Desc: 'Steal the Neon Supercar parked at the Plaza and deliver it to Tommy’s Safehouse docks!',
      mission1Step1: 'Find and steal the Supercar marked yellow on your radar.',
      mission1Step2: 'Drive to Tommy’s Safehouse docks before time runs out!',
      
      mission2Title: 'Mission 2: Police Evade',
      mission2Desc: 'The cops have spotted your illegal street racing! Lose the 2-star wanted level.',
      mission2Step1: 'Outrun the police patrol cars and stay out of their search radius!',
      
      mission3Title: 'Mission 3: Rooftop Stunt',
      mission3Desc: 'Hit the highway mega-ramp at 120+ KM/H with Nitro boost!',
      mission3Step1: 'Gain maximum speed on the main avenue and launch off the stunt ramp!',
      
      // Radio
      radioDesiBeats: 'Radio: Mumbai Heat 98.4 FM',
      radioViceSynth: 'Radio: Vice City Waves 105.2 FM',
      radioOff: 'Radio: OFF',
      
      // Dialogues
      dialogIntro: 'Welcome to Desi Vice City. Rule the streets, drive fast cars, and make your fortune.',
      dialogCarEnter: 'Nice ride! Let us see what this engine can do.',
      dialogCopAlert: 'Control, we have a suspect in a high-speed vehicle. Intercept immediately!'
    },
    
    hi: {
      gameTitle: 'देसी वाइस: मोबाइल',
      tagline: 'ओपन वर्ल्ड मोबाइल एक्शन',
      play: 'खेलें (PLAY)',
      settings: 'सेटिंग्स',
      language: 'भाषा: हिन्दी',
      graphicsQuality: 'ग्राफ़िक्स क्वालिटी',
      qualityLow: 'कम (सुपर स्मूथ 60 FPS)',
      qualityMed: 'मध्यम (संतुलित)',
      qualityHigh: 'उच्च (हाई डेफिनेशन HD)',
      touchControls: 'टच कंट्रोल्स सक्रिय',
      resume: 'जारी रखें',
      restart: 'पुनः शुरू करें',
      
      // HUD
      health: 'स्वास्थ्य',
      armor: 'कवच',
      cash: 'रुपये',
      wanted: 'वांछित (स्टार्स)',
      speedUnit: 'किमी/घंटा',
      nitro: 'नाइट्रो',
      
      // Action buttons
      btnDrive: 'चलाएं',
      btnExit: 'उतरें',
      btnPunch: 'मुक्का',
      btnSprint: 'दौड़ें',
      btnJump: 'कूदें',
      btnBrake: 'ड्रिफ्ट',
      btnHorn: 'हॉर्न',
      btnNitro: 'नाइट्रो',
      btnCam: 'कैमरा',
      btnRadio: 'रेडियो',
      
      // Prompts & Tips
      nearCarPrompt: 'गाड़ी में बैठने के लिए [चलाएं] दबाएं या [F] दबाएं',
      copsChasing: 'पुलिस आपके पीछे पड़ी है! जल्दी बचकर भागो!',
      copsLost: 'बधाई! पुलिस की पकड़ से बाहर निकल गए!',
      missionPassed: 'मिशन सफल!',
      missionFailed: 'पकड़े गए / खेल समाप्त!',
      reward: 'इनाम',
      
      // Missions
      mission1Title: 'मिशन 1: शहर में पहला कदम',
      mission1Desc: 'प्लाज़ा पर खड़ी नियॉन सुपरकार चुराएं और टॉमी के सेफहाउस डॉक पर सुरक्षित पहुंचाएं!',
      mission1Step1: 'रडार पर पीले निशान वाली सुपरकार ढूंढकर बैठें।',
      mission1Step2: 'समय समाप्त होने से पहले टॉमी के सेफहाउस तक गाड़ी पहुंचाएं!',
      
      mission2Title: 'मिशन 2: पुलिस की घेराबंदी',
      mission2Desc: 'सड़क पर तेज़ गाड़ी चलाने पर पुलिस अलर्ट हो गई है! पुलिस से बचकर निकलें।',
      mission2Step1: 'पुलिस गाड़ियों की रडार रेंज से बाहर निकलें और सुरक्षित छिपें!',
      
      mission3Title: 'मिशन 3: हवा में छलांग',
      mission3Desc: 'हाईवे के मेगा-रैंप पर नाइट्रो बूस्ट के साथ 120+ किमी/घंटा की रफ़्तार से कूदें!',
      mission3Step1: 'मुख्य सड़क पर पूरी रफ़्तार पकड़ें और स्टंट रैंप से उड़ें!',
      
      // Radio
      radioDesiBeats: 'रेडियो: मुंबई हीट 98.4 एफएम',
      radioViceSynth: 'रेडियो: वाइस सिटी वेव्स 105.2 एफएम',
      radioOff: 'रेडियो: बंद',
      
      // Dialogues
      dialogIntro: 'देसी वाइस सिटी में आपका स्वागत है। सड़कों पर राज करो, सुपरकार्स दौड़ाओ!',
      dialogCarEnter: 'शानदार गाड़ी है! अब दिखाते हैं इसकी असली रफ़्तार।',
      dialogCopAlert: 'कंट्रोल रूम, एक संदिग्ध तेज़ कार में भाग रहा है। तुरंत घेराबंदी करो!'
    }
  },
  
  t(key) {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    return this.translations['en'][key] || key;
  },
  
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLang = lang;
      this.updateDOM();
      return true;
    }
    return false;
  },
  
  toggleLanguage() {
    this.currentLang = (this.currentLang === 'en') ? 'hi' : 'en';
    this.updateDOM();
    return this.currentLang;
  },
  
  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    
    // Update dynamic button texts
    const langBadge = document.getElementById('btn-lang-toggle');
    if (langBadge) {
      langBadge.textContent = this.currentLang === 'en' ? '🇮🇳 हिंदी' : '🇬🇧 English';
    }
  }
};
