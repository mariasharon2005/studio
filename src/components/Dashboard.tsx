"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  Ghost, Leaf, TrendingDown, Cpu, Activity, LogOut, 
  Bell, Settings, Send, ShieldAlert, Zap, BarChart3, Globe, Trash2, CheckCircle2, AlertTriangle, Loader2, Info
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
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

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

  const [unitEconomics, setUnitEconomics] = useState({
    costPerUser: 0.41,
    status: 'HEALTHY GROWTH',
    note: 'Total cost rose 10%, but Cost per User dropped by 5%.'
  });

  const [currentRegion, setCurrentRegion] = useState({
    id: 'US-East-1',
    name: 'N. Virginia',
    intensity: '0.47 kgCO2/kWh',
    status: 'High Carbon',
    score: 88
  });

  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const handleGhostModeToggle = (checked: boolean) => {
    setIsGhostMode(checked);
    toast({
      title: checked ? "GHOST MODE ACTIVATED" : "GHOST MODE DEACTIVATED",
      description: checked ? "Autonomous termination sequence primed." : "Manual control restored.",
      variant: checked ? "default" : "destructive",
    });
  };

  const purgeResource = (id: string) => {
    setShadowResources(prev => prev.filter(item => item.id !== id));
    toast({
      title: "RESOURCE PURGED",
      description: `Target ${id} has been eliminated. Monthly spend reduced.`,
      variant: "destructive"
    });
  };

  const keepResource = (id: string) => {
    setShadowResources(prev => prev.filter(item => item.id !== id));
    toast({
      title: "PROTOCOL UPDATED",
      description: `Target ${id} whitelisted for next 30 days.`,
    });
  };

  const optimizeGpuNode = (id: string) => {
    setGpuNodes(prev => prev.map(node => {
      if (node.id === id) {
        return {
          ...node,
          status: 'OPTIMIZED',
          reco: 'Spot Instance Active',
          variant: 'default' as const,
          cost: 1.15,
          isEmergency: false
        };
      }
      return node;
    }));
    toast({
      title: "OPTIMIZATION COMMENCED",
      description: `Node ${id} transitioning to Spot G2.`,
    });
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
          toast({
            title: "MIGRATION SUCCESSFUL",
            description: "Workloads moved to CA-Central-1. Carbon footprint reduced by 40%.",
          });
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className={`min-h-screen transition-all duration-700 bg-[#050505] p-6 text-white cyber-grid ${isGhostMode ? 'bg-purple-950/5 shadow-[inset_0_0_100px_rgba(188,19,254,0.1)]' : ''}`}>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-primary/20 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline text-primary neon-text">SENTINEL CONTROL</h1>
            {isGhostMode && (
              <Badge variant="secondary" className="animate-pulse bg-secondary text-white border-none text-[10px]">
                <Zap className="w-3 h-3 mr-1" /> GHOST MODE: ACTIVE
              </Badge>
            )}
          </div>
          <p className="font-code text-muted-foreground text-sm tracking-widest uppercase mt-1">Autonomous FinOps Module v3.0</p>
        </div>
        
        <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-black/60 p-2 px-3 rounded border border-white/5 backdrop-blur-md">
            <Label htmlFor="ghost-mode" className="text-[10px] font-code text-muted-foreground uppercase">Auto-Purge</Label>
            <Switch 
              id="ghost-mode" 
              checked={isGhostMode} 
              onCheckedChange={handleGhostModeToggle}
              className="data-[state=checked]:bg-secondary"
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="border-primary/30 hover:bg-primary/10">
                <Bell className="w-4 h-4 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-primary/20 text-white font-code">
              <DialogHeader>
                <DialogTitle className="font-headline text-primary flex items-center gap-2">
                  <Send className="w-5 h-5" /> TELEGRAM ALERTS
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-[10px] text-muted-foreground">Configure your bot to receive Purge/Optimize buttons directly in Telegram.</p>
                <div className="space-y-2">
                  <Label className="text-[10px]">BOT TOKEN</Label>
                  <Input placeholder="782348:AAH-..." className="bg-black border-primary/30 text-xs h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px]">CHAT ID</Label>
                  <Input placeholder="-100..." className="bg-black border-primary/30 text-xs h-10" />
                </div>
              </div>
              <DialogFooter>
                <Button className="bg-primary text-black hover:bg-primary/80 w-full font-headline tracking-tighter">ESTABLISH HANDSHAKE</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="SHADOW LEAKAGE" value={`${shadowResources.length} Units`} icon={<Ghost className="w-5 h-5 text-secondary" />} sub={`SAVE $${shadowResources.reduce((a,b)=>a+b.saving,0).toFixed(2)}/MO`} />
        <StatCard title="UNIT EFFICIENCY" value={`$${unitEconomics.costPerUser}/user`} icon={<BarChart3 className="w-5 h-5 text-blue-400" />} sub={unitEconomics.status} />
        <StatCard title="GPU OVERHEAD" value={`$${gpuNodes.reduce((a,b)=>a+b.cost, 0).toFixed(2)}/hr`} icon={<Zap className="w-5 h-5 text-yellow-400" />} sub={gpuNodes.some(n=>n.isEmergency) ? "URGENT OPTIMIZATION REQUIRED" : "RESOURCES OPTIMIZED"} />
        <StatCard title="GREEN SCORE" value={`${currentRegion.score}%`} icon={<Leaf className="w-5 h-5 text-primary" />} sub={currentRegion.status} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-black border border-white/10 p-1 flex-wrap h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-code text-[10px]">UNIT ECONOMICS</TabsTrigger>
          <TabsTrigger value="shadow" className="data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary font-code text-[10px]">SHADOW SCANNER</TabsTrigger>
          <TabsTrigger value="accelerator" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500 font-code text-[10px]">GPU SENTINEL</TabsTrigger>
          <TabsTrigger value="green" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-code text-[10px]">GREEN OPS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-in fade-in">
          <Card className="bg-black/50 border-primary/20 backdrop-blur-xl mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-headline text-sm text-primary flex items-center gap-2">
                <TrendingDown className="w-4 h-4" /> ANOMALY DETECTION ENGINE
              </CardTitle>
              <Badge variant="outline" className="border-primary text-primary font-code">AI-VERIFIED HEALTHY</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-2/3 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00bfff" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00bfff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333'}} />
                      <Area type="monotone" dataKey="cpu" stroke="#00bfff" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/3 space-y-4">
                  <div className="p-4 border border-white/5 rounded-lg bg-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase font-code mb-1">Business Insight</p>
                    <p className="text-xs text-white leading-relaxed">{unitEconomics.note}</p>
                    <p className="text-[10px] text-primary mt-2 font-code">Growth is sustainable.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shadow" className="animate-in slide-in-from-left-4">
          <Card className="bg-black/40 border-secondary/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-secondary flex items-center justify-between">
                ZOMBIE INFRASTRUCTURE
                <Badge variant="outline" className="border-secondary text-secondary">{shadowResources.length} GHOSTS FOUND</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shadowResources.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg group hover:border-secondary/50 transition-all gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="p-2 bg-secondary/10 rounded">
                        <Ghost className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-code text-sm text-white">{item.id}</p>
                          <UITooltipProvider>
                            <UITooltip>
                              <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground" /></TooltipTrigger>
                              <TooltipContent className="bg-black border border-white/10 text-[10px] max-w-xs">{item.details}</TooltipContent>
                            </UITooltip>
                          </UITooltipProvider>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">{item.type} • {item.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto gap-6">
                      <div className="text-right">
                        <p className="text-secondary font-code text-sm">Save ${item.saving.toFixed(2)}/mo</p>
                        <p className="text-[10px] text-muted-foreground">LEAKAGE RECOVERY</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => keepResource(item.id)}
                          variant="outline" size="sm" className="h-8 border-white/20 text-[10px] font-code hover:bg-white/10"
                        >
                          KEEP
                        </Button>
                        <Button 
                          onClick={() => purgeResource(item.id)}
                          variant="destructive" size="sm" className="h-8 text-[10px] font-code bg-secondary hover:bg-secondary/80"
                        >
                          KILL <Trash2 className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accelerator" className="animate-in slide-in-from-right-4">
          <Card className="bg-black/40 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-yellow-500 flex items-center gap-2">
                <Zap className="w-5 h-5" /> GPU SENTINEL: AI WORKLOADS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gpuNodes.map((node) => (
                  <div key={node.id} className={`p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${node.isEmergency ? 'border-destructive/30 bg-destructive/5' : 'border-primary/30 bg-primary/5'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-code text-white">{node.id}</p>
                        <Badge variant={node.variant} className={`h-4 text-[8px] ${node.isEmergency ? 'animate-pulse' : ''}`}>{node.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{node.type} • ${node.cost.toFixed(2)}/hr • Utilization: <span className={node.util < 5 ? 'text-destructive' : 'text-primary'}>{node.util.toFixed(1)}%</span></p>
                    </div>
                    <div className="text-right w-full md:w-auto">
                      {node.reco && node.isEmergency ? (
                        <div className="space-y-2">
                          <p className="text-yellow-500 font-code text-[10px] uppercase">SUGGESTION: {node.reco}</p>
                          <Button 
                            onClick={() => optimizeGpuNode(node.id)}
                            size="sm" 
                            className="w-full bg-yellow-600 text-white hover:bg-yellow-500 h-7 text-[10px] font-code"
                          >
                            SWITCH TO SPOT
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-[10px] font-code uppercase">Resources Optimized</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="green" className="animate-in fade-in duration-500">
          <Card className="bg-black/40 border-primary/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-primary flex items-center gap-2">
                <Globe className="w-5 h-5" /> REGIONAL SUSTAINABILITY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-[10px] text-muted-foreground mb-2 uppercase font-code">Active Region</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-code text-white text-sm">{currentRegion.name}</p>
                        <Badge variant="outline" className={`mt-2 h-4 text-[8px] ${currentRegion.score < 90 ? 'border-destructive text-destructive' : 'border-primary text-primary'}`}>{currentRegion.status}</Badge>
                      </div>
                      <div className="text-right">
                        <p className={`font-code text-sm ${currentRegion.score < 90 ? 'text-destructive' : 'text-primary'}`}>{currentRegion.intensity}</p>
                        <p className="text-[10px] text-muted-foreground">INTENSITY</p>
                      </div>
                    </div>
                  </div>
                  
                  {currentRegion.id !== 'CA-Central-1' && (
                    <div className="relative p-4 bg-primary/5 border border-primary/20 rounded-lg border-dashed">
                      <Badge className="absolute -top-2 right-4 bg-primary text-black text-[8px]">PROPOSED</Badge>
                      <p className="text-[10px] text-muted-foreground mb-2 uppercase font-code">Target: Montreal (CA-Central-1)</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-code text-primary text-sm">100% Hydro Powered</p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-code text-sm">0.03 kgCO2/kWh</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center items-center text-center p-8 border border-white/5 rounded-xl bg-black/40 backdrop-blur min-h-[250px]">
                  {isMigrating ? (
                    <div className="w-full space-y-6">
                      <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-code text-primary">
                          <span>SYNCING DATA TO MONTREAL...</span>
                          <span>{migrationProgress}%</span>
                        </div>
                        <Progress value={migrationProgress} className="h-1 bg-white/5" />
                      </div>
                    </div>
                  ) : currentRegion.id === 'CA-Central-1' ? (
                    <div className="space-y-6">
                      <CheckCircle2 className="w-16 h-16 text-primary mx-auto" />
                      <div>
                        <h3 className="text-xl font-headline text-primary">OPTIMIZED</h3>
                        <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest font-code">Carbon & Cost minimized</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-8 mb-8 w-full">
                        <div>
                          <div className="text-4xl font-headline text-primary">40%</div>
                          <p className="text-[10px] text-muted-foreground uppercase font-code">CO2 Reduction</p>
                        </div>
                        <div>
                          <div className="text-4xl font-headline text-white">12%</div>
                          <p className="text-[10px] text-muted-foreground uppercase font-code">Cost Saving</p>
                        </div>
                      </div>
                      <Button onClick={handleInitiateMigration} className="w-full bg-primary text-black hover:bg-primary/80 font-headline">INITIATE MIGRATION</Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card className="bg-black/50 border-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-code text-[10px] text-muted-foreground uppercase tracking-widest">Global Terminal Activity</CardTitle>
            <Activity className="w-3 h-3 text-primary animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-1 font-code text-[10px] text-muted-foreground">
            <p><span className="text-primary">[SYSTEM]</span> Kernel v3.0 stable. Unit economics verified.</p>
            <p><span className="text-secondary">[SHADOW]</span> Found {shadowResources.length} orphaned resources costing ${shadowResources.reduce((a,b)=>a+b.saving,0).toFixed(2)}/mo.</p>
            {gpuNodes.some(n=>n.isEmergency) && <p className="text-destructive">[ALERT] GPU utilization critically low (&lt;5%) on {gpuNodes.find(n=>n.isEmergency)?.id}.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, sub }: { title: string, value: string, icon: React.ReactNode, sub: string }) {
  return (
    <Card className="bg-black/60 border-white/10 hover:border-primary/40 transition-all group overflow-hidden relative backdrop-blur-lg">
      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <CardHeader className="pb-1">
        <p className="text-[9px] font-code text-muted-foreground uppercase tracking-tighter mb-1">{title}</p>
        <CardTitle className="text-2xl font-headline text-white group-hover:text-primary transition-colors">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[9px] font-code text-secondary uppercase truncate">{sub}</p>
      </CardContent>
    </Card>
  );
}

function UITooltipProvider({ children }: { children: React.ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}
