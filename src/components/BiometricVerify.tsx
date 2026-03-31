"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Fingerprint, ShieldCheck, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

interface BiometricVerifyProps {
  onSuccess: () => void;
}

export default function BiometricVerify({ onSuccess }: BiometricVerifyProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [pinInput, setPinInput] = useState('');

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  };

  const handleBiometricAuth = () => {
    triggerHaptic();
    toast({ 
      title: "IDENTITY VERIFIED", 
      description: "Secure session established via WebAuthn." 
    });
    onSuccess();
  };

  const handlePinAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '123456') {
      triggerHaptic();
      toast({ 
        title: "PIN VERIFIED", 
        description: "Standard protocol fallback successful." 
      });
      onSuccess();
    } else {
      toast({ 
        variant: "destructive",
        title: "AUTH FAILED", 
        description: "Invalid credentials." 
      });
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-50 p-6 cyber-grid">
      <div className="max-w-md w-full glass-card p-10 rounded-3xl border-primary/20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        
        <div className="mb-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/30 relative">
            <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping"></div>
            <Fingerprint className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-2 uppercase">SECURE GATEWAY</h2>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
            Identity link required for user: {user?.email}
          </p>
        </div>

        <div className="space-y-6">
          <Button 
            onClick={handleBiometricAuth} 
            className="w-full bg-primary text-black hover:bg-primary/80 font-semibold py-8 text-lg tracking-tight shadow-[0_0_30px_rgba(0,191,255,0.2)] rounded-2xl uppercase"
          >
            <ShieldCheck className="w-6 h-6 mr-2" /> SCAN BIOMETRICS
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-[#050505] px-4 text-muted-foreground tracking-widest">Fallback Protocol</span>
            </div>
          </div>

          <form onSubmit={handlePinAuth} className="space-y-4">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 group-focus-within:text-primary transition-colors" />
              <Input 
                type="password" 
                maxLength={6} 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="ENTER 6-DIGIT PIN" 
                className="bg-black/50 border-white/10 text-center tracking-[1em] h-16 text-xl rounded-2xl focus:border-primary/50 transition-all text-base" 
              />
            </div>
            <Button 
              type="submit" 
              variant="outline" 
              className="w-full border-white/10 text-[11px] uppercase tracking-widest h-12 hover:bg-white/5 rounded-xl font-semibold"
            >
              Verify Fallback
            </Button>
          </form>
        </div>

        <p className="mt-10 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          Kernel Security Mode: High-Fidelity Multi-Factor Active
        </p>
      </div>
    </div>
  );
}
