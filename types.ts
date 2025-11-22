export enum Note {
  C = 'C',
  CSharp = 'C#',
  D = 'D',
  DSharp = 'D#',
  E = 'E',
  F = 'F',
  FSharp = 'F#',
  G = 'G',
  GSharp = 'G#',
  A = 'A',
  ASharp = 'A#',
  B = 'B'
}

export enum ScaleType {
  Major = 'Major',
  Minor = 'Natural Minor',
  HarmonicMinor = 'Harmonic Minor',
  MelodicMinor = 'Melodic Minor',
  Dorian = 'Dorian',
  Phrygian = 'Phrygian',
  Lydian = 'Lydian',
  Mixolydian = 'Mixolydian',
  Locrian = 'Locrian',
  PentatonicMajor = 'Pentatonic Major',
  PentatonicMinor = 'Pentatonic Minor',
  Blues = 'Blues',
  WholeTone = 'Whole Tone',
  Diminished = 'Diminished'
}

export interface ChordInfo {
  roman: string;
  name: string;
  notes: string[];
  type: string;
  description?: string;
}

export interface ScaleData {
  scaleName: string;
  root: string;
  type: string;
  notes: string[];
  description: string;
  chords: ChordInfo[];
}

export interface Progression {
  name: string;
  chords: ChordInfo[];
  description: string;
}
