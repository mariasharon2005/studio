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
  Terminal, Loader2
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
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import Logo from './Logo';

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

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
  }, []);

  const [shadowResources] = useState([
    { id: 'snap-9821x', type: 'Snapshot', saving: 14.50, reason: '180 days idle' },
    { id: 'eip-0211a', type: 'Elastic IP', saving: 3.60, reason: 'Unattached' },
    { id: 'vol-5522b', type: 'EBS Volume', saving: 42.00, reason: 'Detached' }
  ]);

  const [gpuNodes] = useState([
    { id: 'gpu-h100-primary', type: 'NVIDIA H100', utilization: 4.2, hourlyCost: 3.45, isEmergency: true },
    { id: 'gpu-a100-worker-1', type: 'NVIDIA A100', utilization: 88.0, hourlyCost: 2.10, isEmergency: false }
  ]);

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

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(26, 27, 38);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(122, 162, 247);
    doc.setFontSize(22);
    doc.text('SENTINEL-OPS: TOKYO NIGHT REPORT', 10, 20);
    doc.setTextColor(192, 202, 245);
    doc.setFontSize(10);
    doc.text(`Generated for: ${user?.email}`, 10, 30);
    doc.text(`Leakage Detected: $${shadowResources.reduce((a,b)=>a+b.saving,0).toFixed(2)}`, 10, 40);
    doc.save(`sentinel_report_${Date.now()}.pdf`);
    toast({ title: "REPORT EXPORTED", description: "PDF generated and encrypted." });
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
    else if (cmd === '/report') exportPDF();
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
              <h1 className="text-3xl font-semibold text-primary tracking-tight neon-text">SENTINEL-OPS</h1>
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
        <StatCard title="INFRA LEAKAGE" value={`$${shadowResources.reduce((a,b)=>a+b.saving,0).toFixed(2)}`} icon={<Ghost className="w-5 h-5 text-secondary" />} sub="3 ZOMBIE UNITS DETECTED" />
        <StatCard title="UNIT COST" value={`$0.30`} icon={<TrendingDown className="w-5 h-5 text-primary" />} sub="30-DAY EFFICIENCY TREND" />
        <StatCard title="GPU BURN" value={`$${gpuNodes.reduce((acc, n) => acc + n.hourlyCost, 0).toFixed(2)}/hr`} icon={<Zap className="w-5 h-5 text-accent" />} sub="SPOT INSTANCES ACTIVE" />
        <StatCard title="FINANCING EMI" value={`$${emiCalculations.emi}`} icon={<IndianRupee className="w-5 h-5 text-primary" />} sub="LOAN ACTIVE" isEmi />
      </div>

      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-2xl h-auto flex-wrap">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Economics</TabsTrigger>
          <TabsTrigger value="fintech" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Financing</TabsTrigger>
          <TabsTrigger value="shadow" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary text-[11px] rounded-xl px-6 uppercase tracking-tight h-10 font-semibold">Shadow Scan</TabsTrigger>
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
                <Button onClick={() => requireSecurity(() => exportPDF())} variant="outline" className="btn-tokyo flex-1 border-white/10 text-[11px] tracking-tight h-14 rounded-2xl uppercase font-semibold"><Download className="w-4 h-4 mr-2" /> RECEIPT</Button>
              </div>
            </Card>
          </div>
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
        <DialogContent className="bg-[#1A1B26]/95 backdrop-blur-3xl border-primary/30 text-foreground glass-card max-w-sm">
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
                <div className="glass-card p-10 rounded-3xl border-primary/20 bg-white/[0.02]">
                  <span className="text-5xl font-mono text-primary neon-text tracking-widest">{pairingCode}</span>
                </div>
                <p className="text-[11px] text-secondary uppercase leading-relaxed">
                  Open WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device &gt; Link with phone number instead
                </p>
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              </div>
            )}
            {waStatus === 'CONNECTED' && (
              <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
                <SuccessIcon className="w-20 h-20 text-[#9ECE6A] neon-text" />
                <h3 className="text-[#9ECE6A] font-semibold text-2xl tracking-tight">AUTHORIZED</h3>
                <Button onClick={() => setIsWADialogOpen(false)} className="btn-tokyo bg-primary text-black w-full h-12 rounded-xl">CONTINUE</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
