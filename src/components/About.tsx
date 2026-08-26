export default function About() {
  return (
    <section id="about" className="py-24 bg-surface border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group">
          <img 
            src="files/profile.png" 
            alt="Cyrus McCollim" 
            className="w-full h-full object-cover filter group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
        </div>
        
        <div className="flex flex-col">
          <span className="font-sans text-xs font-semibold tracking-[0.4em] uppercase text-gold mb-6 block">
            About
          </span>
          <p className="font-sans text-muted leading-relaxed mb-6">
            My journey started playing the music I heard in games I played and films I watched on the piano. That pulled me into taking learning piano seriously, which grew into an interest for the theoretical side of music, and eventually the desire to write that same kind of music myself.
          </p>
          <p className="font-sans text-muted leading-relaxed mb-6">
            Piano and orchestra are where I feel most at home, but I like experimenting with different ensembles and instruments often. My process usually starts at the piano, playing around with ideas until something clicks, then gradually building the arrangement out from there.
          </p>
          <p className="font-sans text-muted leading-relaxed">
            On the professional side, I've taken on projects ranging from piano compositions and arrangements, to full orchestral arrangements and score transcription.
          </p>
        </div>
      </div>
    </section>
  );
}
