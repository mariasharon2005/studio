"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Smartphone, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { useAuth, initiateEmailSignUp, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

interface RegisterProps {
  onSuccess: () => void;
}

export default function Register({ onSuccess }: RegisterProps) {
  const auth = useAuth();
  const db = useFirestore();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Invalid Indian phone number';
    if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Initiate Firebase Sign Up (Non-blocking as per guidelines)
    try {
      initiateEmailSignUp(auth, formData.email, formData.password);
      
      // Note: In a real flow, we would use a listener for 'user' state 
      // which we already have in SentinelOps.tsx. 
      // We can also save additional user data to Firestore here if needed, 
      // but usually we'd do that in an onAuthStateChanged listener or Cloud Function.
      // For this MVP, we rely on the redirect in SentinelOps.
    } catch (err) {
      console.error("Auth initialization failed", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 cyber-grid">
      <div className="max-w-md w-full p-8 rounded-xl border border-primary/20 bg-black/80 backdrop-blur-md purple-glow">
        <div className="text-center mb-10">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 neon-text" />
          <h2 className="text-3xl font-headline text-white mb-2">INITIALIZE USER</h2>
          <p className="text-muted-foreground text-sm font-code">SECURE BIOMETRIC LINK ESTABLISHMENT</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <User className="absolute left-3 top-3 w-5 h-5 text-primary group-focus-within:text-secondary transition-colors" />
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-10 h-12 bg-black border-primary/30 focus:border-secondary transition-all"
              placeholder="Full Name"
            />
            {errors.name && <span className="text-[10px] text-destructive font-code absolute right-0 -bottom-4">{errors.name}</span>}
          </div>

          <div className="relative group">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-primary group-focus-within:text-secondary transition-colors" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 h-12 bg-black border-primary/30 focus:border-secondary transition-all"
              placeholder="Email Address"
            />
            {errors.email && <span className="text-[10px] text-destructive font-code absolute right-0 -bottom-4">{errors.email}</span>}
          </div>

          <div className="relative group">
            <Smartphone className="absolute left-3 top-3 w-5 h-5 text-primary group-focus-within:text-secondary transition-colors" />
            <div className="flex">
              <div className="flex items-center px-3 border-y border-l border-primary/30 bg-primary/5 text-primary font-code rounded-l-md">+91</div>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-3 h-12 bg-black border-primary/30 focus:border-secondary transition-all rounded-l-none"
                placeholder="Mobile Number"
              />
            </div>
            {errors.phone && <span className="text-[10px] text-destructive font-code absolute right-0 -bottom-4">{errors.phone}</span>}
          </div>

          <div className="relative group">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-primary group-focus-within:text-secondary transition-colors" />
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 h-12 bg-black border-primary/30 focus:border-secondary transition-all"
              placeholder="Access Key"
            />
            {errors.password && <span className="text-[10px] text-destructive font-code absolute right-0 -bottom-4">{errors.password}</span>}
          </div>

          <Button 
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:bg-primary/80 text-black font-headline tracking-widest text-lg transition-all transform hover:scale-[1.02]"
          >
            {isSubmitting ? 'ENCRYPTING...' : 'REGISTER MODULE'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground font-code">
          BY REGISTERING, YOU AGREE TO THE <span className="text-secondary cursor-pointer hover:underline">SENTINEL-OPS PROTOCOLS</span>.
        </p>
      </div>
    </div>
  );
}
