import React from 'react';
import { playNote, normalizePitchClass } from '../utils/audio';

interface PianoProps {
  activeNotes: string[];
  rootNote?: string;
}

const KEYS = [
  { note: 'C', type: 'white' },
  { note: 'C#', type: 'black' },
  { note: 'D', type: 'white' },
  { note: 'D#', type: 'black' },
  { note: 'E', type: 'white' },
  { note: 'F', type: 'white' },
  { note: 'F#', type: 'black' },
  { note: 'G', type: 'white' },
  { note: 'G#', type: 'black' },
  { note: 'A', type: 'white' },
  { note: 'A#', type: 'black' },
  { note: 'B', type: 'white' },
];

// Duplicate for 2 octaves to show ranges better
const DOUBLE_KEYS = [...KEYS, ...KEYS];

const Piano: React.FC<PianoProps> = ({ activeNotes, rootNote }) => {
  
  // Helper to check if a key matches any of the active notes
  const isNoteActive = (keyNote: string) => {
    return activeNotes.some(n => {
       // Normalize input note (e.g. "Bb" -> "A#", "F##" -> "G")
       const normalizedActive = normalizePitchClass(n);
       return normalizedActive === keyNote;
    });
  };

  const isRoot = (keyNote: string) => {
    if (!rootNote) return false;
    return normalizePitchClass(rootNote) === keyNote;
  }

  return (
    <div className="relative h-32 md:h-40 flex justify-center overflow-hidden rounded-lg shadow-xl bg-gray-900 border border-gray-700 select-none">
      {DOUBLE_KEYS.map((key, index) => {
        const isActive = isNoteActive(key.note);
        const isRootNote = isRoot(key.note);
        
        // Calculate visual octave for unique keys in list
        const octave = index < 12 ? 4 : 5; 
        const fullNoteName = `${key.note}${octave}`;

        if (key.type === 'white') {
          return (
            <div
              key={`${key.note}-${index}`}
              onClick={() => playNote(fullNoteName)}
              className={`
                relative flex-1 border-r border-gray-300 last:border-r-0 cursor-pointer transition-colors duration-200
                ${isActive ? 'bg-indigo-100' : 'bg-white'}
                hover:bg-gray-100 active:bg-gray-200
                h-full flex items-end justify-center pb-2
              `}
            >
              {isActive && (
                <div className={`w-3 h-3 rounded-full mb-2 ${isRootNote ? 'bg-pink-500' : 'bg-indigo-500'}`}></div>
              )}
              <span className="text-xs text-gray-500 font-semibold">{key.note}</span>
            </div>
          );
        } else {
          // Black keys are rendered in the overlay layer
          return null; 
        }
      })}

      {/* Render Black Keys Overlay */}
      <div className="absolute top-0 left-0 right-0 h-2/3 flex pointer-events-none">
         {DOUBLE_KEYS.map((key, index) => {
             if (key.type === 'white') return <div key={index} className="flex-1"></div>;
             
             // It's a black key
             const isActive = isNoteActive(key.note);
             const octave = index < 12 ? 4 : 5;
             const fullNoteName = `${key.note}${octave}`;

             return (
                 <div key={index} className="flex-0 w-[0px] relative" style={{ flexBasis: 0 }}>
                     <div 
                        onClick={(e) => { e.stopPropagation(); playNote(fullNoteName); }}
                        className={`
                            absolute z-10 w-6 md:w-8 h-full -translate-x-1/2 top-0 rounded-b-md cursor-pointer pointer-events-auto shadow-md border border-gray-800
                            ${isActive ? 'bg-indigo-600' : 'bg-gray-900'}
                            hover:bg-gray-700 active:bg-gray-800
                        `}
                     >
                     </div>
                 </div>
             );
         })}
      </div>
    </div>
  );
};

export default Piano;