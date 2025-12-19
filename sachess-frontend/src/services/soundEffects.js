// Sound Effects Service for Chess Moves
class SoundEffects {
  constructor() {
    this.sounds = {
      move: null,
      capture: null,
      check: null,
      castle: null,
      promote: null,
      victory: null,
      defeat: null,
      draw: null,
      tick: null,
      lowTime: null,
      gameStart: null,
      gameEnd: null,
      illegal: null
    };
    
    this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
    
    this.loadSounds();
  }

  loadSounds() {
    // Create audio elements for each sound
    const soundFiles = {
      move: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Move.mp3',
      capture: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Capture.mp3',
      check: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Check.mp3',
      castle: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Castle.mp3',
      promote: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Promote.mp3',
      victory: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Victory.mp3',
      defeat: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Defeat.mp3',
      draw: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Draw.mp3',
      tick: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Tick.mp3',
      lowTime: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/LowTime.mp3',
      gameStart: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/GenericNotify.mp3',
      gameEnd: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/GenericNotify.mp3',
      illegal: 'https://raw.githubusercontent.com/ornicar/lila/master/public/sound/standard/Error.mp3'
    };

    // For development, use data URIs or local files
    const fallbackSounds = {
      move: this.createBeep(200, 50),
      capture: this.createBeep(150, 75),
      check: this.createBeep(400, 100),
      castle: this.createBeep(300, 100),
      promote: this.createBeep(500, 150),
      victory: this.createBeep(800, 200),
      defeat: this.createBeep(100, 200),
      draw: this.createBeep(250, 150),
      tick: this.createBeep(1000, 20),
      lowTime: this.createBeep(1500, 50),
      gameStart: this.createBeep(600, 100),
      gameEnd: this.createBeep(400, 150),
      illegal: this.createBeep(50, 100)
    };

    Object.keys(this.sounds).forEach(key => {
      const audio = new Audio();
      audio.volume = this.volume;
      audio.preload = 'auto';
      
      // Try to load from URL, fallback to generated sound
      audio.src = soundFiles[key];
      audio.onerror = () => {
        audio.src = fallbackSounds[key];
      };
      
      this.sounds[key] = audio;
    });
  }

  // Create a simple beep sound using Web Audio API
  createBeep(frequency, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    // Create a data URI from the generated sound
    // This is a simplified version - in production, use proper audio files
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGD0fPTgjMGHm7A7+OZURE';
  }

  play(soundType, moveData = null) {
    if (!this.enabled) return;
    
    let sound = soundType;
    
    // Determine sound based on move data
    if (moveData) {
      if (moveData.captured) sound = 'capture';
      else if (moveData.check) sound = 'check';
      else if (moveData.promotion) sound = 'promote';
      else if (moveData.castling) sound = 'castle';
      else sound = 'move';
    }
    
    if (this.sounds[sound]) {
      try {
        this.sounds[sound].currentTime = 0;
        this.sounds[sound].play().catch(e => {
          console.warn('Failed to play sound:', e);
        });
      } catch (error) {
        console.warn('Sound playback error:', error);
      }
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.volume.toString());
    
    Object.values(this.sounds).forEach(audio => {
      if (audio) audio.volume = this.volume;
    });
  }

  playMoveSound(move) {
    this.play('move', move);
  }

  playCheckSound() {
    this.play('check');
  }

  playCaptureSound() {
    this.play('capture');
  }

  playGameStartSound() {
    this.play('gameStart');
  }

  playGameEndSound(result) {
    if (result === 'victory') {
      this.play('victory');
    } else if (result === 'defeat') {
      this.play('defeat');
    } else {
      this.play('draw');
    }
  }

  playTickSound() {
    this.play('tick');
  }

  playLowTimeSound() {
    this.play('lowTime');
  }

  playIllegalMoveSound() {
    this.play('illegal');
  }
}

// Singleton instance
let soundInstance = null;

export const getSoundEffects = () => {
  if (!soundInstance) {
    soundInstance = new SoundEffects();
  }
  return soundInstance;
};

export default SoundEffects;
