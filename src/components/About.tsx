export default function About() {
  return (
    <section id="about" className="py-12 md:py-24 bg-surface border-b border-white/5">
      <div className="max-w-5xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group">
          <img 
            src="/files/profile.png" 
            alt="Cyrus McCollim" 
            className="w-full h-full object-cover filter saturate-80 group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
        </div>
        
        <div className="flex flex-col">
          <span className="font-sans text-xs font-semibold tracking-[0.4em] uppercase text-gold mb-6 block">
            About
          </span>
          <p className="font-sans text-muted leading-relaxed mb-6">
            My journey started by playing the music I heard in games and films on the piano. Diving into those works made me want to learn the instrument properly, which naturally evolved into a passion for music theory and composition.
          </p>
          <p className="font-sans text-muted leading-relaxed mb-6">
            While piano and orchestra are where I feel most at home, I enjoy experimenting with different ensembles and instruments. My process usually starts at the keys, playing around with ideas until something clicks, then gradually building the arrangement out from there.
          </p>
          <p className="font-sans text-muted leading-relaxed">
            On the professional side, my experience spans a wide variety of projects, including solo piano compositions, custom arrangements, full orchestral scoring, and score transcription.
          </p>
        </div>
      </div>
    </section>
  );
}
