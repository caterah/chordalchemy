// A simple synthesizer to play notes and chords using the Web Audio API

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Helper to calculate semitones from C4 (Midi 60)
// Handles sharps (#, ##) and flats (b, bb)
const getSemitoneOffset = (note: string): number => {
  // Regex matches: Letter, Accidentals (#, ##, b, bb), Octave (optional)
  // Example: C#4, Bb, F##, G
  const match = note.match(/^([A-G])(#{1,2}|b{1,2})?(-?\d+)?$/i);
  if (!match) return 0;

  const noteName = match[1].toUpperCase();
  const accidental = match[2] || '';
  const octaveStr = match[3];
  
  // Default to octave 4 if not specified
  const octave = octaveStr ? parseInt(octaveStr) : 4;

  const baseOffsets: { [key: string]: number } = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };

  let semitone = baseOffsets[noteName];

  // Apply accidentals
  if (accidental === '#') semitone += 1;
  else if (accidental === '##') semitone += 2;
  else if (accidental === 'b') semitone -= 1;
  else if (accidental === 'bb') semitone -= 2;

  // Add octave offset (relative to C4 which is base 0 for this calc)
  // Actually, standard A4 is 440Hz. A4 is semitone 9 relative to C4.
  // Let's return absolute midi-style index where C4 = 60
  return semitone + (octave + 1) * 12; 
};

const noteToFreq = (note: string): number => {
  // MIDI note 69 is A4 (440Hz)
  const midiNum = getSemitoneOffset(note);
  const A4 = 69; // MIDI number for A4
  
  // Calculate frequency: f = 440 * 2^((n - 69) / 12)
  return 440 * Math.pow(2, (midiNum - A4) / 12);
};

// Exported helper for Piano to map any weird spelling (F##) to a standard key (G)
export const normalizePitchClass = (note: string): string => {
  const midiVal = getSemitoneOffset(note); // e.g. 60 for C4
  const pitchClass = midiVal % 12;
  
  const sharpMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return sharpMap[pitchClass];
};

export const playNote = (note: string, duration: number = 0.5, delay: number = 0) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine'; // Smooth sine wave
  // Handle multiple notes if passed in a string like "C#/Db" (though usually single note is passed here)
  // If slash is present, take the first one
  const cleanNote = note.split('/')[0]; 
  
  osc.frequency.value = noteToFreq(cleanNote);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
};

export const playChord = (notes: string[]) => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  // Stagger notes slightly for a strum effect
  notes.forEach((note, index) => {
    playNote(note, 1.5, index * 0.05);
  });
};