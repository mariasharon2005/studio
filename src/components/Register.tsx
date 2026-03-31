"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Smartphone, Mail, Lock, ArrowRight, User, LogIn } from 'lucide-react';
import { useAuth, initiateEmailSignUp, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

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
          description = "This email is already registered in the Sentinel network.";
        } else if (error.code === 'auth/invalid-email') {
          description = "The provided email address is malformed.";
        } else if (error.code === 'auth/weak-password') {
          description = "The access key is too weak for encryption protocols.";
        }

        toast({
          variant: "destructive",
          title: "INITIALIZATION FAILED",
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
          <h2 className="text-3xl font-headline text-white mb-2 tracking-widest">INITIALIZE USER</h2>
          <p className="text-muted-foreground text-[10px] font-code uppercase tracking-[0.2em]">Secure Biometric Link Establishment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <User className="absolute left-3 top-3 w-5 h-5 text-primary group-focus-within:text-secondary transition-colors" />
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-10 h-12 bg-black/50 border-primary/30 focus:border-secondary transition-all rounded-lg text-sm"
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
              className="pl-10 h-12 bg-black/50 border-primary/30 focus:border-secondary transition-all rounded-lg text-sm"
              placeholder="Email Address"
            />
            {errors.email && <span className="text-[10px] text-destructive font-code absolute right-0 -bottom-4">{errors.email}</span>}
          </div>

          <div className="relative group">
            <Smartphone className="absolute left-3 top-3 w-5 h-5 text-primary group-focus-within:text-secondary transition-colors" />
            <div className="flex">
              <div className="flex items-center px-3 border-y border-l border-primary/30 bg-primary/5 text-primary font-code rounded-l-lg text-xs">+91</div>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-3 h-12 bg-black/50 border-primary/30 focus:border-secondary transition-all rounded-l-none rounded-r-lg text-sm"
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
              className="pl-10 h-12 bg-black/50 border-primary/30 focus:border-secondary transition-all rounded-lg text-sm"
              placeholder="Access Key"
            />
            {errors.password && <span className="text-[10px] text-destructive font-code absolute right-0 -bottom-4">{errors.password}</span>}
          </div>

          <Button 
            disabled={isSubmitting}
            className="w-full h-12 bg-primary text-black font-headline tracking-widest text-sm transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,191,255,0.3)] rounded-lg"
          >
            {isSubmitting ? 'ENCRYPTING...' : 'REGISTER MODULE'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onToggleLogin}
            className="text-[10px] text-muted-foreground font-code uppercase tracking-widest hover:text-primary transition-colors flex items-center justify-center mx-auto gap-2"
          >
            <LogIn className="w-3 h-3" /> Already registered? Access Secure Link
          </button>
        </div>
      </div>
    </div>
  );
}
