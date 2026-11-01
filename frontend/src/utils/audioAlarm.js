/**
 * SAHELI — Audio Distress Siren Utility
 * Generates client-side distress siren using the standard Web Audio API.
 * No external mp3 or audio file dependencies required.
 */

let audioCtx = null;
let oscillator = null;
let gainNode = null;
let sirenInterval = null;

export const audioAlarm = {
  isPlaying: false,

  start() {
    if (this.isPlaying) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      audioCtx = new AudioContext();
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();

      let freq = 800;
      let rising = true;

      sirenInterval = setInterval(() => {
        if (!audioCtx || !oscillator) return;
        if (rising) {
          freq += 60;
          if (freq >= 1250) rising = false;
        } else {
          freq -= 60;
          if (freq <= 750) rising = true;
        }
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      }, 40);

      this.isPlaying = true;
    } catch {
      // Audio context restricted or unavailable
    }
  },

  stop() {
    try {
      if (sirenInterval) {
        clearInterval(sirenInterval);
        sirenInterval = null;
      }
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
      }
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    } catch {
      // Ignore cleanup error
    } finally {
      this.isPlaying = false;
    }
  },

  toggle() {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  },
};
