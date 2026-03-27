"use client"

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar
} from 'recharts';
import { Ghost, Leaf, TrendingDown, Cpu, Activity, LogOut } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-[#050505] p-6 text-white cyber-grid">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-primary/20">
        <div>
          <h1 className="text-3xl font-headline text-primary neon-text">OPERATIONS CENTER</h1>
          <p className="font-code text-secondary text-sm">SENTINEL-NODE: ALPHA-7</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-code text-xs">UPLINK ACTIVE</span>
          </div>
          <button className="p-2 text-muted-foreground hover:text-white transition-colors">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

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
          <CardHeader>
            <CardTitle className="font-headline text-lg text-primary">DETECTED GHOST INSTANCES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-white/5 bg-white/5 rounded-lg font-code">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#bc13fe]"></div>
                    <div>
                      <p className="text-white">NODE-X-{1000 + i}</p>
                      <p className="text-xs text-muted-foreground">ID: aws-us-east-1-{i*999}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary">CPU: 2.1%</p>
                    <p className="text-xs text-muted-foreground">NET: 4.5MB</p>
                  </div>
                  <button className="px-4 py-1 border border-primary text-primary hover:bg-primary hover:text-black transition-all text-xs">TERMINATE</button>
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
