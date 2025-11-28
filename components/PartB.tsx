import React, { useState } from 'react';
import { ScriptSection } from '../types';
import { CopyButton } from './CopyButton';
import { generateAudio } from '../services/geminiService';

interface PartBProps {
  sections: ScriptSection[];
  isStreaming: boolean;
}

const VOICE_OPTIONS = [
  { name: 'Kore', label: 'Female • Soothing', gender: 'F' },
  { name: 'Zephyr', label: 'Female • Gentle', gender: 'F' },
  { name: 'Puck', label: 'Male • Energetic', gender: 'M' },
  { name: 'Charon', label: 'Male • Deep', gender: 'M' },
  { name: 'Fenrir', label: 'Male • Intense', gender: 'M' },
];

export const PartB: React.FC<PartBProps> = ({ sections, isStreaming }) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingAudioIndex, setLoadingAudioIndex] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');

  const handlePlay = async (text: string, index: number) => {
    try {
      setLoadingAudioIndex(index);
      
      const base64Audio = await generateAudio(text, selectedVoice);
      
      // DECODING RAW PCM LOGIC
      // Gemini TTS returns raw PCM 16-bit at 24kHz
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const int16Data = new Int16Array(bytes.buffer);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = audioCtx.createBuffer(1, int16Data.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      for (let i = 0; i < int16Data.length; i++) {
        channelData[i] = int16Data[i] / 32768.0;
      }
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        setPlayingIndex(null);
      };

      setPlayingIndex(index);
      source.start(0);

    } catch (error) {
      console.error("Audio playback error:", error);
      alert("Could not generate audio preview. Please check API key/quota.");
      setPlayingIndex(null);
    } finally {
      setLoadingAudioIndex(null);
    }
  };

  if ((!sections || sections.length === 0) && !isStreaming) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Part B: The Directed Script</h2>
        </div>
        
        {/* Voice Selector */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 pl-2">Voice:</span>
            <select 
                value={selectedVoice} 
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="text-sm border-none bg-transparent focus:ring-0 text-slate-700 font-medium cursor-pointer"
            >
                {VOICE_OPTIONS.map(opt => (
                    <option key={opt.name} value={opt.name}>
                        {opt.name} ({opt.label})
                    </option>
                ))}
            </select>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="group relative animate-fade-in-up">
            <h3 className="text-sm font-bold text-slate-900 mb-2 font-burmese">
              {section.title || `Section ${idx + 1}`}
            </h3>
            
            <div className="bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
               <div className="flex items-center justify-between px-3 py-2 bg-slate-200/50 border-b border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">Script Segment</span>
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => handlePlay(section.cleanText, idx)}
                        disabled={loadingAudioIndex === idx || playingIndex === idx}
                        className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            playingIndex === idx 
                            ? "bg-blue-100 text-blue-600" 
                            : "hover:bg-white text-slate-600"
                        }`}
                        title={`Listen with ${selectedVoice}`}
                     >
                        {loadingAudioIndex === idx ? (
                            <span className="animate-spin">⏳</span>
                        ) : playingIndex === idx ? (
                             <span>🔊 Playing...</span>
                        ) : (
                            <>
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
                                <span>Preview</span>
                            </>
                        )}
                     </button>
                     <div className="h-4 w-px bg-slate-300 mx-1"></div>
                     <CopyButton textToCopy={section.content} label="Copy Script" />
                  </div>
               </div>

               <div className="p-4 font-burmese text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                 {section.content}
               </div>
            </div>
          </div>
        ))}

        {/* Streaming Loading Indicator */}
        {isStreaming && (
            <div className="animate-pulse space-y-4 opacity-70">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
                <div className="bg-slate-100 rounded-lg border border-slate-200 overflow-hidden h-32 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Writing next section...
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};