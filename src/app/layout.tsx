import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Sentinel-Ops | Tokyo Night Cloud FinOps',
  description: 'AI-Powered Cloud Cost Optimization & Infrastructure Financing',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-[#1A1B26] text-foreground selection:bg-primary selection:text-black min-h-screen overflow-x-hidden" suppressHydrationWarning>
        {/* Animated Cybercurrency Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#1A1B26]">
          <div 
            className="absolute inset-0 bg-[url('https://picsum.photos/seed/crypto-hifi/1920/1080')] bg-cover bg-center bg-fixed transition-all duration-700 filter brightness-[0.4] contrast-[1.1] scale-[1.1] animate-subtle-zoom"
            data-ai-hint="blockchain network"
          ></div>
          {/* Tokyo Night Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1B26]/95 via-transparent to-[#1A1B26]/95"></div>
          <div className="absolute inset-0 cyber-grid opacity-20"></div>
          
          {/* Dynamic Glow Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] animate-pulse-slow delay-700"></div>
        </div>

        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
