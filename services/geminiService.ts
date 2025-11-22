import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScaleData, Progression } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const scaleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    scaleName: { type: Type.STRING, description: "Full name of the scale (e.g., C Major)" },
    root: { type: Type.STRING, description: "Root note" },
    type: { type: Type.STRING, description: "Type of scale" },
    notes: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "The notes in the scale. Use simple spellings (e.g. Bb instead of A#) to avoid double accidentals." 
    },
    description: { type: Type.STRING, description: "A brief description of the scale's musical character and emotional quality." },
    chords: {
      type: Type.ARRAY,
      description: "All diatonic chords available in this scale (triads and 7ths).",
      items: {
        type: Type.OBJECT,
        properties: {
          roman: { type: Type.STRING, description: "Roman numeral analysis (e.g., I, ii, V7)" },
          name: { type: Type.STRING, description: "Chord name (e.g., C Major, D min 7)" },
          notes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Notes constituting the chord" },
          type: { type: Type.STRING, description: "Chord quality (Major, Minor, Diminished, etc.)" },
          description: { type: Type.STRING, description: "Brief usage note or emotion." }
        },
        required: ["roman", "name", "notes", "type"]
      }
    }
  },
  required: ["scaleName", "root", "type", "notes", "chords", "description"]
};

const progressionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Creative name for the progression" },
    description: { type: Type.STRING, description: "Why this progression works" },
    chords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          roman: { type: Type.STRING },
          name: { type: Type.STRING },
          notes: { type: Type.ARRAY, items: { type: Type.STRING } },
          type: { type: Type.STRING }
        }
      }
    }
  },
  required: ["name", "description", "chords"]
};

export const fetchScaleData = async (root: string, scaleType: string): Promise<ScaleData | null> => {
  try {
    const model = "gemini-2.5-flash";
    // We explicitly ask for readability to solve the "A# Major" (10 sharps) vs "Bb Major" (2 flats) issue.
    const prompt = `Generate detailed music theory data for the ${root} ${scaleType} scale. 
    
    IMPORTANT RULES:
    1. READABILITY FIRST: If the requested scale is theoretically complex (e.g., A# Major with double sharps), AUTOMATICALLY SWITCH to the simpler enharmonic equivalent (e.g., Bb Major) for the entire response.
    2. NO DOUBLE ACCIDENTALS: Do not use double sharps (##) or double flats (bb) in the notes list unless absolutely necessary for a specific minor scale context. Prefer 'G' over 'F##'.
    3. List all diatonic chords (triads and 7ths).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scaleSchema,
        temperature: 0.3,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ScaleData;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error (Scale):", error);
    throw error;
  }
};

export const fetchProgressionSuggestion = async (root: string, scaleType: string): Promise<Progression | null> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Create a unique, interesting 4-chord progression using the ${root} ${scaleType} scale. 
    Use simple note spellings (no double sharps). Return the specific chords used.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: progressionSchema,
        temperature: 0.7,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Progression;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error (Progression):", error);
    throw error;
  }
};