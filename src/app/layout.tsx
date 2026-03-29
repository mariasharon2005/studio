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
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-[#050505] text-white selection:bg-primary selection:text-black">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
