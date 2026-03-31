
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Sentinel-Ops | Cloud FinOps',
  description: 'AI-Powered Cloud Cost Optimization & Carbon Tracking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@900&family=Raleway:wght@300;400;600&family=JetBrains+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-[#050505] text-white selection:bg-primary selection:text-black min-h-screen overflow-x-hidden" suppressHydrationWarning>
        {/* Animated Cybercurrency Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-black">
          <div 
            className="absolute inset-0 bg-[url('https://picsum.photos/seed/crypto-hifi/1920/1080')] bg-cover bg-center bg-fixed transition-all duration-700 filter brightness-[0.5] contrast-[1.2] scale-[1.5] md:scale-110 animate-subtle-zoom [.ghost-active_&]:grayscale-[100%] [.ghost-active_&]:invert-[10%]"
            data-ai-hint="blockchain network"
          ></div>
          {/* HiFi Overlay Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90"></div>
          <div className="absolute inset-0 cyber-grid opacity-20"></div>
          
          {/* Dynamic Glow Orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
        </div>

        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
