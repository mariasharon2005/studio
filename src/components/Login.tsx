"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface LoginProps {
  onSuccess: () => void;
  onToggleRegister: () => void;
}

export default function Login({ onSuccess, onToggleRegister }: LoginProps) {
  const auth = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "AUTH ERROR",
        description: "Please provide both email and access key.",
      });
      return;
    }

    setIsSubmitting(true);
    
    initiateEmailSignIn(auth, formData.email, formData.password)
      .then(() => {
        toast({
          title: "ACCESS GRANTED",
          description: "Sentinel session established.",
        });
        onSuccess();
      })
      .catch((error: any) => {
        setIsSubmitting(false);
        let description = "Invalid credentials or system rejection.";
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          description = "Access denied. Credentials do not match our secure records.";
        }

        toast({
          variant: "destructive",
          title: "AUTHENTICATION FAILED",
          description: description,
        });
      });
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 cyber-grid relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] animate-pulse-slow delay-700"></div>

      <div className="max-w-md w-full p-8 rounded-xl border border-primary/20 bg-black/80 backdrop-blur-md shadow-[0_0_50px_rgba(0,191,255,0.1)] z-10">
        <div className="text-center mb-10">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 neon-text" />
          <h2 className="text-3xl font-headline text-white mb-2 tracking-widest">SENTINEL LOGIN</h2>
          <p className="text-muted-foreground text-[10px] font-code uppercase tracking-[0.2em]">Secure Entry Gateway</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-primary group-focus-within:text-secondary transition-colors" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 h-12 bg-black/50 border-primary/30 focus:border-secondary transition-all rounded-lg text-sm"
              placeholder="Email Address"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-primary group-focus-within:text-secondary transition-colors" />
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 h-12 bg-black/50 border-primary/30 focus:border-secondary transition-all rounded-lg text-sm"
              placeholder="Access Key"
            />
          </div>

          <Button 
            disabled={isSubmitting}
            className="w-full h-12 bg-primary text-black font-headline tracking-widest text-sm transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,191,255,0.3)] rounded-lg"
          >
            {isSubmitting ? 'VERIFYING...' : 'ESTABLISH LINK'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onToggleRegister}
            className="text-[10px] text-muted-foreground font-code uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center mx-auto gap-2"
          >
            <UserPlus className="w-3 h-3" /> New User? Initialize Module
          </button>
        </div>
      </div>
    </div>
  );
}
