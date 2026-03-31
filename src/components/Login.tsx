"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Logo from './Logo';

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-md w-full p-10 rounded-3xl z-10 glass-card">
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size="lg" className="mb-6" />
          <h2 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">SENTINEL LOGIN</h2>
          <p className="text-secondary text-[11px] uppercase tracking-widest">Accessing Mainframe...</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-accent transition-colors" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-12 h-14 bg-black/50 border-white/10 focus:border-primary transition-all rounded-2xl text-base tracking-tight"
              placeholder="System Email"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary group-focus-within:text-accent transition-colors" />
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-12 h-14 bg-black/50 border-white/10 focus:border-primary transition-all rounded-2xl text-base tracking-tight"
              placeholder="Encryption Key"
            />
          </div>

          <Button 
            disabled={isSubmitting}
            className="btn-tokyo w-full h-14 bg-primary text-black font-semibold tracking-tight uppercase shadow-[0_0_30px_rgba(122,162,247,0.2)] rounded-2xl"
          >
            {isSubmitting ? 'DECRYPTING...' : 'ESTABLISH LINK'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={onToggleRegister}
            className="text-[11px] text-secondary uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center mx-auto gap-2 font-semibold"
          >
            <UserPlus className="w-3 h-3" /> New Node? Initialize Module
          </button>
        </div>
      </div>
    </div>
  );
}
