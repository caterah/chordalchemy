import React, { useState, useEffect, useRef } from 'react';
import { Note, ScaleType, ScaleData, ChordInfo, Progression } from './types';
import { NOTES, SCALE_TYPES, INITIAL_SCALE_DATA } from './constants';
import { fetchScaleData, fetchProgressionSuggestion } from './services/geminiService';
import { playChord } from './utils/audio';
import Piano from './components/Piano';
import ChordCard from './components/ChordCard';

const App: React.FC = () => {
  const [selectedRoot, setSelectedRoot] = useState<string>(Note.C);
  const [selectedScaleType, setSelectedScaleType] = useState<ScaleType>(ScaleType.Major);
  const [scaleData, setScaleData] = useState<ScaleData>(INITIAL_SCALE_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [progression, setProgression] = useState<ChordInfo[]>([]);
  const [isPlayingProgression, setIsPlayingProgression] = useState(false);
  const [aiProgressionLoading, setAiProgressionLoading] = useState(false);

  // Debounce fetching to avoid rate limits if user scrolls fast
  // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to avoid namespace error
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFetchScale = async (root: string, type: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchScaleData(root, type);
      if (data) {
        setScaleData(data);
      } else {
        setError("Failed to generate scale data.");
      }
    } catch (err) {
      setError("Error connecting to AI service. Check connection or API limits.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when inputs change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      // Only fetch if different from initial to save initial load cost, or if we want to be dynamic always
      // For MVP, let's fetch.
      if (selectedRoot === INITIAL_SCALE_DATA.root && selectedScaleType === INITIAL_SCALE_DATA.type) {
        return;
      }
      handleFetchScale(selectedRoot, selectedScaleType);
    }, 600); // 600ms debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedRoot, selectedScaleType]);

  const addToProgression = (chord: ChordInfo) => {
    if (progression.length < 8) {
      setProgression([...progression, chord]);
    }
  };

  const removeFromProgression = (index: number) => {
    const newProg = [...progression];
    newProg.splice(index, 1);
    setProgression(newProg);
  };

  const playProgression = async () => {
    if (isPlayingProgression || progression.length === 0) return;
    setIsPlayingProgression(true);

    for (const chord of progression) {
      playChord(chord.notes);
      // Wait 1 second between chords
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setIsPlayingProgression(false);
  };

  const handleAiSuggest = async () => {
    setAiProgressionLoading(true);
    try {
      const suggestion = await fetchProgressionSuggestion(scaleData.root, scaleData.type);
      if (suggestion && suggestion.chords) {
        setProgression(suggestion.chords);
      }
    } catch (e) {
      alert("Could not generate suggestion at this time.");
    } finally {
      setAiProgressionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 pb-20">
      {/* Header */}
      <header className="bg-slate-950/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
               ChordAlchemy
             </h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
          
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Root Note</label>
                  <div className="grid grid-cols-4 gap-2">
                    {NOTES.map(note => (
                      <button
                        key={note}
                        onClick={() => setSelectedRoot(note)}
                        className={`px-2 py-2 text-sm rounded-lg font-medium transition-all
                          ${selectedRoot === note 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                          }
                        `}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Scale Type</label>
                  <select 
                    value={selectedScaleType}
                    onChange={(e) => setSelectedScaleType(e.target.value as ScaleType)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                  >
                    {SCALE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Progression Builder - Mobile/Desktop Sidebar */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 shadow-xl flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">My Loop</h2>
                 <button 
                    onClick={() => setProgression([])}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                 >
                   Clear
                 </button>
              </div>
              
              <div className="flex-1 space-y-2 mb-4">
                {progression.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-700 rounded-xl p-4">
                    <p>No chords yet.</p>
                    <p className="text-xs mt-1">Click + on a chord card.</p>
                  </div>
                )}
                {progression.map((chord, idx) => (
                  <div key={`${chord.name}-${idx}`} className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-mono text-indigo-400 w-6">{idx + 1}.</span>
                       <span className="text-sm font-bold text-white">{chord.name}</span>
                    </div>
                    <button onClick={() => removeFromProgression(idx)} className="text-slate-500 hover:text-red-400">
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={playProgression}
                  disabled={progression.length === 0 || isPlayingProgression}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                   {isPlayingProgression ? (
                     <span className="animate-pulse">Playing...</span>
                   ) : (
                     <>
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                         <path fillRule="evenodd" d="M4.5 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" clipRule="evenodd" />
                       </svg>
                       Play Loop
                     </>
                   )}
                </button>
                <button
                  onClick={handleAiSuggest}
                  disabled={aiProgressionLoading || loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                >
                   {aiProgressionLoading ? 'Thinking...' : 'AI Suggest'}
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-8">
             {/* Scale Hero */}
             <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl p-6 md:p-10">
                {loading && (
                  <div className="absolute inset-0 bg-slate-900/80 z-20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-indigo-400 animate-pulse font-medium">Consulting Gemini...</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 relative z-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h2 className="text-3xl md:text-4xl font-bold text-white">{scaleData.scaleName}</h2>
                       <span className="px-3 py-1 bg-slate-700 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-600">
                         {scaleData.notes.length} Notes
                       </span>
                    </div>
                    <p className="text-slate-400 max-w-2xl leading-relaxed">
                      {scaleData.description}
                    </p>
                  </div>
                </div>

                <div className="mb-8">
                  <Piano activeNotes={scaleData.notes} rootNote={scaleData.root} />
                </div>

                <div className="flex flex-wrap gap-2">
                   {scaleData.notes.map((n, i) => (
                     <div key={i} className="w-10 h-10 rounded-lg bg-slate-700/50 border border-slate-600 flex items-center justify-center text-white font-bold shadow-inner">
                        {n}
                     </div>
                   ))}
                </div>
             </div>

             {/* Chords Grid */}
             <div>
               <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xl font-bold text-white">Scale Chords</h3>
                 <div className="text-xs text-slate-500">Triads & 7ths generated by AI</div>
               </div>
               
               {error ? (
                 <div className="p-6 rounded-xl bg-red-900/20 border border-red-900/50 text-red-300">
                   {error}
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                   {scaleData.chords.map((chord, idx) => (
                     <ChordCard key={idx} chord={chord} onAdd={addToProgression} />
                   ))}
                 </div>
               )}
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;