"use client"

import { useState } from 'react';
import SplashScreen from './SplashScreen';
import Register from './Register';
import Dashboard from './Dashboard';

type AppState = 'SPLASH' | 'REGISTER' | 'DASHBOARD';

export default function SentinelOps() {
  const [currentView, setCurrentView] = useState<AppState>('SPLASH');

  return (
    <div className="min-h-screen">
      {currentView === 'SPLASH' && (
        <SplashScreen onComplete={() => setCurrentView('REGISTER')} />
      )}
      
      {currentView === 'REGISTER' && (
        <Register onSuccess={() => setCurrentView('DASHBOARD')} />
      )}
      
      {currentView === 'DASHBOARD' && (
        <Dashboard />
      )}
    </div>
  );
}
