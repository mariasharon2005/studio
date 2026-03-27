"use client"

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Ghost, Leaf, TrendingDown, Cpu, Activity, LogOut, 
  Bell, Settings, Send, ShieldAlert, Zap
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const forecastData = [
  { name: 'Mon', cost: 400, carbon: 240 },
  { name: 'Tue', cost: 300, carbon: 139 },
  { name: 'Wed', cost: 200, carbon: 980 },
  { name: 'Thu', cost: 278, carbon: 390 },
  { name: 'Fri', cost: 189, carbon: 480 },
  { name: 'Sat', cost: 239, carbon: 380 },
  { name: 'Sun', cost: 349, carbon: 430 },
];

export default function Dashboard() {
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState({ token: '', chatId: '', enabled: false });
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

  const saveAlertConfig = async () => {
    toast({
      title: "CONFIG SAVED",
      description: "Telegram alert protocols updated successfully.",
    });
  };

  const testTelegram = async () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "SIGNAL DISPATCHED",
        description: "Verify your Telegram client for the handshake.",
      });
    }, 1000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 bg-[#050505] p-6 text-white cyber-grid ${isGhostMode ? 'bg-purple-950/10' : ''}`}>
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-primary/20">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline text-primary neon-text">OPERATIONS CENTER</h1>
            {isGhostMode && (
              <span className="flex items-center gap-1 bg-secondary px-2 py-0.5 rounded text-[10px] font-code animate-pulse">
                <Zap className="w-3 h-3" /> GHOST MODE ACTIVE
              </span>
            )}
          </div>
          <p className="font-code text-secondary text-sm">SENTINEL-NODE: ALPHA-7</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/5">
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
                  <Send className="w-5 h-5" /> TELEGRAM INTEGRATION
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>BOT API TOKEN</Label>
                  <Input 
                    placeholder="Enter token..." 
                    value={telegramConfig.token}
                    onChange={(e) => setTelegramConfig({...telegramConfig, token: e.target.value})}
                    className="bg-black border-primary/30 text-xs" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>CHAT ID</Label>
                  <Input 
                    placeholder="Enter chat ID..." 
                    value={telegramConfig.chatId}
                    onChange={(e) => setTelegramConfig({...telegramConfig, chatId: e.target.value})}
                    className="bg-black border-primary/30 text-xs" 
                  />
                </div>
              </div>
              <DialogFooter className="flex gap-2">
                <Button 
                  onClick={testTelegram} 
                  disabled={isTesting}
                  variant="outline" 
                  className="border-secondary text-secondary hover:bg-secondary/10"
                >
                  {isTesting ? "CONNECTING..." : "TEST SIGNAL"}
                </Button>
                <Button onClick={saveAlertConfig} className="bg-primary text-black hover:bg-primary/80">
                  SAVE PROTOCOLS
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <button className="p-2 text-muted-foreground hover:text-white transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {isGhostMode && (
        <div className="mb-8 p-4 bg-secondary/10 border border-secondary/30 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <ShieldAlert className="w-6 h-6 text-secondary animate-bounce" />
          <div>
            <h3 className="font-headline text-sm text-secondary">AUTO-TERMINATION ACTIVE</h3>
            <p className="text-xs font-code opacity-70">Detecting and purging underutilized nodes in real-time.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="GHOST RESOURCES" value="12" icon={<Ghost className="w-6 h-6 text-secondary" />} sub="SAVING ESTIMATE: $1,240/mo" />
        <StatCard title="CARBON OFFSET" value="142kg" icon={<Leaf className="w-6 h-6 text-primary" />} sub="CO2 SAVED THIS MONTH" />
        <StatCard title="AVG CPU LOAD" value="14.2%" icon={<Cpu className="w-6 h-6 text-blue-400" />} sub="SYSTEM EFFICIENCY: 94%" />
        <StatCard title="COST TREND" value="-12%" icon={<TrendingDown className="w-6 h-6 text-primary" />} sub="COMPARED TO LAST QUARTER" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-black/50 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-primary">COST FORECASTING (7D)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#bc13fe" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #bc13fe', borderRadius: '4px' }}
                  itemStyle={{ color: '#bc13fe' }}
                />
                <Area type="monotone" dataKey="cost" stroke="#bc13fe" fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-primary/20">
          <CardHeader>
            <CardTitle className="font-headline text-lg text-primary">CARBON SAVINGS MATRIX</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #00ff88', borderRadius: '4px' }}
                  itemStyle={{ color: '#00ff88' }}
                />
                <Bar dataKey="carbon" fill="#00ff88" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card className="bg-black/50 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline text-lg text-primary">DETECTED GHOST INSTANCES</CardTitle>
            <Activity className={`w-4 h-4 text-primary ${isGhostMode ? 'animate-spin' : 'animate-pulse'}`} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center justify-between p-4 border rounded-lg font-code transition-all duration-300 ${isGhostMode ? 'border-secondary/50 bg-secondary/5' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-colors ${isGhostMode ? 'bg-secondary shadow-secondary' : 'bg-primary shadow-primary'}`}></div>
                    <div>
                      <p className="text-white">NODE-X-{1000 + i}</p>
                      <p className="text-xs text-muted-foreground">ID: aws-us-east-1-{i*999}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary">CPU: 2.1%</p>
                    <p className="text-xs text-muted-foreground">NET: 4.5MB</p>
                  </div>
                  <button className={`px-4 py-1 border transition-all text-xs ${isGhostMode ? 'border-secondary text-secondary hover:bg-secondary hover:text-white' : 'border-primary text-primary hover:bg-primary hover:text-black'}`}>
                    {isGhostMode ? 'PURGING...' : 'TERMINATE'}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, sub }: { title: string, value: string, icon: React.ReactNode, sub: string }) {
  return (
    <Card className="bg-black/40 border-white/10 hover:border-primary/50 transition-all group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <CardHeader className="pb-2">
        <p className="text-[10px] font-code text-muted-foreground uppercase tracking-tighter">{title}</p>
        <CardTitle className="text-3xl font-headline text-white">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[10px] font-code text-secondary">{sub}</p>
      </CardContent>
    </Card>
  );
}
