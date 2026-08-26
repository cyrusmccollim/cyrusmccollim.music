import { useState } from 'react';
import { Copy, Check, ArrowUpRight } from 'lucide-react';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const email = "music@cyrusmccollim.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-16 md:py-32 bg-obsidian border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_100%,rgba(201,168,76,0.03),transparent_70%)]" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-16">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl md:text-6xl font-light text-oyster mb-6 leading-tight">
            Contact
          </h2>
          <p className="font-sans text-muted text-base md:text-lg leading-relaxed mb-10 max-w-md">
            Reach out to discuss your project, licensing, or collaborations.
          </p>
          
          <button 
            onClick={handleCopy}
            className="group flex items-center gap-6 text-left"
          >
            <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-oyster group-hover:bg-oyster group-hover:text-obsidian transition-all duration-500 flex-shrink-0">
              {copied ? <Check size={20} /> : <ArrowUpRight size={20} />}
            </div>
            <div>
              <span className="block font-sans text-xs font-semibold tracking-widest uppercase text-muted mb-2">
                {copied ? "Copied to clipboard" : "Copy email"}
              </span>
              <span className="block font-display font-light text-lg sm:text-2xl md:text-2xl text-oyster group-hover:text-gold transition-colors duration-300 whitespace-nowrap">
                {email}
              </span>
            </div>
          </button>
        </div>

        <div className="flex flex-col gap-6 w-full md:w-auto border-t border-white/10 md:border-none pt-10 md:pt-0">
          <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-gold mb-2">
            Published Music
          </span>
          <a href="https://open.spotify.com/artist/0jJ9N3jCnkzpVOtvjIiLZ4" target="_blank" rel="noopener noreferrer" className="text-oyster hover:text-gold transition-colors font-display text-2xl flex items-center justify-between gap-8 group border-b border-white/5 pb-4">
            Spotify
            <ArrowUpRight size={18} className="text-muted group-hover:text-gold transition-colors" />
          </a>
          <a href="https://music.youtube.com/channel/UClYvIGZH6ovaCoJHDHTlSgg" target="_blank" rel="noopener noreferrer" className="text-oyster hover:text-gold transition-colors font-display text-2xl flex items-center justify-between gap-8 group border-b border-white/5 pb-4">
            YouTube
            <ArrowUpRight size={18} className="text-muted group-hover:text-gold transition-colors" />
          </a>
          <a href="https://music.apple.com/us/artist/cyrus-mccollim/1611277667" target="_blank" rel="noopener noreferrer" className="text-oyster hover:text-gold transition-colors font-display text-2xl flex items-center justify-between gap-8 group border-b border-white/5 pb-4">
            Apple Music
            <ArrowUpRight size={18} className="text-muted group-hover:text-gold transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
}
