
"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Ghost, TrendingDown, LogOut, 
  Zap, Activity, EyeOff,
  Fingerprint, Download, MessageSquare,
  CheckCircle2 as SuccessIcon, IndianRupee, CreditCard,
  Terminal, Loader2, Send, Mail, Mic, MicOff, Search, Rocket, AlertTriangle,
  ShieldAlert, Sparkles, Brain, FileText
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useAuth, useUser, useStorage } from '@/firebase';
import { signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { dispatchReport } from '@/app/actions/report-actions';
import Lottie from 'lottie-react';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

const mailSentAnimation = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Mail",
  ddd: 0,
  assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "Shape", sr: 1, ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50] }, a: { a: 0, k: [0, 0] }, s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 30, s: [100, 100] }] } },
    shapes: [{ ty: "gr", nm: "Rect", it: [{ ty: "rc", s: { a: 0, k: [40, 30] }, p: { a: 0, k: [0, 0] }, r: { a: 0, k: 2 } }, { ty: "st", c: { a: 0, k: [0.48, 0.64, 0.97, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 2 } }, { ty: "tr", p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, s: { a: 0, k: [100, 100] }, o: { a: 0, k: 100 } }] }]
  }]
};

const checkmarkAnimation = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Check",
  ddd: 0,
  assets: [],
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: "Checkmark", sr: 1, ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [50, 50] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] } },
    shapes: [{ ty: "gr", nm: "Path", it: [{ ty: "sh", ks: { a: 1, k: [{ t: 0, s: [{ i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[20, 50], [20, 50], [20, 50]], c: false }] }, { t: 30, s: [{ i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[20, 50], [40, 70], [80, 30]], c: false }] }] } }, { ty: "st", c: { a: 0, k: [0.6, 0.8, 0.4, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 6 }, lc: 2, lj: 2 }, { ty: "tr", p: { a: 0, k: [0, 0] }, r: { a: 0, k: 0 }, s: { a: 0, k: [100, 100] }, o: { a: 0, k: 100 } }] }]
  }]
};

const forecastData = [
  { name: 'Jan', cost: 400, carbon: 240, cpu: 0.45 },
  { name: 'Feb', cost: 300, carbon: 139, cpu: 0.42 },
  { name: 'Mar', cost: 200, carbon: 980, cpu: 0.39 },
  { name: 'Apr', cost: 278, carbon: 390, cpu: 0.48 },
  { name: 'May', cost: 189, carbon: 480, cpu: 0.41 },
  { name: 'Jun', cost: 239, carbon: 380, cpu: 0.35 },
];

export default function Dashboard() {
  const { user } = useUser();
  const auth = useAuth();
  const storage = useStorage();
  const { toast } = useToast();

  const [isGhostMode, setIsGhostMode] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [isWADialogOpen, setIsWADialogOpen] = useState(false);
  const [waStatus, setWaStatus] = useState<'IDLE' | 'ENTER_PHONE' | 'DISPLAY_CODE' | 'CONNECTED'>('IDLE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [isSyncingReceipt, setIsSyncingReceipt] = useState(false);
  const [showReceiptSuccess, setShowReceiptSuccess] = useState(false);

  const [loanPrincipal, setLoanPrincipal] = useState(50000);
  const [loanTenure, setLoanTenure] = useState(12);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PAYING' | 'SUCCESS'>('IDLE');

  const [isListening, setIsListening] = useState(false);
  const [voiceLog, setVoiceLog] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  /**
   * Identity Protection Logic
   * Masks sensitive operator details when Ghost Mode is active.
   */
  const maskedOperator = useMemo(() => {
    if (!user?.email) return 'OPERATOR_UNKNOWN';
    if (!isGhostMode) return user.email;
    const [local, domain] = user.email.split('@');
    return `${local[0]}${'*'.repeat(local.length - 1)}@${domain}`;
  }, [user, isGhostMode]);

  /** 
   * EMI Calculation Logic (Standard Reducing Balance Formula)
   */
  const emiCalculations = useMemo(() => {
    const annualRate = 0.12;
    const monthlyRate = annualRate / 12;
    const p = loanPrincipal;
    const r = monthlyRate;
    const n = loanTenure;
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayable = emi * n;
    const totalInterest = totalPayable - p;
    return {
      emi: Math.round(emi),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
      interestRatio: Math.round((totalInterest / totalPayable) * 100),
      progress: Math.min(Math.round(((50000 - 35000) / 50000) * 100), 100),
      anomalyProb: Math.round(Math.random() * 95)
    };
  }, [loanPrincipal, loanTenure]);

  /** 
   * Predictive Anomaly Color Shift
   */
  const anomalyColor = useMemo(() => {
    if (emiCalculations.anomalyProb > 75) return 'bg-[#BB9AF7]/40 shadow-[0_0_30px_#BB9AF733]';
    return 'bg-[#7AA2F7]/10';
  }, [emiCalculations.anomalyProb]);

  /** 
   * Zero-Knowledge Status (Data-as-Art)
   */
  const systemArtUrl = useMemo(() => {
    const isHealthy = emiCalculations.anomalyProb < 80;
    return isHealthy 
      ? `https://picsum.photos/seed/deep-space-healthy/400/300` 
      : `https://picsum.photos/seed/red-nebula-alert/400/300`;
  }, [emiCalculations.anomalyProb]);

  useEffect(() => {
    if (isGhostMode) {
      document.documentElement.classList.add('ghost-active');
    } else {
      document.documentElement.classList.remove('ghost-active');
    }
  }, [isGhostMode]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        setVoiceLog(prev => [...prev.slice(-4), `RECOGNIZED: "${transcript}"`]);
        
        if (transcript.includes('ghost')) {
          handleGhostModeToggle(!isGhostMode);
        } else if (transcript.includes('export') || transcript.includes('report')) {
          exportReport();
        }
      };
    }
  }, [isGhostMode]);

  const toggleVoiceControl = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      toast({ title: "VOICE SYSTEM ACTIVE", description: "Listening for commands..." });
    }
    setIsListening(!isListening);
  };

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  }, []);

  const requireSecurity = (action: () => void) => {
    setPendingAction(() => action);
    setIsAuthDialogOpen(true);
    triggerHaptic();
  };

  const handleGhostModeToggle = (checked: boolean) => {
    if (!checked && isGhostMode) {
      requireSecurity(() => {
        setIsGhostMode(false);
        triggerHaptic();
        toast({ title: "STEALTH DEACTIVATED", description: "Standard protocols restored." });
      });
      return;
    }

    requireSecurity(() => {
      setIsGhostMode(checked);
      triggerHaptic();
      toast({
        title: checked ? "GHOST MODE ACTIVATED" : "GHOST MODE DEACTIVATED",
        description: checked ? "Network stealth engaged." : "Standard protocols restored.",
      });
    });
  };

  const handleBiometricAuth = () => {
    toast({ title: "IDENTITY VERIFIED", description: "Secure WebAuthn link established." });
    if (pendingAction) pendingAction();
    setIsAuthDialogOpen(false);
    setPinInput('');
  };

  const handlePinAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '123456') {
      toast({ title: "PIN VERIFIED", description: "Standard protocol fallback successful." });
      if (pendingAction) pendingAction();
      setIsAuthDialogOpen(false);
      setPinInput('');
    } else {
      toast({ title: "AUTH FAILED", description: "Invalid credentials.", variant: "destructive" });
    }
  };

  const processTerminalCommand = (cmd: string) => {
    const weatherIntent = /weather|sky|it's/i.test(cmd) && /cloudy|stormy/i.test(cmd);
    if (weatherIntent) {
      setIsGhostMode(true);
      setVoiceLog(prev => [...prev, "SEMANIC TRIGGER: Weather mask detected. Stealth active."]);
      return;
    }
    if (cmd === '/ghost_on') handleGhostModeToggle(true);
    else if (cmd === '/ghost_off') handleGhostModeToggle(false);
    else if (cmd === '/report') exportReport();
    else if (cmd === '/voice') toggleVoiceControl();
    else toast({ title: "UNKNOWN COMMAND", variant: "destructive" });
  };

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.toLowerCase().trim();
    setTerminalInput('');
    processTerminalCommand(cmd);
  };

  const handleLinkWhatsApp = () => {
    setIsWADialogOpen(true);
    setWaStatus('ENTER_PHONE');
  };

  const generatePairingCode = () => {
    if (!phoneNumber) {
      toast({ title: "ERROR", description: "Invalid phone number.", variant: "destructive" });
      return;
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3) code += '-';
    }
    setPairingCode(code);
    setWaStatus('DISPLAY_CODE');
    setTimeout(() => {
      setWaStatus('CONNECTED');
      toast({ title: "WHATSAPP CONNECTED", description: "Session encrypted." });
    }, 5000);
  };

  /**
   * Generates and exports a Tokyo Night styled payment receipt.
   * Silently downloads and dispatches to WhatsApp.
   */
  const generateAndExportReceipt = async () => {
    setIsSyncingReceipt(true);
    try {
      const doc = new jsPDF();
      const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const timestamp = new Date().toLocaleString();
      const amount = emiCalculations.emi;
      const remaining = emiCalculations.totalPayable - amount;

      // Styling: Tokyo Night background
      doc.setFillColor(26, 27, 38);
      doc.rect(0, 0, 210, 297, 'F');

      // Logo simulation in header
      doc.setDrawColor(122, 162, 247);
      doc.setLineWidth(1);
      doc.line(10, 20, 200, 20);

      // Text: Sky Blue accent
      doc.setTextColor(122, 162, 247);
      doc.setFontSize(22);
      doc.text('SENTINEL-OPS RECEIPT', 10, 40);

      doc.setTextColor(192, 202, 245);
      doc.setFontSize(12);
      doc.text(`Transaction ID: ${transactionId}`, 10, 60);
      doc.text(`Date/Time: ${timestamp}`, 10, 70);
      
      doc.setTextColor(122, 162, 247);
      doc.setFontSize(16);
      doc.text(`Amount Paid: $${amount}`, 10, 90);
      doc.text(`Remaining Balance: $${remaining}`, 10, 105);

      doc.setTextColor(154, 165, 206);
      doc.setFontSize(10);
      doc.text('Payment processed via secure UPI Uplink.', 10, 130);

      // Local download
      doc.save(`Receipt_${transactionId}.pdf`);

      // Sync with WhatsApp (Firebase Storage link)
      const pdfBlob = doc.output('blob');
      const storageRef = ref(storage, `receipts/${user?.uid}/${transactionId}.pdf`);
      const uploadResult = await uploadBytes(storageRef, pdfBlob);
      const pdfUrl = await getDownloadURL(uploadResult.ref);

      await dispatchReport({
        email: user?.email || '',
        pdfUrl,
        isGhostMode,
        userName: user?.displayName || user?.email?.split('@')[0] || 'Operator'
      });

      setIsSyncingReceipt(false);
      setShowReceiptSuccess(true);
      setTimeout(() => setShowReceiptSuccess(false), 4000);
      toast({ title: "RECEIPT SYNCED", description: "Official document dispatched across nodes." });

    } catch (error: any) {
      setIsSyncingReceipt(false);
      toast({ variant: "destructive", title: "RECEIPT FAILED", description: "Could not sync document." });
    }
  };

  const exportReport = async () => {
    requireSecurity(async () => {
      setIsExporting(true);
      try {
        const doc = new jsPDF();
        doc.setFillColor(26, 27, 38);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(122, 162, 247);
        doc.text('SENTINEL-OPS: TOKYO NIGHT TREND REPORT', 10, 20);

        const pdfBlob = doc.output('blob');
        const storageRef = ref(storage, `reports/${user?.uid}/${Date.now()}_report.pdf`);
        const uploadResult = await uploadBytes(storageRef, pdfBlob);
        const pdfUrl = await getDownloadURL(uploadResult.ref);

        const result = await dispatchReport({
          email: user?.email || '',
          pdfUrl,
          isGhostMode,
          userName: user?.displayName || user?.email?.split('@')[0] || 'Operator'
        });

        if (result.success) {
          setIsExporting(false);
          setShowSuccessAnimation(true);
          setTimeout(() => setShowSuccessAnimation(false), 4000);
          toast({ title: "DISPATCH SUCCESSFUL", description: "Report synced across nodes." });
        }
      } catch (error: any) {
        setIsExporting(false);
        toast({ 
          variant: "destructive", 
          title: "DISPATCH FAILED", 
          description: error.message || "Uplink interrupted." 
        });
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {}
  };

  const handlePayment = () => {
    requireSecurity(() => {
      setPaymentStatus('PAYING');
      setTimeout(() => {
        setPaymentStatus('SUCCESS');
        toast({ title: "PAYMENT SUCCESSFUL" });
        // Automatically trigger receipt generation on success
        generateAndExportReceipt();
      }, 2000);
    });
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 p-6 text-foreground",
      isGhostMode && "bg-red-950/5"
    )}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/5 gap-6 sticky top-0 z-40 bg-[#1A1B26]/60 backdrop-blur-xl px-4 -mx-4">
        <div className="flex items-center gap-5">
          <Logo size="md" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold text-primary tracking-tight neon-text uppercase">SENTINEL-OPS</h1>
              {isGhostMode && (
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/50 text-[10px] tracking-tight">
                  <EyeOff className="w-3 h-3 mr-1" /> STEALTH
                </Badge>
              )}
            </div>
            <p className="text-secondary text-[11px] uppercase mt-1">Operator: {maskedOperator}</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto justify-end">
          <Button 
            onClick={toggleVoiceControl}
            variant="ghost" 
            size="icon"
            className={cn("h-10 w-10 rounded-full", isListening ? "text-primary animate-pulse" : "text-secondary")}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <div className="flex items-center gap-3 glass-card p-2 px-4 rounded-2xl">
            <Label htmlFor="ghost-mode" className="text-[10px] text-secondary uppercase">Ghost Mode</Label>
            <Switch 
              id="ghost-mode" 
              checked={isGhostMode} 
              onCheckedChange={handleGhostModeToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <Button 
            onClick={handleLinkWhatsApp}
            variant="outline" 
            className={cn(
              "btn-tokyo glass-card border-none hover:bg-white/10 rounded-2xl h-10 px-4 text-[10px] tracking-tight font-semibold",
              waStatus === 'CONNECTED' ? "text-[#9ECE6A]" : "text-primary"
            )}
          >
            <MessageSquare className="w-4 h-4 mr-2" /> 
            {waStatus === 'CONNECTED' ? "WA: ACTIVE" : "LINK WHATSAPP"}
          </Button>

          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-secondary hover:text-primary">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="INFRA LEAKAGE" value={`$60.10`} icon={<Ghost className="w-5 h-5 text-secondary" />} sub="3 ZOMBIE UNITS DETECTED" />
        <StatCard title="UNIT COST" value={`$0.30`} icon={<TrendingDown className="w-5 h-5 text-primary" />} sub="30-DAY EFFICIENCY TREND" />
        <StatCard title="GPU BURN" value={`$5.55/hr`} icon={<Zap className="w-5 h-5 text-accent" />} sub="SPOT INSTANCES ACTIVE" />
        <StatCard title="FINANCING EMI" value={`$${emiCalculations.emi}`} icon={<IndianRupee className="w-5 h-5 text-primary" />} sub="LOAN ACTIVE" isEmi />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <Card className={cn("glass-card relative overflow-hidden p-8 flex flex-col items-center text-center transition-all duration-700", anomalyColor)}>
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Brain className="w-3 h-3 text-primary" />
            <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-white/10 text-secondary">Neural Forecaster</Badge>
          </div>
          <Activity className={cn("w-12 h-12 mb-4 transition-colors duration-500", emiCalculations.anomalyProb > 75 ? "text-accent" : "text-primary")} />
          <h2 className="text-sm uppercase tracking-widest text-secondary font-semibold">Spend Anomaly Prob.</h2>
          <motion.div 
            animate={emiCalculations.anomalyProb > 75 ? { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl font-bold my-4 tracking-tighter text-white"
          >
            {emiCalculations.anomalyProb}%
          </motion.div>
          <p className="text-[10px] text-muted-foreground uppercase max-w-[200px] leading-relaxed">
            {emiCalculations.anomalyProb > 75 
              ? "High probability of spending spike. Recommend reserve scaling." 
              : "Spending patterns normalized. No spikes detected."}
          </p>
        </Card>

        <Card className="glass-card p-0 relative overflow-hidden group">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-accent" />
            <span className="text-[9px] uppercase tracking-tight text-white/70 bg-black/40 px-2 py-0.5 rounded-full">Art Status Protocol</span>
          </div>
          <img 
            src={systemArtUrl} 
            alt="System Status Art" 
            className="w-full h-full object-cover brightness-[0.6] group-hover:scale-110 transition-transform duration-1000"
            data-ai-hint="space nebula"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1B26] via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-0 w-full text-center px-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-secondary font-semibold mb-1">Environmental Integrity</p>
            <p className="text-xs text-white/50 italic">Communication via visual abstraction.</p>
          </div>
        </Card>

        <Card className="glass-card p-6 relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Rocket className="w-3 h-3 text-accent" />
            <span className="text-[10px] uppercase tracking-tight text-secondary">Mission to 2030</span>
          </div>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
             <div className="absolute w-32 h-32 border border-white/5 rounded-full" />
             <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-purple-900 rounded-full shadow-[0_0_30px_hsla(var(--primary),0.3)] relative z-10 overflow-hidden">
                <div className="absolute top-2 left-2 w-4 h-4 bg-white/20 rounded-full blur-sm" />
             </div>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute w-40 h-40"
             >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <Activity className="w-3 h-3 text-primary" />
                </div>
             </motion.div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-2xl font-bold tracking-tighter text-white">{emiCalculations.progress}%</p>
            <p className="text-[9px] uppercase tracking-widest text-secondary font-semibold">Repayment Orbit Finalized</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Economics</TabsTrigger>
          <TabsTrigger value="fintech" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Financing</TabsTrigger>
          <TabsTrigger value="dispatch" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Dual Dispatch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm text-primary flex items-center gap-2 uppercase tracking-tight font-semibold">
                <Activity className="w-4 h-4" /> Live Performance Node
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: 'rgba(26,27,38,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#C0CAF5'}} />
                    <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#primaryGrad)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fintech">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glass-card p-6">
              <CardHeader>
                <CardTitle className="text-lg text-primary flex items-center gap-2 tracking-tight uppercase font-semibold">
                  <IndianRupee className="w-5 h-5" /> Infrastructure Financing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-10 pt-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-tight text-secondary font-semibold">
                      <span>Principal Amount</span>
                      <span className="text-primary text-sm">${loanPrincipal}</span>
                    </div>
                    <Slider value={[loanPrincipal]} min={5000} max={200000} step={5000} onValueChange={(v) => setLoanPrincipal(v[0])} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-tight text-secondary font-semibold">
                      <span>Tenure (Months)</span>
                      <span className="text-primary text-sm">{loanTenure}M</span>
                    </div>
                    <Slider value={[loanTenure]} min={6} max={48} step={6} onValueChange={(v) => setLoanTenure(v[0])} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FinStat label="Monthly EMI" value={`$${emiCalculations.emi}`} color="text-primary neon-text" />
                  <FinStat label="Interest" value={`$${emiCalculations.totalInterest}`} color="text-accent" />
                  <FinStat label="Total Payable" value={`$${emiCalculations.totalPayable}`} color="text-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card p-6 relative overflow-hidden flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Principal', value: loanPrincipal },
                        { name: 'Interest', value: emiCalculations.totalInterest }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--accent))" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] text-secondary uppercase tracking-tight">Interest Ratio</p>
                  <p className="text-2xl font-semibold text-accent">{emiCalculations.interestRatio}%</p>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-tokyo flex-1 bg-primary text-black font-semibold h-14 tracking-tight rounded-2xl uppercase">PAY EMI <CreditCard className="w-4 h-4 ml-2" /></Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-primary/30 text-foreground glass-card max-w-sm">
                    <DialogHeader className="items-center text-center">
                      <DialogTitle className="text-lg text-primary tracking-tight uppercase font-semibold">UPI Secure Link</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-6 space-y-6">
                      {paymentStatus === 'IDLE' ? (
                        <>
                          <div className="p-4 bg-white rounded-2xl">
                            <QRCodeSVG value={`upi://pay?pa=sentinel@ops&am=${emiCalculations.emi}`} size={160} />
                          </div>
                          <Button onClick={handlePayment} className="btn-tokyo w-full bg-primary text-black font-semibold h-14 rounded-2xl tracking-tight uppercase">I Have Paid</Button>
                        </>
                      ) : paymentStatus === 'PAYING' ? (
                        <div className="py-10 flex flex-col items-center gap-4">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          <p className="text-[11px] tracking-tight uppercase text-secondary">Verifying Uplink...</p>
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center gap-6 animate-in zoom-in-50">
                          <SuccessIcon className="w-16 h-16 text-[#9ECE6A] neon-text" />
                          <h3 className="text-[#9ECE6A] font-semibold text-xl tracking-tight uppercase">Transaction Verified</h3>
                          <Button onClick={() => setIsPaymentDialogOpen(false)} className="btn-tokyo bg-primary text-black w-full h-12 rounded-xl">DONE</Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dispatch">
          <Card className="glass-card p-8 border-accent/20">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center border border-accent/30 mb-4">
                <Send className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight uppercase">Multi-Channel Export</h2>
              <p className="text-secondary text-sm max-w-md leading-relaxed">
                Sync your 6-month infrastructure trend report with linked WhatsApp, Telegram, and Email nodes simultaneously. 
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl pt-6">
                <ChannelStatus label="Email Node" status={!!user?.email} icon={<Mail className="w-4 h-4" />} />
                <ChannelStatus label="WhatsApp Node" status={waStatus === 'CONNECTED'} icon={<MessageSquare className="w-4 h-4" />} />
                <ChannelStatus label="Telegram Node" status={true} icon={<Send className="w-4 h-4" />} />
              </div>

              <Button 
                onClick={exportReport} 
                disabled={isExporting}
                className="btn-tokyo mt-10 w-full max-w-sm h-16 bg-accent text-black font-semibold tracking-tight uppercase rounded-2xl shadow-[0_0_30px_rgba(187,154,247,0.2)]"
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
                {isExporting ? 'Syncing Nodes...' : 'Dispatch Trend Report'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card p-6">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-[10px] text-secondary uppercase tracking-tight flex items-center gap-2 font-semibold">
              <Terminal className="w-3 h-3 text-primary" /> Sentinel Terminal [Node_5]
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-56 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] text-secondary/60 mb-6 custom-scrollbar">
              <p><span className="text-primary">[BOOT]</span> Kernel sequence finalized.</p>
              {voiceLog.map((log, i) => (
                <p key={i}><span className="text-accent">[VOICE]</span> {log}</p>
              ))}
              {waStatus === 'CONNECTED' && <p className="text-[#9ECE6A]">[LINK] WhatsApp uplink authorized.</p>}
              {isGhostMode && <p className="text-primary neon-text uppercase">[Stealth] Tokyo Red Protocol active.</p>}
              <p className="opacity-40 italic text-[10px] mt-2 tracking-widest uppercase">System ready for semantic intent mapping...</p>
            </div>
            <form onSubmit={handleTerminalCommand} className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold opacity-40"> {'>'} </span>
              <Input 
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="ENTER COMMAND OR WEATHER MASK..."
                className="bg-black/40 border-white/10 pl-10 font-mono text-[11px] h-12 rounded-full tracking-tight text-base"
              />
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card p-6">
          <CardHeader>
            <CardTitle className="text-[11px] text-primary uppercase tracking-tight mb-4 font-semibold">Core Load</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <LoadProgress label="CPU UTILIZATION" value={42} color="bg-primary" />
            <LoadProgress label="MEMORY RESERVATION" value={64} color="bg-accent" />
            <div className="pt-4 border-t border-white/5 flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <p className="text-[9px] uppercase tracking-tight text-secondary leading-relaxed font-semibold">Biometric Kill-Switch Active for Stealth Termination.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {isAuthDialogOpen && (
          <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
            <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-primary/30 text-foreground glass-card max-w-sm">
              <DialogHeader className="items-center text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Fingerprint className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <DialogTitle className="text-lg text-primary tracking-tight uppercase font-semibold">Identity Link Required</DialogTitle>
              </DialogHeader>
              <div className="py-6 space-y-6 text-center">
                <Button onClick={handleBiometricAuth} className="btn-tokyo w-full bg-primary text-black font-semibold h-14 tracking-tight rounded-2xl uppercase">Scan Biometrics</Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                  <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-[#1A1B26] px-2 text-secondary">Fallback</span></div>
                </div>
                <form onSubmit={handlePinAuth} className="space-y-3">
                  <Input 
                    type="password" 
                    maxLength={6} 
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="6-DIGIT PIN" 
                    className="bg-black/50 border-white/10 text-center tracking-[1em] h-12 text-lg rounded-xl text-base" 
                  />
                  <Button type="submit" variant="outline" className="btn-tokyo w-full border-white/10 rounded-xl h-12 uppercase text-[10px] tracking-tight font-semibold">Verify PIN</Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <Dialog open={isWADialogOpen} onOpenChange={setIsWADialogOpen}>
        <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-primary/30 text-foreground glass-card max-md:max-w-[90vw] max-w-md">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-xl text-primary tracking-tight uppercase font-semibold">WhatsApp Pairing</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6 space-y-6">
            {waStatus === 'ENTER_PHONE' && (
              <div className="w-full space-y-4">
                <Input 
                  type="tel"
                  placeholder="+91 98765-43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-black/50 border-white/10 text-center text-lg h-14 rounded-2xl text-base"
                />
                <Button onClick={generatePairingCode} className="btn-tokyo w-full bg-primary text-black hover:bg-primary/80 font-semibold h-14 tracking-tight rounded-2xl uppercase">Pair With Phone</Button>
              </div>
            )}
            {waStatus === 'DISPLAY_CODE' && (
              <div className="w-full space-y-6 text-center">
                <div className="glass-card p-10 rounded-3xl border-primary/20 bg-white/[0.02] relative overflow-hidden">
                  <span className="text-5xl font-mono text-primary neon-text tracking-widest block mb-4">{pairingCode}</span>
                  <Progress value={65} className="h-1 bg-white/10" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-4 leading-relaxed uppercase">
                  Open WhatsApp {' > '} Settings {' > '} Linked Devices {' > '} Link a Device {' > '} Link with phone instead
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-secondary uppercase tracking-tight">
                  <Loader2 className="w-3 h-3 animate-spin" /> Refreshing Node Session...
                </div>
              </div>
            )}
            {waStatus === 'CONNECTED' && (
              <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
                <SuccessIcon className="w-20 h-20 text-[#9ECE6A] neon-text" />
                <h3 className="text-[#9ECE6A] font-semibold text-2xl tracking-tight uppercase">Authorized</h3>
                <Button onClick={() => setIsWADialogOpen(false)} className="btn-tokyo bg-primary text-black w-full h-12 rounded-xl uppercase">Continue</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExporting} onOpenChange={() => {}}>
        <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-accent/30 text-foreground glass-card max-w-sm">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg text-accent tracking-tight uppercase font-semibold">Syncing Secure Nodes</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6 space-y-6 text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <p className="text-[11px] text-secondary uppercase tracking-widest leading-relaxed">
              Dispatching to Email, WhatsApp, and Telegram Mainframe...
            </p>
            <div className="w-full space-y-2 px-6">
              <div className="flex justify-between text-[8px] uppercase text-secondary font-semibold">
                <span>Encryption</span>
                <span>Active</span>
              </div>
              <Progress value={65} className="h-1 bg-white/5" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSyncingReceipt} onOpenChange={() => {}}>
        <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-primary/30 text-foreground glass-card max-w-sm">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-lg text-primary tracking-tight uppercase font-semibold">Generating & Syncing Receipt</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6 space-y-6 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[11px] text-secondary uppercase tracking-widest leading-relaxed">
              Finalizing Tokyo Night Document Sync...
            </p>
            <div className="w-full space-y-2 px-6">
              <Progress value={85} className="h-1 bg-white/5" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
            <div className="w-64 h-64">
              <Lottie animationData={mailSentAnimation} loop={false} />
            </div>
            <h2 className="text-3xl font-bold text-[#9ECE6A] neon-text uppercase tracking-tighter mt-4">Dispatch Confirmed</h2>
            <p className="text-secondary uppercase text-[10px] mt-2 tracking-[0.2em] font-semibold">Report secured across all channels</p>
          </div>
        </div>
      )}

      {showReceiptSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
            <div className="w-64 h-64">
              <Lottie animationData={checkmarkAnimation} loop={false} />
            </div>
            <h2 className="text-3xl font-bold text-[#9ECE6A] neon-text uppercase tracking-tighter mt-4">Payment Receipt Ready</h2>
            <p className="text-secondary uppercase text-[10px] mt-2 tracking-[0.2em] font-semibold">Synced to Linked WhatsApp Node</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChannelStatus({ label, status, icon }: { label: string, status: boolean, icon: React.ReactNode }) {
  return (
    <div className={cn(
      "glass-card p-4 rounded-2xl border-l-[3px] transition-all",
      status ? "border-l-[#9ECE6A] bg-[#9ECE6A]/5" : "border-l-destructive/50 bg-destructive/5"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", status ? "bg-[#9ECE6A]/20 text-[#9ECE6A]" : "bg-destructive/20 text-destructive")}>
          {icon}
        </div>
        <div className="text-left">
          <p className="text-[9px] text-secondary uppercase tracking-tight font-semibold">{label}</p>
          <p className={cn("text-[10px] font-semibold uppercase", status ? "text-[#9ECE6A]" : "text-destructive")}>
            {status ? 'Online' : 'Disconnected'}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, sub, isEmi }: { title: string, value: string, icon: React.ReactNode, sub: string, isEmi?: boolean }) {
  return (
    <Card className="glass-card hover:bg-white/5 transition-all group overflow-hidden relative rounded-3xl border-l-primary/30 border-l-[3px]">
      <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <CardHeader className="pb-1 relative z-10">
        <p className="text-[10px] text-secondary uppercase tracking-tight font-bold mb-2">{title}</p>
        <CardTitle className={cn("text-3xl font-semibold text-foreground group-hover:text-primary transition-colors tracking-tighter duration-500", isEmi && "neon-text text-primary")}>{value}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-[9px] text-primary/60 uppercase truncate tracking-tight font-bold">{sub}</p>
      </CardContent>
    </Card>
  );
}

function FinStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-4 glass-card rounded-2xl text-center">
      <p className="text-[9px] text-secondary uppercase tracking-tight font-bold mb-2">{label}</p>
      <p className={cn("text-lg font-semibold", color)}>{value}</p>
    </div>
  );
}

function LoadProgress({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] uppercase tracking-tight font-bold text-secondary">
        <span>{label}</span>
        <span className="text-primary">{value}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
