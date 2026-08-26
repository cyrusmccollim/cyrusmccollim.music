/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Services from './components/Services';
import Contact from './components/Contact';
import StickyPlayer from './components/StickyPlayer';
import { AudioProvider } from './context/AudioContext';

export default function App() {
  return (
    <AudioProvider>
      <div className="bg-noise" />
      <div className="relative min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Portfolio />
          <Services />
          <Contact />
          <About />
        </main>
        
        <footer className="py-12 bg-obsidian border-t border-white/5 relative z-10 px-6 md:px-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start">
              <span className="font-display text-3xl md:text-4xl text-oyster mb-2">Cyrus McCollim</span>
              <span className="font-sans text-xs font-semibold tracking-[0.3em] uppercase text-gold">Composer & Pianist</span>
            </div>
            
            <div className="text-center md:text-right flex flex-col gap-2">
              <p className="font-sans text-xs text-muted/80">
                &copy; {new Date().getFullYear()} Cyrus McCollim. All rights reserved.
              </p>
              <p className="font-sans text-xs text-dim/60 max-w-sm md:max-w-none leading-relaxed">
                Music on this page is protected under copyright law and may not be used, distributed, or modified without explicit written permission.
              </p>
            </div>
          </div>
        </footer>

        <StickyPlayer />
      </div>
    </AudioProvider>
  );
}

