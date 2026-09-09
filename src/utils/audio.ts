// Web Audio API Sound Synthesizer & Speech Synthesis Utility

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Gentle cheerful pentatonic chime (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.09);
      
      gain.gain.setValueAtTime(0, now + index * 0.09);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.09);
      osc.stop(now + index * 0.09 + 0.4);
    });
  } catch (e) {
    console.debug('Audio not supported or blocked', e);
  }
}

export function playSoftClick() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
    
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {
    console.debug(e);
  }
}

export function playGentleRetry() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [392.00, 329.63]; // G4 -> E4 gentle low reassuring tone
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      
      gain.gain.setValueAtTime(0.12, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.3);
    });
  } catch (e) {
    console.debug(e);
  }
}

export function playCalmBreathingTone(type: 'inhale' | 'hold' | 'exhale') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    const baseFreq = type === 'inhale' ? 220 : type === 'hold' ? 330 : 260;
    osc.frequency.setValueAtTime(baseFreq, now);
    
    if (type === 'inhale') {
      osc.frequency.linearRampToValueAtTime(330, now + 4);
    } else if (type === 'exhale') {
      osc.frequency.linearRampToValueAtTime(196, now + 4);
    }
    
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 1);
    gain.gain.linearRampToValueAtTime(0.001, now + 3.9);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 4);
  } catch (e) {
    console.debug(e);
  }
}

// Speech Synthesis (Berry reads aloud)
export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }
  
  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, friendly pace for neurodivergent listeners
    utterance.pitch = 1.1; // Warm, friendly pitch
    
    // Try to pick a natural friendly English voice if available
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen'))
    ) || voices.find(v => v.lang.startsWith('en'));
    
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }
    
    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }
    
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.debug('TTS Error', e);
    onEnd?.();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
