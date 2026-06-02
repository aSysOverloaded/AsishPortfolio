/* ==========================================================================
   PROGRAMMATIC WEB AUDIO SYSTEM: CAPTAIN CLAW SOUND SYSTEM (TS VERSION)
   ========================================================================== */

interface NoteScore {
  note: string;
  dur: number;
}

class SoundSystem {
  private ctx: AudioContext | null = null;
  public musicEnabled = false;
  public sfxEnabled = true;
  private shantyTimeout: ReturnType<typeof setTimeout> | null = null;
  
  private masterVolume: GainNode | null = null;
  private musicVolume: GainNode | null = null;
  private sfxVolume: GainNode | null = null;

  private shantyMelody: NoteScore[] = [
    // Phrase 1
    { note: "A3", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "D4", dur: 0.4 },
    { note: "F4", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "F4", dur: 0.4 }, { note: "A4", dur: 0.4 },
    { note: "G4", dur: 0.4 }, { note: "C4", dur: 0.4 }, { note: "C4", dur: 0.4 }, { note: "C4", dur: 0.4 },
    { note: "E4", dur: 0.4 }, { note: "C4", dur: 0.4 }, { note: "E4", dur: 0.4 }, { note: "G4", dur: 0.4 },
    // Phrase 2
    { note: "A3", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "D4", dur: 0.4 },
    { note: "F4", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "F4", dur: 0.4 }, { note: "A4", dur: 0.4 },
    { note: "G4", dur: 0.4 }, { note: "A4", dur: 0.4 }, { note: "F4", dur: 0.4 }, { note: "E4", dur: 0.4 },
    { note: "D4", dur: 0.8 }, { note: "rest", dur: 0.4 },
    // Chorus
    { note: "F4", dur: 0.4 }, { note: "A4", dur: 0.8 }, { note: "A4", dur: 0.4 }, { note: "A4", dur: 0.4 },
    { note: "F4", dur: 0.4 }, { note: "A4", dur: 0.4 }, { note: "A4", dur: 0.4 }, { note: "F4", dur: 0.4 },
    { note: "E4", dur: 0.4 }, { note: "G4", dur: 0.8 }, { note: "G4", dur: 0.4 }, { note: "G4", dur: 0.4 },
    { note: "E4", dur: 0.4 }, { note: "G4", dur: 0.4 }, { note: "G4", dur: 0.4 }, { note: "E4", dur: 0.4 },
    // Phrase 2 repeat for chorus end
    { note: "A3", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "D4", dur: 0.4 },
    { note: "F4", dur: 0.4 }, { note: "D4", dur: 0.4 }, { note: "F4", dur: 0.4 }, { note: "A4", dur: 0.4 },
    { note: "G4", dur: 0.4 }, { note: "A4", dur: 0.4 }, { note: "F4", dur: 0.4 }, { note: "E4", dur: 0.4 },
    { note: "D4", dur: 0.8 }, { note: "rest", dur: 0.8 }
  ];

  private notesFreqs: Record<string, number> = {
    "rest": 0,
    "A3": 220.00, "B3": 246.94,
    "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
    "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77,
    "C6": 1046.50, "D6": 1174.66, "E6": 1318.51
  };

  private melodyIndex = 0;

  // Initialize Audio safely
  public init() {
    if (this.ctx) return;
    
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.ctx = new AudioContextClass();
    
    this.masterVolume = this.ctx.createGain();
    this.musicVolume = this.ctx.createGain();
    this.sfxVolume = this.ctx.createGain();
    
    this.masterVolume.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.musicVolume.gain.setValueAtTime(0.18, this.ctx.currentTime); // keep music quiet
    this.sfxVolume.gain.setValueAtTime(0.35, this.ctx.currentTime);
    
    this.masterVolume.connect(this.ctx.destination);
    this.musicVolume.connect(this.masterVolume);
    this.sfxVolume.connect(this.masterVolume);
  }

  public resumeContext() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  private playOscillator(freq: number, type: OscillatorType, duration: number, gainNode: GainNode, attack = 0.02) {
    if (!this.ctx) return;
    this.resumeContext();

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    noteGain.gain.setValueAtTime(0, this.ctx.currentTime);
    noteGain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + attack);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(noteGain);
    noteGain.connect(gainNode);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 1. Synthesize Retro Jump Sound (Rising Sine Wave)
  public playJump() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxVolume) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.15);

    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.sfxVolume);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // 2. Synthesize Retro Coin Pickup Chime
  public playCoin() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxVolume) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";

    // Standard chime arpeggio: B5 (987.77 Hz) to E6 (1318.51 Hz)
    osc1.frequency.setValueAtTime(987.77, now);
    osc1.frequency.setValueAtTime(1318.51, now + 0.08);

    osc2.frequency.setValueAtTime(987.77 * 1.5, now);
    osc2.frequency.setValueAtTime(1318.51 * 1.5, now + 0.08);

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.setValueAtTime(0.3, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.sfxVolume);

    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  // 3. Synthesize Retro Chest Fanfare
  public playChestFanfare() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxVolume) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const notes = ["C4", "E4", "G4", "C5", "E5", "G5", "C6"];
    const speeds = 0.07;

    notes.forEach((note, index) => {
      if (!this.ctx || !this.sfxVolume) return;
      
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(this.notesFreqs[note], now + (index * speeds));
      
      gainNode.gain.setValueAtTime(0.35, now + (index * speeds));
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + (index * speeds) + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(this.sfxVolume);
      
      osc.start(now + (index * speeds));
      osc.stop(now + (index * speeds) + 0.26);
    });
  }

  // 4. Synthesize Hurt / Fall sound (Sawtooth sweep)
  public playHurt() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxVolume) return;
    this.resumeContext();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.3);

    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gainNode);
    gainNode.connect(this.sfxVolume);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // 5. Looping Background Shanty
  public playShantyLoop() {
    if (!this.musicEnabled || !this.ctx || !this.musicVolume) return;

    const playNextNote = () => {
      if (!this.musicEnabled || !this.ctx || !this.musicVolume) return;
      this.resumeContext();

      const item = this.shantyMelody[this.melodyIndex];
      const freq = this.notesFreqs[item.note];
      const dur = item.dur;

      if (freq > 0) {
        this.playOscillator(freq, "triangle", dur - 0.05, this.musicVolume, 0.01);
        
        const rootLetter = item.note.charAt(0);
        const rootOctave = parseInt(item.note.charAt(1));
        if (!isNaN(rootOctave)) {
          const rootNoteName = `${rootLetter}${rootOctave - 1}`;
          const backingFreq = this.notesFreqs[rootNoteName];
          if (backingFreq > 0) {
            this.playOscillator(backingFreq, "square", dur - 0.1, this.musicVolume, 0.02);
          }
        }
      }

      this.melodyIndex = (this.melodyIndex + 1) % this.shantyMelody.length;
      this.shantyTimeout = setTimeout(playNextNote, dur * 1000);
    };

    playNextNote();
  }

  public stopShantyLoop() {
    if (this.shantyTimeout) {
      clearTimeout(this.shantyTimeout);
      this.shantyTimeout = null;
    }
  }

  // Toggle controls
  public toggleMusic(forceState: boolean | null = null): boolean {
    this.musicEnabled = forceState !== null ? forceState : !this.musicEnabled;
    this.init();
    
    if (this.musicEnabled) {
      this.stopShantyLoop();
      this.melodyIndex = 0;
      this.playShantyLoop();
    } else {
      this.stopShantyLoop();
    }
    return this.musicEnabled;
  }

  public toggleSFX(forceState: boolean | null = null): boolean {
    this.sfxEnabled = forceState !== null ? forceState : !this.sfxEnabled;
    this.init();
    return this.sfxEnabled;
  }
}

export const Sound = new SoundSystem();
