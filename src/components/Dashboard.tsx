
"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Ghost, TrendingDown, LogOut, 
  Zap, Activity, EyeOff,
  Fingerprint, Download, MessageSquare,
  CheckCircle2 as SuccessIcon, IndianRupee, CreditCard,
  Terminal, Loader2, Send, Mail
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

// Dummy Lottie for "Mail Sent" simulation
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
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  const [isWADialogOpen, setIsWADialogOpen] = useState(false);
  const [waStatus, setWaStatus] = useState<'IDLE' | 'ENTER_PHONE' | 'DISPLAY_CODE' | 'CONNECTED'>('IDLE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [qrRefreshTimer, setQrRefreshTimer] = useState(20);

  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [loanPrincipal, setLoanPrincipal] = useState(50000);
  const [loanTenure, setLoanTenure] = useState(12);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PAYING' | 'SUCCESS'>('IDLE');

  const annualRate = 0.12;
  const monthlyRate = annualRate / 12;

  const emiCalculations = useMemo(() => {
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
      interestRatio: Math.round((totalInterest / totalPayable) * 100)
    };
  }, [loanPrincipal, loanTenure]);

  useEffect(() => {
    if (isGhostMode) {
      document.documentElement.classList.add('ghost-active');
    } else {
      document.documentElement.classList.remove('ghost-active');
    }
  }, [isGhostMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (waStatus === 'DISPLAY_CODE') {
      interval = setInterval(() => {
        setQrRefreshTimer((prev) => {
          if (prev <= 1) {
            setPairingCode(generateRandomCode());
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [waStatus]);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  }, []);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3) code += '-';
    }
    return code;
  };

  const requireSecurity = (action: () => void) => {
    setPendingAction(() => action);
    setIsAuthDialogOpen(true);
    triggerHaptic();
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

  const handleGhostModeToggle = (checked: boolean) => {
    requireSecurity(() => {
      setIsGhostMode(checked);
      triggerHaptic();
      toast({
        title: checked ? "GHOST MODE ACTIVATED" : "GHOST MODE DEACTIVATED",
        description: checked ? "Network stealth engaged." : "Standard protocols restored.",
      });
    });
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
    setPairingCode(generateRandomCode());
    setWaStatus('DISPLAY_CODE');
    
    setTimeout(() => {
      setWaStatus('CONNECTED');
      toast({ title: "WHATSAPP CONNECTED", description: "Session encrypted." });
    }, 5000);
  };

  const exportReport = async () => {
    requireSecurity(async () => {
      setIsExporting(true);
      
      const doc = new jsPDF();
      doc.setFillColor(26, 27, 38);
      doc.rect(0, 0, 210, 297, 'F');
      doc.setTextColor(122, 162, 247);
      doc.setFontSize(22);
      doc.text('SENTINEL-OPS: TOKYO NIGHT TREND REPORT', 10, 20);
      doc.setTextColor(192, 202, 245);
      doc.setFontSize(10);
      doc.text(`Operator: ${user?.email}`, 10, 30);
      doc.text(`Infrastructure Leakage Detected: $60.10`, 10, 40);
      doc.text(`Financing Principal: $${loanPrincipal}`, 10, 50);
      doc.text(`Monthly EMI: $${emiCalculations.emi}`, 10, 60);

      const pdfBlob = doc.output('blob');
      
      try {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `reports/${user?.uid}/${Date.now()}_report.pdf`);
        const uploadResult = await uploadBytes(storageRef, pdfBlob);
        const pdfUrl = await getDownloadURL(uploadResult.ref);

        // Dispatch via Server Action
        await dispatchReport({
          email: user?.email || '',
          pdfUrl,
          isGhostMode,
          userName: user?.displayName || user?.email?.split('@')[0] || 'Operator'
        });

        setIsExporting(false);
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 4000);

        toast({ title: "DISPATCH SUCCESSFUL", description: "Report synced with Email & WhatsApp." });
      } catch (error) {
        setIsExporting(false);
        toast({ variant: "destructive", title: "DISPATCH FAILED", description: "Secure transmission interrupted." });
      }
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {}
  };

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.toLowerCase().trim();
    setTerminalInput('');
    if (cmd === '/ghost_on') handleGhostModeToggle(true);
    else if (cmd === '/ghost_off') handleGhostModeToggle(false);
    else if (cmd === '/report') exportReport();
    else toast({ title: "UNKNOWN COMMAND", variant: "destructive" });
  };

  const handlePayment = () => {
    requireSecurity(() => {
      setPaymentStatus('PAYING');
      setTimeout(() => {
        setPaymentStatus('SUCCESS');
        toast({ title: "PAYMENT SUCCESSFUL" });
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
            <p className="text-secondary text-[11px] uppercase mt-1">Operator: {user?.email}</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto justify-end">
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

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Economics</TabsTrigger>
          <TabsTrigger value="fintech" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Financing</TabsTrigger>
          <TabsTrigger value="dispatch" className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Dual Dispatch</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm text-primary flex items-center gap-2 uppercase tracking-tight">
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
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
                      <DialogTitle className="text-lg text-primary tracking-tight uppercase">UPI Secure Link</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-6 space-y-6">
                      {paymentStatus === 'IDLE' ? (
                        <>
                          <div className="p-4 bg-white rounded-2xl">
                            <QRCodeSVG value={`upi://pay?pa=sentinel@ops&am=${emiCalculations.emi}`} size={160} />
                          </div>
                          <Button onClick={handlePayment} className="btn-tokyo w-full bg-primary text-black font-semibold h-14 rounded-2xl tracking-tight">I HAVE PAID</Button>
                        </>
                      ) : paymentStatus === 'PAYING' ? (
                        <div className="py-10 flex flex-col items-center gap-4">
                          <Loader2 className="w-10 h-10 text-primary animate-spin" />
                          <p className="text-[11px] tracking-tight uppercase text-secondary">Verifying Uplink...</p>
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center gap-6 animate-in zoom-in-50">
                          <SuccessIcon className="w-16 h-16 text-[#9ECE6A] neon-text" />
                          <h3 className="text-[#9ECE6A] font-semibold text-xl tracking-tight">TRANSACTION VERIFIED</h3>
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
            <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] text-secondary/60 mb-6">
              <p><span className="text-primary">[BOOT]</span> Kernel sequence finalized.</p>
              <p><span className="text-primary">[INFO]</span> FinTech financing ratio: {emiCalculations.interestRatio}%.</p>
              {waStatus === 'CONNECTED' && <p className="text-[#9ECE6A]">[LINK] WhatsApp uplink authorized.</p>}
              {isGhostMode && <p className="text-primary neon-text">[STEALTH] Tokyo Red Protocol active.</p>}
            </div>
            <form onSubmit={handleTerminalCommand} className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold opacity-40"> {'>'} </span>
              <Input 
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="ENTER COMMAND..."
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
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-primary/30 text-foreground glass-card max-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
              <Fingerprint className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-lg text-primary tracking-tight uppercase">Identity Link</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-6 text-center">
            <Button onClick={handleBiometricAuth} className="btn-tokyo w-full bg-primary text-black font-semibold h-14 tracking-tight rounded-2xl">SCAN BIOMETRICS</Button>
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
              <Button type="submit" variant="outline" className="btn-tokyo w-full border-white/10 rounded-xl h-12 uppercase text-[10px] tracking-tight">Verify PIN</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isWADialogOpen} onOpenChange={setIsWADialogOpen}>
        <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-primary/30 text-foreground glass-card max-w-md">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-xl text-primary tracking-tight uppercase">WhatsApp Pairing</DialogTitle>
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
                <Button onClick={generatePairingCode} className="btn-tokyo w-full bg-primary text-black hover:bg-primary/80 font-semibold h-14 tracking-tight rounded-2xl">PAIR WITH PHONE</Button>
              </div>
            )}
            {waStatus === 'DISPLAY_CODE' && (
              <div className="w-full space-y-6 text-center">
                <div className="glass-card p-10 rounded-3xl border-primary/20 bg-white/[0.02] relative overflow-hidden">
                  <span className="text-5xl font-mono text-primary neon-text tracking-widest block mb-4">{pairingCode}</span>
                  <Progress value={(qrRefreshTimer / 20) * 100} className="h-1 bg-white/10" />
                </div>
                <p className="text-[9px] text-muted-foreground mt-4 leading-relaxed uppercase">
                  Open WhatsApp {'\u003E'} Settings {'\u003E'} Linked Devices {'\u003E'} Link a Device {'\u003E'} Link with phone number instead
                </p>
                <div className="flex items-center justify-center gap-2 text-[10px] text-secondary">
                  <Loader2 className="w-3 h-3 animate-spin" /> REFRESHING IN {qrRefreshTimer}S
                </div>
              </div>
            )}
            {waStatus === 'CONNECTED' && (
              <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
                <SuccessIcon className="w-20 h-20 text-[#9ECE6A] neon-text" />
                <h3 className="text-[#9ECE6A] font-semibold text-2xl tracking-tight uppercase">Authorized</h3>
                <Button onClick={() => setIsWADialogOpen(false)} className="btn-tokyo bg-primary text-black w-full h-12 rounded-xl">CONTINUE</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Syncing Report Modal */}
      <Dialog open={isExporting} onOpenChange={() => {}}>
        <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-accent/30 text-foreground glass-card max-w-sm">
          <div className="flex flex-col items-center py-10 space-y-6 text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin" />
            <h2 className="text-lg text-accent tracking-tight uppercase font-semibold">Syncing Secure Nodes</h2>
            <p className="text-[11px] text-secondary uppercase tracking-widest leading-relaxed">
              Dispatching to Email, WhatsApp, and Telegram Mainframe...
            </p>
            <div className="w-full space-y-2 px-6">
              <div className="flex justify-between text-[8px] uppercase text-secondary">
                <span>Encryption</span>
                <span>Active</span>
              </div>
              <Progress value={65} className="h-1 bg-white/5" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
            <div className="w-64 h-64">
              <Lottie animationData={mailSentAnimation} loop={false} />
            </div>
            <h2 className="text-3xl font-bold text-[#9ECE6A] neon-text uppercase tracking-tighter mt-4">Dispatch Confirmed</h2>
            <p className="text-secondary uppercase text-[10px] mt-2 tracking-[0.2em]">Report secured across all channels</p>
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
          <p className="text-[9px] text-secondary uppercase tracking-tight">{label}</p>
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
        <p className="text-[10px] text-secondary uppercase tracking-tight font-semibold mb-2">{title}</p>
        <CardTitle className={cn("text-3xl font-semibold text-foreground group-hover:text-primary transition-colors tracking-tighter duration-500", isEmi && "neon-text text-primary")}>{value}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-[9px] text-primary/60 uppercase truncate tracking-tight font-semibold">{sub}</p>
      </CardContent>
    </Card>
  );
}

function FinStat({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-4 glass-card rounded-2xl text-center">
      <p className="text-[9px] text-secondary uppercase tracking-tight font-semibold mb-2">{label}</p>
      <p className={cn("text-lg font-semibold", color)}>{value}</p>
    </div>
  );
}

function LoadProgress({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[10px] uppercase tracking-tight font-semibold text-secondary">
        <span>{label}</span>
        <span className="text-primary">{value}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
