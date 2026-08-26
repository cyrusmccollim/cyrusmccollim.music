import { Play } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { tracks } from '../data';

export default function Hero() {
  const { playTrack } = useAudio();

  const handlePlayReel = () => {
    const pool = tracks.original.filter(t => t.category === 'Orchestral');
    const reelTrack = pool[Math.floor(Math.random() * pool.length)];
    if (reelTrack) playTrack(reelTrack);
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_80%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-obsidian to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 leading-none z-10">
        <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-12 md:h-16 lg:h-[72px] block">
          <path d="M0,36 C240,72 480,0 720,36 C960,72 1200,0 1440,36 L1440,72 L0,72 Z" fill="#141312"/>
        </svg>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
        <span className="font-sans text-xs font-bold tracking-[0.4em] uppercase text-gold mb-6 block">
          Composer · Pianist
        </span>
        
        <h1 className="font-display text-5xl md:text-7xl lg:text-[7rem] font-light leading-[0.95] tracking-tight text-oyster mb-8">
          Cyrus McCollim
        </h1>
        
        <p className="font-display text-xl md:text-2xl font-light italic text-muted max-w-2xl mx-auto mb-12">
          Writing music for orchestra, solo piano, and small ensembles.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <button 
            onClick={handlePlayReel}
            className="flex items-center gap-3 bg-oyster text-obsidian px-8 py-4 rounded-full font-sans text-xs font-bold tracking-[0.2em] uppercase hover:bg-gold transition-colors duration-300"
          >
            <Play size={16} fill="currentColor" />
            Listen
          </button>
          
          <a 
            href="#portfolio"
            className="flex items-center gap-3 border border-white/10 text-oyster px-8 py-4 rounded-full font-sans text-xs font-bold tracking-[0.2em] uppercase hover:border-gold hover:text-gold transition-colors duration-300"
          >
            Portfolio
          </a>
        </div>
      </div>
    </section>
  );
}
