"use client"

import { useEffect, useState } from 'react';
import Logo from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [lines, setLines] = useState<string[]>([]);
  const bootMessages = [
    "INITIALIZING SENTINEL-OPS KERNEL...",
    "ESTABLISHING SECURE CLOUD PROTOCOLS...",
    "MOUNTING PROPHET FORECASTING ENGINE...",
    "SCANNING FOR GHOST RESOURCES...",
    "CALIBRATING CARBON OFFSET CALCULATORS...",
    "SYSTEM READY. AUTHENTICATION REQUIRED."
  ];

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < bootMessages.length) {
        setLines(prev => [...prev, bootMessages[currentLine]]);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [onComplete, bootMessages.length]);

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50 p-6 cyber-grid">
      <div className="max-w-xl w-full">
        <div className="mb-12 text-center flex flex-col items-center">
          <Logo size="xl" className="mb-8" />
          <h1 className="text-5xl font-headline text-primary neon-text mb-2 animate-pulse tracking-[0.2em]">SENTINEL-OPS</h1>
          <div className="h-1 w-full bg-muted overflow-hidden max-w-xs mt-4">
            <div className="h-full bg-primary animate-[boot-line_4s_ease-in-out_infinite]"></div>
          </div>
        </div>
        
        <div className="space-y-2 font-code text-sm text-primary/80">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center">
              <span className="mr-3 text-secondary font-bold">{'>>'}</span>
              <span>{line}</span>
            </div>
          ))}
          {lines.length < bootMessages.length && (
            <div className="animate-pulse">_</div>
          )}
        </div>
      </div>
    </div>
  );
}
