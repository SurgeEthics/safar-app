/**
 * Web Audio API based sound synthesizer for Safar app.
 * Configured for maximum volume, clarity, and piercing auditory presence
 * even in noisy roadside/outdoor traffic environments for drivers and passengers.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Create dynamic compressor + master gain for maximum perceived loudness without distortion
        try {
          this.compressor = this.ctx.createDynamicsCompressor();
          this.compressor.threshold.setValueAtTime(-6, this.ctx.currentTime);
          this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
          this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
          this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
          this.compressor.release.setValueAtTime(0.2, this.ctx.currentTime);

          this.masterGain = this.ctx.createGain();
          // Maximum safe volume boost (1.0 full scale)
          this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

          this.compressor.connect(this.masterGain);
          this.masterGain.connect(this.ctx.destination);
        } catch {
          // Fallback if compressor creation fails
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private getDestinationNode(ctx: AudioContext): AudioNode {
    return this.compressor || ctx.destination;
  }

  /**
   * Safe mobile vibration helper (works on Android Chrome / PWA).
   */
  private triggerVibration(pattern: number[]) {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration error if not supported/permitted
    }
  }

  /**
   * Driver incoming ride request alert siren/chime.
   * Maximized for extreme clarity and loudness so motorcycle/auto drivers can hear it over traffic!
   * Alternates punchy dual-tones (880Hz -> 1318Hz -> 1046Hz) with rich harmonic overtone mix.
   */
  playIncomingRideAlert() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const targetNode = this.getDestinationNode(ctx);

      // Strong haptic vibration for mobile driver
      this.triggerVibration([400, 150, 400, 150, 500]);

      // 4 rapid, high-energy alarm pulses (Taxi Dispatch Alarm pattern)
      const pulses = [
        { freq1: 880, freq2: 1318.5, delay: 0 },
        { freq1: 1046.5, freq2: 1567.98, delay: 0.16 },
        { freq1: 880, freq2: 1318.5, delay: 0.32 },
        { freq1: 1174.66, freq2: 1760, delay: 0.48 }
      ];

      pulses.forEach(({ freq1, freq2, delay }) => {
        const startTime = now + delay;
        const dur = 0.14;

        // Primary tone: loud triangle wave (cuts through traffic noise with rich odd harmonics)
        const oscPrimary = ctx.createOscillator();
        const gainPrimary = ctx.createGain();
        oscPrimary.type = 'triangle';
        oscPrimary.frequency.setValueAtTime(freq1, startTime);
        gainPrimary.gain.setValueAtTime(0.95, startTime);
        gainPrimary.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
        oscPrimary.connect(gainPrimary);
        gainPrimary.connect(targetNode);
        oscPrimary.start(startTime);
        oscPrimary.stop(startTime + dur);

        // Secondary ringing overtone (sine wave for bright, piercing bell attack)
        const oscBell = ctx.createOscillator();
        const gainBell = ctx.createGain();
        oscBell.type = 'sine';
        oscBell.frequency.setValueAtTime(freq2, startTime);
        gainBell.gain.setValueAtTime(0.85, startTime);
        gainBell.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
        oscBell.connect(gainBell);
        gainBell.connect(targetNode);
        oscBell.start(startTime);
        oscBell.stop(startTime + dur);
      });
    } catch {
      // Audio playback fails silently if restricted by autoplay policy
    }
  }

  /**
   * Loud, joyful 3-tone chime when a driver accepts a passenger ride request.
   * Maximized volume (1.0) so passenger clearly hears driver confirmation.
   */
  playDriverMatchedChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const targetNode = this.getDestinationNode(ctx);

      // Pleasant haptic confirmation vibration
      this.triggerVibration([250, 100, 250]);

      // Ascending major chord tones: D5 (587.33Hz) -> A5 (880Hz) -> D6 (1174.66Hz) -> F#6 (1479.98Hz)
      const notes = [
        { freq: 587.33, start: 0, dur: 0.35, gain: 0.9 },
        { freq: 880.0, start: 0.12, dur: 0.4, gain: 0.95 },
        { freq: 1174.66, start: 0.24, dur: 0.55, gain: 1.0 },
        { freq: 1479.98, start: 0.36, dur: 0.7, gain: 0.95 }
      ];

      notes.forEach(({ freq, start, dur, gain }) => {
        const t = now + start;

        // Warm melodic body
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(gain, t);
        g.gain.exponentialRampToValueAtTime(0.005, t + dur);
        osc.connect(g);
        g.connect(targetNode);
        osc.start(t);
        osc.stop(t + dur);

        // Sparkling bell overtone
        const bell = ctx.createOscillator();
        const gBell = ctx.createGain();
        bell.type = 'sine';
        bell.frequency.setValueAtTime(freq * 2, t);
        gBell.gain.setValueAtTime(gain * 0.45, t);
        gBell.gain.exponentialRampToValueAtTime(0.005, t + (dur * 0.7));
        bell.connect(gBell);
        gBell.connect(targetNode);
        bell.start(t);
        bell.stop(t + (dur * 0.7));
      });
    } catch {
      // Audio playback fails silently if restricted by autoplay policy
    }
  }

  /**
   * Loud celebration fanfare chime when trip is completed.
   * Maximized volume (1.0).
   */
  playTripCompletedFanfare() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const targetNode = this.getDestinationNode(ctx);

      this.triggerVibration([200, 100, 200, 100, 400]);

      // C major triumphal fanfare: C5, E5, G5, C6, E6
      const chords = [
        { freq: 523.25, t: 0, dur: 0.2 },
        { freq: 659.25, t: 0.1, dur: 0.2 },
        { freq: 783.99, t: 0.2, dur: 0.25 },
        { freq: 1046.5, t: 0.32, dur: 0.7 },
        { freq: 1318.5, t: 0.32, dur: 0.7 }
      ];

      chords.forEach(({ freq, t, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const st = now + t;
        osc.frequency.setValueAtTime(freq, st);
        gain.gain.setValueAtTime(0.95, st);
        gain.gain.exponentialRampToValueAtTime(0.005, st + dur);
        osc.connect(gain);
        gain.connect(targetNode);
        osc.start(st);
        osc.stop(st + dur);
      });
    } catch {}
  }
}

export const sounds = new SoundEffects();
