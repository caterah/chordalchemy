import { ScaleType } from './types';

// Display friendly note names including enharmonics
export const NOTES: string[] = [
  'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 
  'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B'
];

export const SCALE_TYPES: ScaleType[] = [
  ScaleType.Major,
  ScaleType.Minor,
  ScaleType.HarmonicMinor,
  ScaleType.MelodicMinor,
  ScaleType.Dorian,
  ScaleType.Phrygian,
  ScaleType.Lydian,
  ScaleType.Mixolydian,
  ScaleType.Locrian,
  ScaleType.PentatonicMajor,
  ScaleType.PentatonicMinor,
  ScaleType.Blues,
];

export const INITIAL_SCALE_DATA = {
  scaleName: "C Major",
  root: "C",
  type: "Major",
  notes: ["C", "D", "E", "F", "G", "A", "B"],
  description: "The standard major scale, consisting of natural notes. It sounds happy, resolved, and simple.",
  chords: [
    { roman: "I", name: "C Major", notes: ["C", "E", "G"], type: "Major" },
    { roman: "ii", name: "D Minor", notes: ["D", "F", "A"], type: "Minor" },
    { roman: "iii", name: "E Minor", notes: ["E", "G", "B"], type: "Minor" },
    { roman: "IV", name: "F Major", notes: ["F", "A", "C"], type: "Major" },
    { roman: "V", name: "G Major", notes: ["G", "B", "D"], type: "Major" },
    { roman: "vi", name: "A Minor", notes: ["A", "C", "E"], type: "Minor" },
    { roman: "vii°", name: "B Diminished", notes: ["B", "D", "F"], type: "Diminished" },
  ]
};