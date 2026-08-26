import React from 'react';
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export default function StickyPlayer() {
  const { currentTrack, isPlaying, progress, duration, volume, togglePlay, setVolume, seek } = useAudio();

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] md:w-[calc(100%-32px)] max-w-4xl z-50">
      <div className="bg-obsidian-warm/95 backdrop-blur-xl border border-white/10 rounded-2xl py-4 px-6 md:py-4 md:px-8 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-2xl">
        
        {/* Top/Left Section: Play, Info, and Mobile Volume */}
        <div className="flex items-center justify-between w-full md:w-auto md:min-w-[240px] gap-4">
          <div className="flex items-center gap-4 overflow-hidden flex-1">
            <button 
              onClick={togglePlay} 
              className="w-10 h-10 flex items-center justify-center bg-gold text-obsidian rounded-full hover:bg-gold-light transition-colors flex-shrink-0"
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
            </button>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-display text-oyster text-base md:text-lg truncate">{currentTrack.title}</span>
              <span className="font-sans font-semibold text-[10px] text-gold tracking-widest uppercase truncate">{currentTrack.style || currentTrack.category}</span>
            </div>
          </div>
          
          {/* Volume (Mobile only) */}
          <div className="flex md:hidden items-center gap-2 justify-end w-[90px] flex-shrink-0">
            <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-muted hover:text-oyster transition-colors">
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>
        </div>

        {/* Center Section: Progress Bar */}
        <div className="flex items-center gap-3 md:gap-4 flex-grow w-full">
          <span className="font-sans font-medium tabular-nums text-xs text-muted w-10 text-left md:text-right flex-shrink-0">
            {formatTime(progress)}
          </span>

          <div className="flex-grow relative h-8 flex items-center group">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={progress} 
              onChange={(e) => seek(parseFloat(e.target.value) / (duration || 100))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden group-hover:h-2.5 transition-all pointer-events-none">
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-gold/50 to-gold rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <span className="font-sans font-medium tabular-nums text-xs text-muted w-10 text-right md:text-left flex-shrink-0">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume (Desktop only) */}
        <div className="hidden md:flex items-center justify-end gap-3 w-[140px] flex-shrink-0">
          <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-muted hover:text-oyster transition-colors">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
          />
        </div>
        
      </div>
    </div>
  );
}
