"use client"

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  Ghost, Leaf, TrendingDown, LogOut, 
  Bell, Send, ShieldAlert, Zap, BarChart3, Globe, Trash2, CheckCircle2, Loader2, Info,
  Terminal, Cpu, Activity, EyeOff, ShieldCheck,
  Fingerprint, FileText, Download, AlertTriangle, MessageSquare, Smartphone,
  CheckCircle2 as SuccessIcon, ArrowRight, ExternalLink
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';

// 6-Month Mock Data
const sixMonthTrends = [
  { name: 'Jan', cost: 4200, users: 8500, efficiency: 0.49 },
  { name: 'Feb', cost: 3800, users: 9200, efficiency: 0.41 },
  { name: 'Mar', cost: 4500, users: 11000, efficiency: 0.40 },
  { name: 'Apr', cost: 5100, users: 13500, efficiency: 0.38 },
  { name: 'May', cost: 4800, users: 14200, efficiency: 0.34 },
  { name: 'Jun', cost: 5500, users: 18000, efficiency: 0.30 },
];

const forecastData = [
  { name: 'Mon', cost: 400, carbon: 240, cpu: 0.45 },
  { name: 'Tue', cost: 300, carbon: 139, cpu: 0.42 },
  { name: 'Wed', cost: 200, carbon: 980, cpu: 0.39 },
  { name: 'Thu', cost: 278, carbon: 390, cpu: 0.48 },
  { name: 'Fri', cost: 189, carbon: 480, cpu: 0.41 },
  { name: 'Sat', cost: 239, carbon: 380, cpu: 0.35 },
  { name: 'Sun', cost: 349, carbon: 430, cpu: 0.32 },
];

export default function Dashboard() {
  const { user } = useUser();
  const auth = useAuth();
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [terminalInput, setTerminalInput] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const { toast } = useToast();

  // WhatsApp Pairing State
  const [isWADialogOpen, setIsWADialogOpen] = useState(false);
  const [waStatus, setWaStatus] = useState<'IDLE' | 'ENTER_PHONE' | 'FETCHING_CODE' | 'DISPLAY_CODE' | 'CONNECTED'>('IDLE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pairingCode, setPairingCode] = useState('');

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  }, []);

  const triggerAudio = useCallback(() => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, context.currentTime);
      gain.gain.setValueAtTime(0.02, context.currentTime);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    } catch (e) {}
  }, []);

  const [shadowResources, setShadowResources] = useState([
    { id: 'snap-9821x', type: 'Snapshot', saving: 14.50, reason: '180 days idle', details: 'No dependencies detected. Safe to delete.' },
    { id: 'eip-0211a', type: 'Elastic IP', saving: 3.60, reason: 'Unattached', details: 'Currently costing $3.60/mo for zero traffic.' },
    { id: 'vol-5522b', type: 'EBS Volume', saving: 42.00, reason: 'Detached for 14d', details: 'Large volume detached from shut down instance.' }
  ]);

  const [gpuNodes, setGpuNodes] = useState([
    { id: 'gpu-h100-primary', type: 'NVIDIA H100', utilization: 4.2, hourlyCost: 3.45, isEmergency: true },
    { id: 'gpu-a100-worker-1', type: 'NVIDIA A100', utilization: 88.0, hourlyCost: 2.10, isEmergency: false }
  ]);

  const [currentRegion, setCurrentRegion] = useState({
    id: 'US-East-1',
    name: 'N. Virginia',
    intensity: '0.47 kgCO2/kWh',
    status: 'High Carbon',
    score: 88
  });

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  // WhatsApp Pairing Logic
  const handleLinkWhatsApp = () => {
    setIsWADialogOpen(true);
    setWaStatus('ENTER_PHONE');
  };

  const generatePairingCode = () => {
    if (!phoneNumber) {
      toast({ title: "ERROR", description: "Please enter a valid phone number.", variant: "destructive" });
      return;
    }
    setWaStatus('FETCHING_CODE');
    
    setTimeout(() => {
      // Simulate an 8-character code generation
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3) code += '-';
      }
      setPairingCode(code);
      setWaStatus('DISPLAY_CODE');
      triggerAudio();
      
      // Simulate a connection after 15 seconds
      setTimeout(() => {
        setWaStatus('CONNECTED');
        toast({ title: "WHATSAPP CONNECTED", description: "Instance status: Authorized. Webhooks active." });
      }, 15000);
    }, 1500);
  };

  const openWhatsAppLinking = () => {
    window.open('whatsapp://settings/linked-devices', '_blank');
  };

  const requireSecurity = (action: () => void) => {
    setPendingAction(() => action);
    setIsAuthDialogOpen(true);
    triggerHaptic();
  };

  const handleBiometricAuth = () => {
    toast({ title: "BIOMETRIC VERIFIED", description: "Identity confirmed via WebAuthn simulation." });
    if (pendingAction) pendingAction();
    setIsAuthDialogOpen(false);
    setPinInput('');
  };

  const handlePinAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '123456') {
      toast({ title: "PIN VERIFIED", description: "Identity confirmed via fallback protocol." });
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
        description: checked ? "Network stealth engaged. WhatsApp alerts muted." : "Standard protocols restored.",
        variant: checked ? "default" : "destructive",
      });
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(0, 191, 255);
    doc.setFontSize(22);
    doc.text('SENTINEL-OPS: 6-MONTH FINOPS REPORT', 10, 20);
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(10);
    doc.text(`Generated: ${timestamp}`, 10, 30);
    doc.text(`User: ${user?.email}`, 10, 35);
    doc.setDrawColor(50, 50, 50);
    doc.line(10, 40, 200, 40);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('Summary Statistics', 10, 55);
    doc.setFontSize(11);
    doc.text(`Total Resources Scanned: 428`, 15, 65);
    doc.text(`Total "Ghost" Leakage Detected: $${(shadowResources.reduce((a,b)=>a+b.saving,0) * 6).toFixed(2)}`, 15, 72);
    doc.text(`Unit Cost Efficiency Improvement: 38.7%`, 15, 79);
    doc.text(`Active Ghost Mode Sessions: 12`, 15, 86);
    doc.setTextColor(0, 191, 255);
    doc.text('Monthly Trend Analysis (Cost per User)', 10, 105);
    sixMonthTrends.forEach((t, i) => {
      doc.setTextColor(200, 200, 200);
      doc.text(`${t.name}: $${t.efficiency.toFixed(2)} / user`, 20, 115 + (i * 10));
    });
    doc.save(`sentinel_ops_report_${Date.now()}.pdf`);
    toast({ title: "REPORT EXPORTED", description: "Professional PDF dispatched via encrypted channel." });
    
    if (waStatus === 'CONNECTED' && !isGhostMode) {
      toast({ title: "WHATSAPP SYNC", description: "Report shared with your connected WhatsApp device." });
    }
    triggerAudio();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const purgeResource = (id: string) => {
    requireSecurity(() => {
      setShadowResources(prev => prev.filter(item => item.id !== id));
      triggerAudio();
      toast({
        title: "RESOURCE PURGED",
        description: `Target ${id} has been eliminated.`,
        variant: "destructive"
      });
    });
  };

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.toLowerCase().trim();
    setTerminalInput('');
    
    if (cmd === '/ghost_on') {
      handleGhostModeToggle(true);
    } else if (cmd === '/ghost_off') {
      handleGhostModeToggle(false);
    } else if (cmd === '/status') {
      toast({ title: "STATUS REPORT", description: `Sentinel Kernel: Stable | WhatsApp: ${waStatus} | Ghost: ${isGhostMode ? 'ACTIVE' : 'OFF'}` });
    } else if (cmd === '/report' && waStatus === 'CONNECTED') {
      exportPDF();
    } else {
      toast({ title: "COMMAND UNKNOWN", description: "Supported: /ghost_on, /ghost_off, /status, /report", variant: "destructive" });
    }
  };

  const handleInitiateMigration = () => {
    if (currentRegion.id === 'CA-Central-1') return;
    setIsMigrating(true);
    setMigrationProgress(0);
    
    const interval = setInterval(() => {
      setMigrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMigrating(false);
          setCurrentRegion({
            id: 'CA-Central-1',
            name: 'Montreal (100% Hydro)',
            intensity: '0.03 kgCO2/kWh',
            status: 'Sustainable',
            score: 98
          });
          toast({ title: "MIGRATION SUCCESSFUL", description: "Carbon footprint reduced by 40%." });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 p-6 text-white overflow-x-hidden",
      isGhostMode && "ghost-active bg-red-950/5 shadow-[inset_0_0_300px_rgba(255,0,0,0.1)]"
    )}>
      {isGhostMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-primary animate-ghost-pulse blur-sm" />
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-white/5 gap-4 backdrop-blur-md sticky top-0 z-40 bg-black/40 px-4 -mx-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-headline text-primary neon-text tracking-[0.1em] transition-colors duration-500">SENTINEL-OPS</h1>
            {isGhostMode && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/50 text-[10px] backdrop-blur-md font-tech">
                <EyeOff className="w-3 h-3 mr-1" /> STEALTH ENGAGED
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="font-tech text-muted-foreground text-[10px] tracking-widest uppercase">HiFi FinOps Kernel v5.0</p>
            <span className="text-white/20">|</span>
            <p className="font-tech text-primary text-[10px] neon-text">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-3 glass-card p-2 px-4 rounded-full">
            <Label htmlFor="ghost-mode" className="text-[10px] font-tech text-muted-foreground uppercase">Ghost Mode</Label>
            <Switch 
              id="ghost-mode" 
              checked={isGhostMode} 
              onCheckedChange={handleGhostModeToggle}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <Button 
            onClick={exportPDF}
            variant="outline" 
            className="glass-card border-white/10 text-primary font-tech text-[10px] rounded-full px-5 h-10 hover:bg-primary/10 transition-all"
          >
            <Download className="w-3 h-3 mr-2" /> EXPORT REPORT
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleLinkWhatsApp}
              variant="outline" 
              className={cn(
                "glass-card border-none hover:bg-white/10 rounded-full h-10 px-4 flex items-center gap-2 text-[10px] font-tech",
                waStatus === 'CONNECTED' ? "text-green-400" : "text-primary"
              )}
            >
              <MessageSquare className="w-4 h-4" /> 
              {isGhostMode ? "LINK MASKED" : waStatus === 'CONNECTED' ? "WA: ACTIVE" : "LINK WHATSAPP"}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="glass-card border-none hover:bg-white/10 rounded-full w-10 h-10">
                  <Bell className="w-4 h-4 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white font-tech glass-card">
                <DialogHeader>
                  <DialogTitle className="font-headline text-primary flex items-center gap-2 tracking-widest">
                    <Send className="w-5 h-5" /> NOTIFICATION CHANNELS
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground">TELEGRAM BOT TOKEN</Label>
                    <Input placeholder="HIDDEN" type="password" className="bg-black/50 border-white/10 text-xs h-10 rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] text-muted-foreground">WHATSAPP API KEY (META/GREEN)</Label>
                    <Input placeholder="WA_AUTH_XXXXX" type="password" className="bg-black/50 border-white/10 text-xs h-10 rounded-lg" />
                  </div>
                  <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-primary" />
                      <span className="text-[10px]">Failover to Telegram if WhatsApp limits reached</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="bg-primary text-black hover:bg-primary/80 w-full font-headline tracking-widest py-6">SAVE CHANNELS</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary rounded-full w-10 h-10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* WhatsApp Linker Dialog (Pairing Code Method) */}
      <Dialog open={isWADialogOpen} onOpenChange={setIsWADialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-3xl border-primary/30 text-white font-tech glass-card max-w-md">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="font-headline text-xl text-primary tracking-widest uppercase">WhatsApp Pairing</DialogTitle>
            <p className="text-[10px] text-muted-foreground uppercase mt-2">Link with phone number for single-device mobile access.</p>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-6 space-y-6">
            {waStatus === 'ENTER_PHONE' && (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] text-muted-foreground uppercase">Phone Number (with Country Code)</Label>
                  <Input 
                    type="tel"
                    placeholder="+91 98765-43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-black/50 border-white/10 text-center text-lg h-14"
                  />
                </div>
                <Button 
                  onClick={generatePairingCode}
                  className="w-full bg-primary text-black hover:bg-primary/80 font-headline py-6 tracking-widest"
                >
                  GENERATE PAIRING CODE <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {waStatus === 'FETCHING_CODE' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <span className="text-[10px] uppercase font-tech tracking-widest">Handshaking with WhatsApp Node...</span>
              </div>
            )}

            {waStatus === 'DISPLAY_CODE' && (
              <div className="w-full space-y-8 animate-in zoom-in-95 duration-300">
                <div className="glass-card p-10 rounded-3xl border-primary/20 text-center shadow-[0_0_50px_rgba(0,191,255,0.15)]">
                  <span className="text-5xl font-code text-primary neon-text tracking-widest">{pairingCode}</span>
                  <p className="text-[10px] text-muted-foreground uppercase mt-6 font-tech">Enter this code on your device</p>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={openWhatsAppLinking}
                    variant="outline"
                    className="w-full glass-card border-white/10 hover:bg-white/5 font-headline py-6 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> OPEN WHATSAPP SETTINGS
                  </Button>
                  
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                    <p className="text-[9px] text-muted-foreground leading-relaxed uppercase">
                      1. Open WhatsApp &gt; Settings &gt; Linked Devices<br/>
                      2. Tap "Link a Device"<br/>
                      3. Tap "Link with phone number instead"<br/>
                      4. Enter the 8-character code shown above
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-tech">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span>WAITING FOR DEVICE AUTHORIZATION...</span>
                </div>
              </div>
            )}

            {waStatus === 'CONNECTED' && (
              <div className="flex flex-col items-center gap-6 py-8 animate-in zoom-in-50 duration-500">
                <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                  <SuccessIcon className="w-14 h-14 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-green-500 font-headline text-2xl tracking-widest uppercase">Authorized</h3>
                  <p className="text-[10px] text-muted-foreground uppercase mt-2">WhatsApp session established via pairing code.</p>
                </div>
                <Button onClick={() => setIsWADialogOpen(false)} className="w-full bg-primary text-black hover:bg-primary/80 font-headline py-6 mt-4">CONTINUE TO CORE</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Biometric Security Dialog */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="bg-black/95 backdrop-blur-3xl border-primary/30 text-white font-tech glass-card max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
              <Fingerprint className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="font-headline text-xl text-primary tracking-widest">IDENTITY VERIFICATION</DialogTitle>
            <p className="text-[10px] text-muted-foreground uppercase mt-2">Biometric check required for privileged operations.</p>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <Button onClick={handleBiometricAuth} className="w-full bg-primary text-black hover:bg-primary/80 font-headline py-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5" /> TRIGGER WEBAUTHN
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
              <div className="relative flex justify-center text-[9px] uppercase"><span className="bg-black px-2 text-muted-foreground">Or Use PIN</span></div>
            </div>
            <form onSubmit={handlePinAuth} className="space-y-3">
              <Input 
                type="password" 
                maxLength={6} 
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="6-DIGIT PIN (try 123456)" 
                className="bg-black/50 border-white/10 text-center tracking-[1em] h-12 text-lg" 
              />
              <Button type="submit" variant="outline" className="w-full border-white/10 text-xs hover:bg-white/5">CONFIRM FALLBACK</Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="LEAKAGE" value={`$${shadowResources.reduce((a,b)=>a+b.saving,0).toFixed(2)}`} icon={<Ghost className="w-5 h-5 text-secondary" />} sub={`${shadowResources.length} ZOMBIE UNITS`} />
        <StatCard title="UNIT COST" value={`$0.30`} icon={<TrendingDown className="w-5 h-5 text-primary" />} sub="30-DAY EFFICIENCY UP" />
        <StatCard title="GPU BURN" value={`$${gpuNodes.reduce((acc, n) => acc + n.hourlyCost, 0).toFixed(2)}/hr`} icon={<Zap className="w-5 h-5 text-yellow-400" />} sub="SPOT SUGGESTIONS ACTIVE" />
        <StatCard title="WA SYNC" value={isGhostMode ? "HIDDEN" : waStatus === 'CONNECTED' ? "LINKED" : "OFFLINE"} icon={<MessageSquare className="w-5 h-5 text-primary" />} sub={waStatus === 'CONNECTED' ? "WEBHOOKS AUTHORIZED" : "AWAITING AUTH"} />
        <StatCard title="GREEN SCORE" value={`98/100`} icon={<Leaf className="w-5 h-5 text-primary" />} sub="MONTREAL SYNCED" />
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 backdrop-blur-md border border-white/10 p-1 flex-wrap h-auto rounded-full">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-tech text-[10px] rounded-full px-6 uppercase tracking-wider">Economics</TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-tech text-[10px] rounded-full px-6 uppercase tracking-wider">6-Month Analytics</TabsTrigger>
          <TabsTrigger value="shadow" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary font-tech text-[10px] rounded-full px-6 uppercase tracking-wider">Shadow Scan</TabsTrigger>
          <TabsTrigger value="gpu" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500 font-tech text-[10px] rounded-full px-6 uppercase tracking-wider">GPU Sentinel</TabsTrigger>
          <TabsTrigger value="green" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-tech text-[10px] rounded-full px-6 uppercase tracking-wider">Green Ops</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="glass-card mb-6 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline text-sm text-primary flex items-center gap-2 uppercase tracking-widest">
                <Activity className="w-4 h-4" /> Real-time Pulse
              </CardTitle>
              <Badge variant="outline" className="border-primary/50 text-primary font-tech backdrop-blur-md">KERNEL STABLE</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '12px'}} />
                    <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPrimary)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="font-headline text-sm text-primary flex items-center gap-2 uppercase tracking-widest">
                  <BarChart3 className="w-4 h-4" /> Historical Cost/User (180d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sixMonthTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '12px'}} />
                      <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 8, stroke: 'white', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-secondary/20">
              <CardHeader>
                <CardTitle className="font-headline text-sm text-secondary flex items-center gap-2 uppercase tracking-widest">
                  <TrendingDown className="w-4 h-4" /> Growth Efficiency Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sixMonthTrends}>
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.9)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '12px'}} />
                      <Area type="monotone" dataKey="users" stackId="1" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shadow" className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="glass-card border-secondary/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-secondary flex items-center justify-between tracking-widest">
                ZOMBIE INFRASTRUCTURE
                <Badge variant="outline" className="border-secondary/50 text-secondary font-tech">{shadowResources.length} LEAKS DETECTED</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shadowResources.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 glass-card rounded-2xl group hover:bg-white/10 transition-all gap-4 border-white/5">
                    <div className="flex gap-4 items-center">
                      <div className="p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
                        <Ghost className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-tech text-sm text-white tracking-wider">{item.id}</p>
                          <UITooltipProvider>
                            <UITooltip>
                              <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent className="glass-card text-[10px] max-w-xs">{item.details}</TooltipContent>
                            </UITooltip>
                          </UITooltipProvider>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-tech mt-1">{item.type} • {item.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-secondary font-tech text-sm neon-text">Save ${item.saving.toFixed(2)}/mo</p>
                      </div>
                      <Button 
                        onClick={() => purgeResource(item.id)}
                        variant="destructive" size="sm" className="h-10 px-6 text-[10px] font-headline bg-secondary hover:bg-secondary/80 rounded-full tracking-widest"
                      >
                        PURGE <Trash2 className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gpu" className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="glass-card border-yellow-500/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-yellow-500 flex items-center gap-2 tracking-widest uppercase">
                <Cpu className="w-6 h-6" /> GPU Sentinel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gpuNodes.map((node) => (
                  <div key={node.id} className={cn(
                    "flex flex-col md:flex-row items-start md:items-center justify-between p-5 glass-card rounded-2xl gap-4 border-white/5",
                    node.isEmergency && "border-destructive/30 bg-destructive/5"
                  )}>
                    <div className="flex gap-4 items-center">
                      <div className={cn(
                        "p-4 rounded-2xl border",
                        node.isEmergency ? "bg-destructive/10 border-destructive/20" : "bg-yellow-500/10 border-yellow-500/20"
                      )}>
                        <Zap className={cn("w-6 h-6", node.isEmergency ? "text-destructive" : "text-yellow-500")} />
                      </div>
                      <div>
                        <p className="font-tech text-sm text-white tracking-wider">{node.id}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-tech mt-1">{node.type} • {node.utilization}% Utilization</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-yellow-500 font-tech text-sm">${node.hourlyCost}/hr</p>
                      </div>
                      {node.isEmergency && (
                        <Button 
                          onClick={() => {
                            requireSecurity(() => {
                              setGpuNodes(prev => prev.map(n => n.id === node.id ? {...n, isEmergency: false, hourlyCost: 1.10, type: node.type + " (Spot)"} : n));
                              toast({ title: "GPU OPTIMIZED", description: "Switched to Spot instance." });
                            });
                          }}
                          className="h-10 px-6 text-[10px] font-headline bg-yellow-600 hover:bg-yellow-500 rounded-full tracking-widest text-black"
                        >
                          OPTIMIZE NOW
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="green" className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-primary flex items-center gap-2 uppercase tracking-widest">
                <Globe className="w-6 h-6" /> Sustainability Pulse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="p-6 glass-card rounded-2xl border-white/5">
                    <p className="text-[10px] text-muted-foreground mb-2 uppercase font-tech">Active Deployment Region</p>
                    <div className="flex justify-between items-center">
                      <p className="font-headline text-xl text-white tracking-widest">{currentRegion.name}</p>
                      <p className="font-tech text-xs text-primary neon-text">{currentRegion.intensity}</p>
                    </div>
                  </div>
                  {currentRegion.id !== 'CA-Central-1' && (
                    <div className="p-6 bg-primary/10 border border-primary/30 rounded-2xl border-dashed">
                      <p className="text-[10px] text-primary mb-2 uppercase font-headline tracking-widest flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> AI Recommendation
                      </p>
                      <p className="font-tech text-xs text-white/80 leading-relaxed">Infrastructure drift detected. Transitioning to Montreal will reduce carbon intensity by 40% with zero cost increase.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center items-center text-center p-12 glass-card rounded-3xl border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    {isMigrating && <div className="h-full bg-primary animate-boot-line" style={{ width: `${migrationProgress}%` }}></div>}
                  </div>
                  {isMigrating ? (
                    <div className="w-full space-y-6">
                      <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-tech text-primary tracking-[0.2em]">
                          <span>SYNCING DATA-NODES...</span>
                          <span>{migrationProgress}%</span>
                        </div>
                        <Progress value={migrationProgress} className="h-1 bg-white/10" />
                      </div>
                    </div>
                  ) : currentRegion.id === 'CA-Central-1' ? (
                    <div className="space-y-4">
                      <ShieldCheck className="w-16 h-16 text-primary mx-auto neon-text" />
                      <h3 className="text-2xl font-headline text-primary tracking-[0.2em]">SUSTAINABLE SYNCED</h3>
                    </div>
                  ) : (
                    <Button onClick={handleInitiateMigration} className="w-full bg-primary text-black hover:bg-primary/80 font-headline rounded-full py-8 text-xl tracking-[0.2em] shadow-[0_0_30px_rgba(0,191,255,0.3)]">ENACT MIGRATION</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/5">
            <CardTitle className="font-tech text-[10px] text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Secure Console [TTY1]
            </CardTitle>
            <Activity className="w-3 h-3 text-primary animate-pulse" />
          </CardHeader>
          <CardContent className="pt-6 h-56 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-1 font-tech text-[10px] text-muted-foreground/80 mb-6">
              <p><span className="text-primary">[SYSTEM]</span> Sentinel Kernel v5.0 established. WhatsApp sync: {waStatus}.</p>
              <p><span className="text-primary">[SYSTEM]</span> Unit Economics anomaly detection: Cost/User dropped 5% in Jun.</p>
              <p><span className="text-secondary">[SHADOW]</span> Found {shadowResources.length} orphaned resources costing ${shadowResources.reduce((a,b)=>a+b.saving,0).toFixed(2)}/mo.</p>
              {gpuNodes.some(n => n.isEmergency) && <p className="text-destructive">[ALERT] GPU utilization critically low &lt;5% on {gpuNodes.find(n => n.isEmergency)?.id}.</p>}
              {isGhostMode && <p className="text-primary animate-pulse">[STEALTH] Network obfuscation active. Agent: Mozilla/5.0 (Stealth-mode-v5).</p>}
            </div>
            <form onSubmit={handleTerminalCommand} className="relative">
              <span className="absolute left-4 top-3 text-primary font-bold text-xs opacity-50"> {'>'} </span>
              <Input 
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="EXECUTE PROTOCOL (e.g., /status, /report)..."
                className="bg-black/40 border-white/10 pl-10 font-tech text-[10px] h-11 rounded-full focus:border-primary/50 tracking-widest placeholder:opacity-30"
              />
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5">
          <CardHeader>
            <CardTitle className="font-headline text-[10px] text-primary uppercase tracking-[0.2em]">Resource Load</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-tech uppercase tracking-widest">
                <span>Core CPU</span>
                <span className="text-primary">42%</span>
              </div>
              <Progress value={42} className="h-1 bg-white/10" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-tech uppercase tracking-widest">
                <span>GPU Accelerator</span>
                <span className="text-yellow-400">88%</span>
              </div>
              <Progress value={88} className="h-1 bg-white/10" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-tech uppercase tracking-widest">
                <span>Network Masking</span>
                <span className={isGhostMode ? "text-primary neon-text" : "text-muted-foreground"}>{isGhostMode ? "ENCRYPTED" : "UNMASKED"}</span>
              </div>
              <Progress value={isGhostMode ? 100 : 0} className="h-1 bg-white/10" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, sub }: { title: string, value: string, icon: React.ReactNode, sub: string }) {
  return (
    <Card className="glass-card hover:bg-white/10 transition-all group overflow-hidden relative rounded-2xl border-white/5">
      <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <CardHeader className="pb-1 relative z-10">
        <p className="text-[10px] font-tech text-muted-foreground uppercase tracking-widest mb-2">{title}</p>
        <CardTitle className="text-3xl font-headline text-white group-hover:text-primary transition-colors tracking-tighter duration-500">{value}</CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-[9px] font-tech text-primary/60 uppercase truncate tracking-widest">{sub}</p>
      </CardContent>
    </Card>
  );
}

function UITooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}
