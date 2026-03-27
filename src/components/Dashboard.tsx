"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  Ghost, Leaf, TrendingDown, Cpu, Activity, LogOut, 
  Bell, Settings, Send, ShieldAlert, Zap, BarChart3, Globe, Trash2, CheckCircle2, AlertTriangle
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
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleGhostModeToggle = (checked: boolean) => {
    setIsGhostMode(checked);
    toast({
      title: checked ? "GHOST MODE ACTIVATED" : "GHOST MODE DEACTIVATED",
      description: checked ? "Autonomous termination sequence primed." : "Manual control restored.",
      variant: checked ? "default" : "destructive",
    });
  };

  const purgeResource = (id: string) => {
    toast({
      title: "RESOURCE PURGED",
      description: `Target ${id} has been eliminated from infrastructure.`,
      variant: "destructive"
    });
  };

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
        <StatCard title="SHADOW LEAKAGE" value="3 Units" icon={<Ghost className="w-5 h-5 text-secondary" />} sub="POTENTIAL SAVING: $60.10/mo" />
        <StatCard title="UNIT EFFICIENCY" value="0.41 $/user" icon={<BarChart3 className="w-5 h-5 text-blue-400" />} sub="HEALTHY GROWTH DETECTED" />
        <StatCard title="GPU OVERHEAD" value="$3.45/hr" icon={<Zap className="w-5 h-5 text-yellow-400" />} sub="LOW UTILIZATION IN H100" />
        <StatCard title="GREEN SCORE" value="88%" icon={<Leaf className="w-5 h-5 text-primary" />} sub="CARBON REDUCTION: 142kg" />
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
                <Badge variant="outline" className="border-secondary text-secondary">3 GHOSTS FOUND</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: 'snap-9821x', type: 'Snapshot', saving: 14.50, reason: '180 days idle' },
                  { id: 'eip-0211a', type: 'Elastic IP', saving: 3.60, reason: 'Unattached' },
                  { id: 'vol-5522b', type: 'EBS Volume', saving: 42.00, reason: 'Detached for 14d' }
                ].map((item) => (
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
                        <p className="text-secondary font-code">Save ${item.saving}/mo</p>
                        <p className="text-[10px] text-muted-foreground">RECOVERY POTENTIAL</p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" className="h-8 border-white/20 text-[10px] font-code hover:bg-white/10">KEEP</Button>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-black/40 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="font-headline text-lg text-yellow-500 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> GPU SENTINEL: LIVE FEED
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-code text-white">gpu-h100-primary</p>
                        <Badge variant="destructive" className="h-4 text-[8px] animate-pulse">UNDER-UTILIZED</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">NVIDIA H100 • $3.45/hr • Util: 4.2%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-500 font-code text-xs">RECO: TRANSITION TO SPOT G2</p>
                      <Button size="sm" className="mt-2 bg-yellow-600 text-white hover:bg-yellow-500 h-7 text-[10px] font-code">OPTIMIZE NOW</Button>
                    </div>
                  </div>
                  <div className="p-4 border border-primary/30 bg-primary/5 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-code text-white">gpu-a100-worker-1</p>
                        <Badge className="h-4 text-[8px] bg-primary text-black">OPTIMAL</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">NVIDIA A100 • $2.10/hr • Util: 88.0%</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="font-code text-xs text-muted-foreground uppercase">Accelerator Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-2xl font-headline text-white">$142.50</p>
                  <p className="text-[10px] text-muted-foreground">IDLE GPU SPEND THIS MONTH</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-muted-foreground">GPU LOAD VS COST</p>
                    <p className="text-destructive text-[10px] font-code">ANOMALY: 88%</p>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-[88%]" />
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
                        <p className="font-code text-white">US-East-1</p>
                        <p className="text-xs text-muted-foreground">N. Virginia</p>
                      </div>
                      <div className="text-right">
                        <p className="text-destructive font-code">0.47 kgCO2/kWh</p>
                        <p className="text-[10px] text-muted-foreground">CARBON INTENSITY</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <TrendingDown className="w-6 h-6 text-primary rotate-45" />
                  </div>
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg relative">
                    <Badge className="absolute -top-2 right-4 bg-primary text-black">RECOMMENDED</Badge>
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
                  <div className="mb-6">
                    <div className="text-6xl font-headline text-primary mb-2">40%</div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-code">Potential Carbon Reduction</p>
                  </div>
                  <div className="mb-8">
                    <div className="text-4xl font-headline text-white">$12%</div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-code">Estimated Cost Saving</p>
                  </div>
                  <Button className="w-full bg-primary text-black hover:bg-primary/80 font-headline">INITIATE MIGRATION</Button>
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
              <p><span className="text-secondary">[09:41:02]</span> GHOST_SCAN triggered: Identified snap-9821x as orphaned.</p>
              <p><span className="text-primary">[09:42:15]</span> UNIT_ECONOMICS update: Cost per User healthy at $0.41.</p>
              <p><span className="text-yellow-500">[09:44:00]</span> GPU_SENTINEL alert: H100 node utilization below 5% for 30m.</p>
              <p><span className="text-primary">[09:45:10]</span> GREEN_OPS: Quebec region now 12% cheaper than US-East.</p>
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
