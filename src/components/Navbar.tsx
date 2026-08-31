import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Music', href: '#portfolio' },
    // { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent ${
        scrolled ? 'bg-obsidian/85 backdrop-blur-md border-white/5 py-4' : 'bg-transparent py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <a href="#" className="font-display text-2xl tracking-widest uppercase text-oyster">
            CM
          </a>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.label} 
                href={link.href}
                className="text-xs font-semibold tracking-[0.2em] uppercase text-muted hover:text-gold transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a 
              href="#contact"
              className="text-xs font-semibold tracking-[0.2em] uppercase border border-white/10 px-6 py-2.5 rounded-full hover:border-gold hover:text-gold transition-all"
            >
              Contact
            </a>
          </div>

          <button 
            className="md:hidden text-oyster"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 bg-obsidian flex flex-col items-center justify-center transition-all duration-500 ${
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex flex-col items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.label} 
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-display text-3xl text-oyster hover:text-gold transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a 
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="font-display text-3xl text-gold mt-4"
          >
            Contact
          </a>
        </div>
      </div>
    </>
  );
}
