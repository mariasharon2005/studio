"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, Mail, Lock, ArrowRight, User, LogIn } from 'lucide-react';
import { useAuth, initiateEmailSignUp, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import Logo from './Logo';

interface RegisterProps {
  onSuccess: () => void;
  onToggleLogin: () => void;
}

export default function Register({ onSuccess, onToggleLogin }: RegisterProps) {
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!formData.name) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return false;
    if (!/^[6-9]\d{9}$/.test(formData.phone)) return false;
    if (formData.password.length < 8) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    initiateEmailSignUp(auth, formData.email, formData.password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userRef = doc(db, 'users', user.uid);
        
        setDocumentNonBlocking(userRef, {
          id: user.uid,
          email: formData.email,
          phoneNumber: formData.phone,
          firstName: formData.name.split(' ')[0],
          lastName: formData.name.split(' ').slice(1).join(' '),
          registrationDate: new Date().toISOString()
        }, { merge: true });
        
        toast({
          title: "REGISTRATION SUCCESSFUL",
          description: "Sentinel profile initialized and encrypted.",
        });
        onSuccess();
      })
      .catch((error: any) => {
        setIsSubmitting(false);
        let description = "Could not initialize user module.";
        if (error.code === 'auth/email-already-in-use') {
          description = "Email already linked to the Sentinel network.";
        }
        toast({
          variant: "destructive",
          title: "INITIALIZATION FAILED",
          description: description,
        });
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="max-w-md w-full p-10 rounded-3xl z-10 glass-card">
        <div className="text-center mb-10 flex flex-col items-center">
          <Logo size="lg" className="mb-6" />
          <h2 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">INITIALIZE NODE</h2>
          <p className="text-secondary text-[11px] uppercase tracking-widest">Establishing secure link...</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors" />
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-12 h-14 bg-black/50 border-white/10 focus:border-primary transition-all rounded-2xl text-base tracking-tight"
              placeholder="Operator Identity"
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-12 h-14 bg-black/50 border-white/10 focus:border-primary transition-all rounded-2xl text-base tracking-tight"
              placeholder="Secure Email"
            />
          </div>

          <div className="relative group">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors" />
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="pl-12 h-14 bg-black/50 border-white/10 focus:border-primary transition-all rounded-2xl text-base tracking-tight"
              placeholder="Mobile Uplink"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary transition-colors" />
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
            {isSubmitting ? 'ENCRYPTING...' : 'REGISTER NODE'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={onToggleLogin}
            className="text-[11px] text-secondary uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center mx-auto gap-2 font-semibold"
          >
            <LogIn className="w-3 h-3" /> Node existing? Resume session
          </button>
        </div>
      </div>
    </div>
  );
}
