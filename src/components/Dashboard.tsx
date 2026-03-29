"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Ghost, Leaf, TrendingDown, LogOut, 
  Bell, Send, ShieldAlert, Zap, BarChart3, Globe, Trash2, CheckCircle2, Loader2, Info,
  GitBranch, Play, Workflow, CheckCircle, XCircle, RefreshCw, Terminal, Cpu, Activity, EyeOff, ShieldCheck
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
  const { toast } = useToast();

  // HiFi: Haptics & Audio simulation
  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  }, []);

  const triggerAudio = useCallback(() => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, context.currentTime);
      gain.gain.setValueAtTime(0.01, context.currentTime);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.1);
    } catch (e) {}
  }, []);

  // State for interactive resources
  const [shadowResources, setShadowResources] = useState([
    { id: 'snap-9821x', type: 'Snapshot', saving: 14.50, reason: '180 days idle', details: 'No dependencies detected. Safe to delete.' },
    { id: 'eip-0211a', type: 'Elastic IP', saving: 3.60, reason: 'Unattached', details: 'Currently costing $3.60/mo for zero traffic.' },
    { id: 'vol-5522b', type: 'EBS Volume', saving: 42.00, reason: 'Detached for 14d', details: 'Large volume detached from shut down instance.' }
  ]);

  const [gpuNodes, setGpuNodes] = useState([
    { 
      id: 'gpu-h100-primary', 
      type: 'NVIDIA H100', 
      cost: 3.45, 
      util: 4.2, 
      status: 'CRITICAL: UNDER-UTILIZED', 
      reco: 'TRANSITION TO SPOT G2',
      variant: 'destructive' as const,
      isEmergency: true
    },
    { 
      id: 'gpu-a100-worker-1', 
      type: 'NVIDIA A100', 
      cost: 2.10, 
      util: 88.0, 
      status: 'OPTIMAL', 
      reco: null,
      variant: 'default' as const,
      isEmergency: false
    }
  ]);

  const [pipelines, setPipelines] = useState([
    { id: 'PIPE-001', name: 'PROD DEPLOY', status: 'SUCCESS', delta: '+$42.00', time: '2h ago', type: 'deploy' },
    { id: 'PIPE-002', name: 'SHADOW SCAN', status: 'SUCCESS', delta: '-$14.50', time: '4h ago', type: 'optimize' },
    { id: 'PIPE-003', name: 'GPU REBALANCING', status: 'RUNNING', delta: 'PENDING', time: 'Active', type: 'optimize' }
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

  // HiFi: Predictive Analytics Logic
  useEffect(() => {
    const checkAnomalies = () => {
      const recentData = forecastData.slice(-2);
      const spike = (recentData[1].cost - recentData[0].cost) / recentData[0].cost;
      if (spike > 0.20) {
        toast({
          title: "PREDICTIVE ALERT",
          description: `Detected ${Math.round(spike * 100)}% cost spike trend. Sending preemptive warning to Telegram.`,
          variant: "destructive"
        });
        triggerHaptic();
      }
    };
    checkAnomalies();
  }, [toast, triggerHaptic]);

  const handleGhostModeToggle = (checked: boolean) => {
    setIsGhostMode(checked);
    triggerHaptic();
    toast({
      title: checked ? "GHOST MODE ACTIVATED" : "GHOST MODE DEACTIVATED",
      description: checked ? "Network stealth engaged. User-Agent randomization active." : "Standard protocols restored.",
      variant: checked ? "default" : "destructive",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const purgeResource = (id: string) => {
    setShadowResources(prev => prev.filter(item => item.id !== id));
    triggerAudio();
    toast({
      title: "RESOURCE PURGED",
      description: `Target ${id} has been eliminated.`,
      variant: "destructive"
    });
  };

  const handleTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.toLowerCase().trim();
    setTerminalInput('');
    
    if (cmd === '/ghost_on') {
      setIsGhostMode(true);
      toast({ title: "REMOTE CMD: GHOST_ON", description: "Telegram command processed successfully." });
    } else if (cmd === '/ghost_off') {
      setIsGhostMode(false);
      toast({ title: "REMOTE CMD: GHOST_OFF", description: "Telegram command processed successfully." });
    } else if (cmd === '/status') {
      toast({ title: "STATUS REPORT", description: `Sentinel Kernel: Stable | Ghost Mode: ${isGhostMode ? 'ACTIVE' : 'OFF'}` });
    } else {
      toast({ title: "COMMAND UNKNOWN", description: "Supported: /ghost_on, /ghost_off, /status", variant: "destructive" });
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
      "min-h-screen transition-all duration-700 bg-[#050505] p-6 text-white cyber-grid overflow-x-hidden",
      isGhostMode && "bg-purple-950/10 shadow-[inset_0_0_200px_rgba(188,19,254,0.15)]"
    )}>
      {/* HiFi: Pulsing Glow Indicator */}
      {isGhostMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-secondary animate-ghost-pulse blur-sm" />
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-white/5 gap-4 backdrop-blur-md sticky top-0 z-40 bg-black/40">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline text-primary neon-text tracking-tighter">SENTINEL CONTROL</h1>
            {isGhostMode && (
              <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/50 text-[10px] backdrop-blur-md">
                <EyeOff className="w-3 h-3 mr-1" /> STEALTH ENGAGED
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="font-code text-muted-foreground text-[10px] tracking-widest uppercase">HiFi FinOps Engine v4.2</p>
            <span className="text-white/20">|</span>
            <p className="font-code text-primary text-[10px]">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 glass-card p-2 px-3 rounded-full">
            <Label htmlFor="ghost-mode" className="text-[9px] font-code text-muted-foreground uppercase">Ghost Mode</Label>
            <Switch 
              id="ghost-mode" 
              checked={isGhostMode} 
              onCheckedChange={handleGhostModeToggle}
              className="data-[state=checked]:bg-secondary"
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="glass-card border-none hover:bg-white/10 rounded-full">
                <Bell className="w-4 h-4 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black/90 backdrop-blur-2xl border-white/10 text-white font-code glass-card">
              <DialogHeader>
                <DialogTitle className="font-headline text-primary flex items-center gap-2">
                  <Send className="w-5 h-5" /> TELEGRAM HI-FI LINK
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-[10px] text-muted-foreground">Bi-directional command system active. Only responds to authorized Chat ID.</p>
                <div className="space-y-2">
                  <Label className="text-[10px]">AUTH TOKEN</Label>
                  <Input placeholder="HIDDEN" type="password" className="bg-black/50 border-white/10 text-xs h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px]">AUTHORIZED CHAT ID</Label>
                  <Input placeholder="92312..." className="bg-black/50 border-white/10 text-xs h-10" />
                </div>
              </div>
              <DialogFooter>
                <Button className="bg-primary text-black hover:bg-primary/80 w-full font-headline tracking-tighter">SECURE HANDSHAKE</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-white rounded-full"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="LEAKAGE" value={`$${shadowResources.reduce((a,b)=>a+b.saving,0).toFixed(2)}`} icon={<Ghost className="w-5 h-5 text-secondary" />} sub={`${shadowResources.length} ZOMBIE UNITS`} />
        <StatCard title="EFFICIENCY" value={`$0.41`} icon={<BarChart3 className="w-5 h-5 text-blue-400" />} sub="UNIT COST HEALTHY" />
        <StatCard title="GPU BURN" value={`$5.55/hr`} icon={<Zap className="w-5 h-5 text-yellow-400" />} sub="SPOT SUGGESTIONS AVAILABLE" />
        <StatCard title="CI/CD DRIFT" value={`+$12.00`} icon={<Workflow className="w-5 h-5 text-purple-400" />} sub="LAST DEPLOY IMPACT" />
        <StatCard title="CARBON" value={`88/100`} icon={<Leaf className="w-5 h-5 text-primary" />} sub="OPTIMIZATION TARGET" />
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 backdrop-blur-md border border-white/10 p-1 flex-wrap h-auto rounded-full">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-code text-[10px] rounded-full">ECONOMICS</TabsTrigger>
          <TabsTrigger value="shadow" className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary font-code text-[10px] rounded-full">SHADOW SCAN</TabsTrigger>
          <TabsTrigger value="accelerator" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500 font-code text-[10px] rounded-full">GPU SENTINEL</TabsTrigger>
          <TabsTrigger value="pipelines" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500 font-code text-[10px] rounded-full">PIPELINES</TabsTrigger>
          <TabsTrigger value="green" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-code text-[10px] rounded-full">GREEN OPS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="glass-card mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline text-sm text-primary flex items-center gap-2 uppercase tracking-tighter">
                <TrendingDown className="w-4 h-4" /> Trend Analytics
              </CardTitle>
              <Badge variant="outline" className="border-primary/50 text-primary font-code backdrop-blur-md">PREDICTIVE STABLE</Badge>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <defs>
                      <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)'}} />
                    <Area type="monotone" dataKey="cost" stroke="#00ff88" fillOpacity={1} fill="url(#colorPrimary)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shadow" className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="glass-card border-secondary/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-secondary flex items-center justify-between">
                ZOMBIE ASSETS
                <Badge variant="outline" className="border-secondary/50 text-secondary">{shadowResources.length} DETECTED</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shadowResources.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 glass-card rounded-xl group hover:bg-white/10 transition-all gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-secondary/10 rounded-full">
                        <Ghost className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-code text-sm text-white">{item.id}</p>
                          <UITooltipProvider>
                            <UITooltip>
                              <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent className="glass-card text-[10px] max-w-xs">{item.details}</TooltipContent>
                            </UITooltip>
                          </UITooltipProvider>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">{item.type} • {item.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-secondary font-code text-sm neon-text">Save ${item.saving.toFixed(2)}/mo</p>
                      </div>
                      <Button 
                        onClick={() => purgeResource(item.id)}
                        variant="destructive" size="sm" className="h-8 text-[10px] font-code bg-secondary hover:bg-secondary/80 rounded-full"
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

        <TabsContent value="green" className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-primary flex items-center gap-2 uppercase">
                <Globe className="w-5 h-5" /> Sustainability Pulse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="p-4 glass-card rounded-xl">
                    <p className="text-[9px] text-muted-foreground mb-1 uppercase font-code">Active Cluster</p>
                    <div className="flex justify-between items-center">
                      <p className="font-code text-white text-sm">{currentRegion.name}</p>
                      <p className="font-code text-xs text-primary">{currentRegion.intensity}</p>
                    </div>
                  </div>
                  {currentRegion.id !== 'CA-Central-1' && (
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl border-dashed">
                      <p className="text-[9px] text-primary mb-1 uppercase font-code">AI Suggestion: Montreal</p>
                      <p className="font-code text-xs text-white/80">Reduce carbon by 40% with zero cost increase.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center items-center text-center p-8 glass-card rounded-2xl">
                  {isMigrating ? (
                    <div className="w-full space-y-4">
                      <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-code text-primary">
                          <span>SYNCING REGION...</span>
                          <span>{migrationProgress}%</span>
                        </div>
                        <Progress value={migrationProgress} className="h-1 bg-white/10" />
                      </div>
                    </div>
                  ) : currentRegion.id === 'CA-Central-1' ? (
                    <div className="space-y-4">
                      <ShieldCheck className="w-12 h-12 text-primary mx-auto neon-text" />
                      <h3 className="text-xl font-headline text-primary tracking-tighter">SUSTAINABLE</h3>
                    </div>
                  ) : (
                    <Button onClick={handleInitiateMigration} className="w-full bg-primary text-black hover:bg-primary/80 font-headline rounded-full py-6 text-lg">ENACT MIGRATION</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5">
            <CardTitle className="font-code text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-3 h-3" /> Command Terminal
            </CardTitle>
            <Activity className="w-3 h-3 text-primary animate-pulse" />
          </CardHeader>
          <CardContent className="pt-4 h-48 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-1 font-code text-[10px] text-muted-foreground mb-4">
              <p><span className="text-primary">[SYSTEM]</span> Sentinel Kernel v4.2 active. All haptic links established.</p>
              <p><span className="text-purple-400">[PIPELINE]</span> {pipelines.filter(p=>p.status === 'RUNNING').length} background optimizations pending.</p>
              <p><span className="text-secondary">[SHADOW]</span> Found {shadowResources.length} orphaned resources.</p>
              {isGhostMode && <p className="text-secondary animate-pulse">[STEALTH] Network traffic randomized. Console logging redirected to encrypted shadow-log.</p>}
            </div>
            <form onSubmit={handleTerminalCommand} className="relative">
              <span className="absolute left-3 top-2.5 text-primary font-bold text-xs"> {'>'} </span>
              <Input 
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Enter Telegram command (e.g., /status)..."
                className="bg-black/50 border-white/10 pl-8 font-code text-xs h-9 rounded-full focus:border-primary/50"
              />
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="font-headline text-xs text-primary uppercase">Resource Pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-code">
                <span>CPU UTILIZATION</span>
                <span className="text-primary">42%</span>
              </div>
              <Progress value={42} className="h-1 bg-white/10" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-code">
                <span>GPU MEMORY</span>
                <span className="text-yellow-400">88%</span>
              </div>
              <Progress value={88} className="h-1 bg-white/10" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-code">
                <span>NETWORK STEALTH</span>
                <span className={isGhostMode ? "text-secondary" : "text-muted-foreground"}>{isGhostMode ? "ENCRYPTED" : "UNMASKED"}</span>
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
    <Card className="glass-card hover:bg-white/10 transition-all group overflow-hidden relative rounded-2xl">
      <div className="absolute -top-2 -right-2 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
        {icon}
      </div>
      <CardHeader className="pb-1">
        <p className="text-[9px] font-code text-muted-foreground uppercase tracking-tighter mb-1">{title}</p>
        <CardTitle className="text-2xl font-headline text-white group-hover:text-primary transition-colors tracking-tighter">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[9px] font-code text-secondary uppercase truncate tracking-tighter">{sub}</p>
      </CardContent>
    </Card>
  );
}

function UITooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}
