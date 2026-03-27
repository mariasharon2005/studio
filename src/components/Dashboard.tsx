"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  Ghost, Leaf, TrendingDown, Cpu, Activity, LogOut, 
  Bell, Settings, Send, ShieldAlert, Zap, BarChart3, Globe, Trash2, CheckCircle2, AlertTriangle, Loader2
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
    { id: 'snap-9821x', type: 'Snapshot', saving: 14.50, reason: '180 days idle' },
    { id: 'eip-0211a', type: 'Elastic IP', saving: 3.60, reason: 'Unattached' },
    { id: 'vol-5522b', type: 'EBS Volume', saving: 42.00, reason: 'Detached for 14d' }
  ]);

  const [gpuNodes, setGpuNodes] = useState([
    { 
      id: 'gpu-h100-primary', 
      type: 'NVIDIA H100', 
      cost: 3.45, 
      util: 4.2, 
      status: 'UNDER-UTILIZED', 
      reco: 'TRANSITION TO SPOT G2',
      variant: 'destructive' as const
    },
    { 
      id: 'gpu-a100-worker-1', 
      type: 'NVIDIA A100', 
      cost: 2.10, 
      util: 88.0, 
      status: 'OPTIMAL', 
      reco: null,
      variant: 'default' as const
    }
  ]);

  // Green Ops States
  const [currentRegion, setCurrentRegion] = useState({
    id: 'US-East-1',
    name: 'N. Virginia',
    intensity: '0.47 kgCO2/kWh',
    status: 'High Carbon'
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
      description: `Target ${id} has been eliminated from infrastructure.`,
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
          cost: 1.15 
        };
      }
      return node;
    }));
    toast({
      title: "OPTIMIZATION COMMENCED",
      description: `Node ${id} is being transitioned to Spot G2 instance.`,
    });
  };

  const handleInitiateMigration = () => {
    if (currentRegion.id === 'CA-Central-1') {
      toast({
        title: "ALREADY OPTIMIZED",
        description: "Your infrastructure is already in the most sustainable region.",
      });
      return;
    }

    setIsMigrating(true);
    setMigrationProgress(0);
    
    toast({
      title: "MIGRATION COMMENCED",
      description: "Transferring compute workloads to CA-Central-1 (Montreal).",
    });

    const interval = setInterval(() => {
      setMigrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMigrating(false);
          setCurrentRegion({
            id: 'CA-Central-1',
            name: 'Montreal (100% Hydro)',
            intensity: '0.03 kgCO2/kWh',
            status: 'Sustainable'
          });
          toast({
            title: "MIGRATION SUCCESSFUL",
            description: "Workloads now running on 100% renewable energy in CA-Central-1.",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const totalShadowSavings = shadowResources.reduce((sum, item) => sum + item.saving, 0).toFixed(2);

  return (
    <div className={`min-h-screen transition-all duration-700 bg-[#050505] p-6 text-white cyber-grid ${isGhostMode ? 'bg-purple-950/5 shadow-[inset_0_0_100px_rgba(188,19,254,0.1)]' : ''}`}>
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-primary/20">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline text-primary neon-text">SENTINEL CONTROL</h1>
            {isGhostMode && (
              <Badge variant="secondary" className="animate-pulse bg-secondary text-white border-none text-[10px]">
                <Zap className="w-3 h-3 mr-1" /> GHOST MODE: ACTIVE
              </Badge>
            )}
          </div>
          <p className="font-code text-muted-foreground text-sm tracking-widest uppercase mt-1">Cloud FinOps Terminal v2.0</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-black/60 p-2 px-3 rounded border border-white/5 backdrop-blur-md">
            <Label htmlFor="ghost-mode" className="text-[10px] font-code text-muted-foreground uppercase">Ghost Mode</Label>
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
                  <Send className="w-5 h-5" /> TELEGRAM PROTOCOLS
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px]">BOT API TOKEN</Label>
                  <Input placeholder="Enter token..." className="bg-black border-primary/30 text-xs h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px]">DISPATCH CHAT ID</Label>
                  <Input placeholder="Enter chat ID..." className="bg-black border-primary/30 text-xs h-10" />
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="SHADOW LEAKAGE" value={`${shadowResources.length} Units`} icon={<Ghost className="w-5 h-5 text-secondary" />} sub={`POTENTIAL SAVING: $${totalShadowSavings}/mo`} />
        <StatCard title="UNIT EFFICIENCY" value="0.41 $/user" icon={<BarChart3 className="w-5 h-5 text-blue-400" />} sub="HEALTHY GROWTH DETECTED" />
        <StatCard title="GPU OVERHEAD" value={`$${gpuNodes.find(n => n.id === 'gpu-h100-primary')?.cost.toFixed(2) || '0.00'}/hr`} icon={<Zap className="w-5 h-5 text-yellow-400" />} sub={gpuNodes.some(n => n.status === 'UNDER-UTILIZED') ? "LOW UTILIZATION DETECTED" : "RESOURCES OPTIMIZED"} />
        <StatCard title="GREEN SCORE" value={currentRegion.id === 'CA-Central-1' ? "98%" : "88%"} icon={<Leaf className="w-5 h-5 text-primary" />} sub={currentRegion.id === 'CA-Central-1' ? "EMISSIONS MINIMIZED" : "CARBON REDUCTION POTENTIAL"} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-black border border-white/10 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-code text-xs">OVERVIEW</TabsTrigger>
          <TabsTrigger value="shadow" className="data-[state=active]:bg-secondary/10 data-[state=active]:text-secondary font-code text-xs">SHADOW SCANNER</TabsTrigger>
          <TabsTrigger value="accelerator" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500 font-code text-xs">GPU SENTINEL</TabsTrigger>
          <TabsTrigger value="green" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-code text-xs">GREEN OPS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-black/50 border-primary/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-headline text-sm text-primary flex items-center gap-2">
                  <TrendingDown className="w-4 h-4" /> UNIT ECONOMICS: COST PER USER
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
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
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #00bfff', borderRadius: '4px' }}
                      itemStyle={{ color: '#00bfff' }}
                    />
                    <Area type="monotone" dataKey="cpu" stroke="#00bfff" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-black/50 border-primary/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-headline text-sm text-primary flex items-center gap-2">
                  <Leaf className="w-4 h-4" /> CARBON SAVINGS MATRIX
                </CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #00ff88', borderRadius: '4px' }}
                      itemStyle={{ color: '#00ff88' }}
                    />
                    <Bar dataKey="carbon" fill="#00ff88" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="shadow" className="animate-in slide-in-from-left-4">
          <Card className="bg-black/40 border-secondary/30">
            <CardHeader>
              <CardTitle className="font-headline text-lg text-secondary flex items-center justify-between">
                ORPHANED INFRASTRUCTURE
                <Badge variant="outline" className="border-secondary text-secondary">{shadowResources.length} GHOSTS FOUND</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shadowResources.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-lg">
                    <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-20" />
                    <p className="font-code text-muted-foreground uppercase text-xs">Infrastructure Clean: 0 Ghost Resources</p>
                  </div>
                ) : (
                  shadowResources.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg group hover:border-secondary/50 transition-all">
                      <div className="flex gap-4 items-center">
                        <div className="p-2 bg-secondary/10 rounded">
                          <Ghost className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-code text-sm text-white">{item.id}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{item.type} • {item.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-secondary font-code">Save ${item.saving.toFixed(2)}/mo</p>
                          <p className="text-[10px] text-muted-foreground">RECOVERY POTENTIAL</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accelerator" className="animate-in slide-in-from-right-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-black/40 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg text-yellow-500 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> GPU SENTINEL: LIVE FEED
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gpuNodes.map((node) => (
                    <div 
                      key={node.id} 
                      className={`p-4 border rounded-lg flex justify-between items-center transition-all ${
                        node.status === 'UNDER-UTILIZED' 
                          ? 'border-destructive/30 bg-destructive/5' 
                          : 'border-primary/30 bg-primary/5'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-code text-white">{node.id}</p>
                          <Badge 
                            variant={node.variant} 
                            className={`h-4 text-[8px] ${node.status === 'UNDER-UTILIZED' ? 'animate-pulse' : ''} ${node.status === 'OPTIMAL' ? 'bg-primary text-black' : ''}`}
                          >
                            {node.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{node.type} • ${node.cost.toFixed(2)}/hr • Util: {node.util.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        {node.reco && (
                          <>
                            <p className="text-yellow-500 font-code text-[10px] uppercase">RECO: {node.reco}</p>
                            {node.status === 'UNDER-UTILIZED' && (
                              <Button 
                                onClick={() => optimizeGpuNode(node.id)}
                                size="sm" 
                                className="mt-2 bg-yellow-600 text-white hover:bg-yellow-500 h-7 text-[10px] font-code"
                              >
                                OPTIMIZE NOW
                              </Button>
                            )}
                          </>
                        )}
                        {(node.status === 'OPTIMAL' || node.status === 'OPTIMIZED') && <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="font-code text-xs text-muted-foreground uppercase">Accelerator Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-2xl font-headline text-white">
                    ${gpuNodes.reduce((acc, node) => acc + (node.status === 'UNDER-UTILIZED' ? node.cost * 24 * 30 : 0), 0).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">EST. MONTHLY WASTED SPEND</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-muted-foreground uppercase">Aggregated Load vs Cost</p>
                    <p className={`${gpuNodes.some(n => n.status === 'UNDER-UTILIZED') ? 'text-destructive' : 'text-primary'} text-[10px] font-code uppercase`}>
                      {gpuNodes.some(n => n.status === 'UNDER-UTILIZED') ? 'ANOMALY DETECTED' : 'HEALTHY'}
                    </p>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${gpuNodes.some(n => n.status === 'UNDER-UTILIZED') ? 'bg-destructive w-[88%]' : 'bg-primary w-[45%]'}`} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="green" className="animate-in fade-in duration-500">
          <Card className="bg-black/40 border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <CardHeader>
              <CardTitle className="font-headline text-lg text-primary flex items-center gap-2">
                <Globe className="w-5 h-5" /> REGIONAL SUSTAINABILITY SCORE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-[10px] text-muted-foreground mb-4 uppercase">Current Deployment</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-code text-white">{currentRegion.id}</p>
                        <p className="text-xs text-muted-foreground">{currentRegion.name}</p>
                        <Badge variant="outline" className={`mt-2 h-4 text-[8px] ${currentRegion.status === 'High Carbon' ? 'border-destructive text-destructive' : 'border-primary text-primary'}`}>
                          {currentRegion.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className={`font-code ${currentRegion.status === 'High Carbon' ? 'text-destructive' : 'text-primary'}`}>{currentRegion.intensity}</p>
                        <p className="text-[10px] text-muted-foreground">CARBON INTENSITY</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <TrendingDown className={`w-6 h-6 text-primary rotate-45 ${isMigrating ? 'animate-bounce' : ''}`} />
                  </div>

                  <div className={`p-4 rounded-lg relative transition-all ${currentRegion.id === 'CA-Central-1' ? 'bg-white/5 border border-white/10 opacity-50' : 'bg-primary/5 border border-primary/20'}`}>
                    {currentRegion.id !== 'CA-Central-1' && <Badge className="absolute -top-2 right-4 bg-primary text-black">RECOMMENDED</Badge>}
                    <p className="text-[10px] text-muted-foreground mb-4 uppercase">Target Region</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-code text-primary">CA-Central-1</p>
                        <p className="text-xs text-muted-foreground">Montreal (100% Hydro)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary font-code">0.03 kgCO2/kWh</p>
                        <p className="text-[10px] text-muted-foreground">CARBON INTENSITY</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center text-center p-8 border border-white/5 rounded-xl bg-black/40 backdrop-blur">
                  {isMigrating ? (
                    <div className="w-full space-y-6">
                      <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-code text-primary">
                          <span>MIGRATING INFRASTRUCTURE...</span>
                          <span>{migrationProgress}%</span>
                        </div>
                        <Progress value={migrationProgress} className="h-1 bg-white/5" />
                      </div>
                      <p className="text-xs text-muted-foreground font-code">Synchronizing EBS volumes and DB snapshots to Montreal datacenter...</p>
                    </div>
                  ) : currentRegion.id === 'CA-Central-1' ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-headline text-primary">SYSTEM OPTIMIZED</h3>
                        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-code">Running on 100% Renewable Energy</p>
                      </div>
                      <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5 font-headline" onClick={() => {
                        setCurrentRegion({
                          id: 'US-East-1',
                          name: 'N. Virginia',
                          intensity: '0.47 kgCO2/kWh',
                          status: 'High Carbon'
                        });
                      }}>RESET DEPLOYMENT (DEBUG)</Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <div className="text-6xl font-headline text-primary mb-2">40%</div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-code">Potential Carbon Reduction</p>
                      </div>
                      <div className="mb-8">
                        <div className="text-4xl font-headline text-white">12%</div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-code">Estimated Cost Saving</p>
                      </div>
                      <Button 
                        onClick={handleInitiateMigration}
                        className="w-full bg-primary text-black hover:bg-primary/80 font-headline"
                      >
                        INITIATE MIGRATION
                      </Button>
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
            <CardTitle className="font-code text-[10px] text-muted-foreground uppercase tracking-widest">Global Event Stream</CardTitle>
            <Activity className={`w-3 h-3 text-primary ${isGhostMode ? 'animate-spin' : 'animate-pulse'}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 font-code text-[10px] text-muted-foreground">
              <p><span className="text-secondary">[09:41:02]</span> GHOST_SCAN triggered: Found {shadowResources.length} candidate units.</p>
              <p><span className="text-primary">[09:42:15]</span> UNIT_ECONOMICS update: Cost per User healthy at $0.41.</p>
              <p><span className="text-yellow-500">[09:44:00]</span> GPU_SENTINEL alert: Monitor active for {gpuNodes.length} critical nodes.</p>
              <p><span className="text-primary">[09:45:10]</span> GREEN_OPS: {currentRegion.id === 'CA-Central-1' ? 'Montreal deployment active.' : 'Quebec region identified as optimal cost/carbon swap.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, sub }: { title: string, value: string, icon: React.ReactNode, sub: string }) {
  return (
    <Card className="bg-black/60 border-white/10 hover:border-primary/40 transition-all group overflow-hidden relative backdrop-blur-lg">
      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <CardHeader className="pb-1">
        <p className="text-[9px] font-code text-muted-foreground uppercase tracking-tighter mb-1">{title}</p>
        <CardTitle className="text-2xl font-headline text-white group-hover:text-primary transition-colors">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[9px] font-code text-secondary">{sub}</p>
      </CardContent>
    </Card>
  );
}
