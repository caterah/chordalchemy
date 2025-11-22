import React from 'react';
import { ChordInfo } from '../types';
import { playChord } from '../utils/audio';

interface ChordCardProps {
  chord: ChordInfo;
  onAdd: (chord: ChordInfo) => void;
}

const ChordCard: React.FC<ChordCardProps> = ({ chord, onAdd }) => {
  return (
    <div className="group relative bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-indigo-500 rounded-xl p-4 transition-all duration-300 shadow-lg hover:shadow-indigo-500/20 flex flex-col justify-between min-h-[140px]">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block px-2 py-1 text-xs font-bold tracking-wider text-indigo-300 bg-indigo-900/50 rounded uppercase">
            {chord.roman}
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); onAdd(chord); }}
            className="text-slate-400 hover:text-emerald-400 transition-colors"
            title="Add to Progression"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-200 transition-colors">{chord.name}</h3>
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{chord.description || chord.type}</p>
      </div>
      
      <div className="flex justify-between items-end">
        <div className="flex gap-1 flex-wrap">
           {chord.notes.map((n, i) => (
             <span key={i} className="text-[10px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                {n}
             </span>
           ))}
        </div>
        <button 
          onClick={() => playChord(chord.notes)}
          className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
          title="Play Chord"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChordCard;
