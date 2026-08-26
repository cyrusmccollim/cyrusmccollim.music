import { useState } from 'react';
import { Play, Pause, Download, Clock } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { tracks, TrackInfo } from '../data';

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<'original' | 'commissioned'>('original');
  const { currentTrack, isPlaying, playTrack } = useAudio();

  const currentTracks = tracks[activeTab];

  // Group by category
  const groupedTracks = currentTracks.reduce((acc, track) => {
    if (!acc[track.category]) acc[track.category] = [];
    acc[track.category].push(track);
    return acc;
  }, {} as Record<string, TrackInfo[]>);

  const formatTime = (timeInSeconds?: number) => {
    if (!timeInSeconds) return "--:--";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section id="portfolio" className="py-24 bg-surface border-y border-white/5 relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-oyster">
              Portfolio
            </h2>
          </div>

          <div className="flex bg-obsidian p-1.5 rounded-lg border border-white/5 w-fit">
            <button
              onClick={() => setActiveTab('original')}
              className={`w-[110px] sm:w-[130px] py-2.5 text-xs font-semibold tracking-widest uppercase rounded-md transition-all text-center ${
                activeTab === 'original' 
                  ? 'bg-surface-elevated text-gold shadow-md' 
                  : 'text-muted hover:text-oyster'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setActiveTab('commissioned')}
              className={`w-[130px] sm:w-[150px] py-2.5 text-xs font-semibold tracking-widest uppercase rounded-md transition-all text-center ${
                activeTab === 'commissioned' 
                  ? 'bg-surface-elevated text-gold shadow-md' 
                  : 'text-muted hover:text-oyster'
              }`}
            >
              Commissions
            </button>
          </div>
        </div>

        <div className="space-y-16">
          {Object.entries(groupedTracks).map(([category, categoryTracks]) => (
            <div key={category}>
              <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <h3 className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-gold">
                  {category}
                </h3>
                <span className="font-sans text-xs font-semibold tracking-widest text-muted ml-auto">
                  {categoryTracks.length} TRACK{categoryTracks.length !== 1 ? 'S' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTracks.map((track, i) => {
                  const isActive = currentTrack?.path === track.path;
                  
                  return (
                    <div 
                      key={track.path}
                      className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                        isActive 
                          ? 'bg-surface-elevated border-gold/20' 
                          : 'bg-transparent border-transparent hover:bg-surface-hover hover:border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <button 
                          onClick={() => playTrack(track)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isActive 
                              ? 'bg-gold text-obsidian' 
                              : 'bg-white/5 text-muted group-hover:bg-gold/20 group-hover:text-gold'
                          }`}
                        >
                          {isActive && isPlaying ? (
                            <Pause size={16} fill="currentColor" />
                          ) : (
                            <Play size={16} fill="currentColor" className="ml-1" />
                          )}
                        </button>
                        
                        <div className="min-w-0 flex flex-col">
                          <span className={`font-display text-lg truncate ${isActive ? 'text-oyster' : 'text-muted group-hover:text-oyster transition-colors'}`}>
                            {track.title}
                          </span>
                          <span className="font-sans text-[10px] font-semibold text-dim tracking-[0.2em] uppercase mt-0.5">
                            {track.style || track.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
