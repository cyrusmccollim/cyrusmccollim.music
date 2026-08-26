import { Music, AudioWaveform, Piano } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: <AudioWaveform size={24} strokeWidth={1.5} />,
      title: "Composition",
      desc: "Write original soundtracks or cues for games, short films, or other media projects.",
    },
    {
      icon: <Piano size={24} strokeWidth={1.5} />,
      title: "Arrangement",
      desc: "Arrange existing music for solo instruments or ensembles, and transcribe for sheets.",
    },
    {
      icon: <Music size={24} strokeWidth={1.5} />,
      title: "Mockups",
      desc: "Transform a sketch into a realistic ensemble or orchestral track.",
    }
  ];

  return (
    <section id="services" className="py-12 md:py-24 bg-obsidian-warm relative border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        
        {/* Services Section */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-light text-oyster mb-4">
            Freelance
          </h2>
          <p className="font-sans text-md text-dim max-w-xl mx-auto">
            Please reach out to me via email for project proposals.<br/>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((svc, i) => (
            <div key={i} className="p-8 border border-white/5 rounded-2xl bg-surface/30 hover:bg-surface transition-colors duration-500">
              <div className="w-12 h-12 rounded-full bg-gold/10 text-gold flex items-center justify-center mb-6">
                {svc.icon}
              </div>
              <h3 className="font-display text-2xl text-oyster mb-3">{svc.title}</h3>
              <p className="font-sans text-sm leading-relaxed text-muted">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
