"use client"

import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import Register from './Register';
import Dashboard from './Dashboard';
import { useUser } from '@/firebase';

type AppState = 'SPLASH' | 'REGISTER' | 'DASHBOARD';

export default function SentinelOps() {
  const [currentView, setCurrentView] = useState<AppState>('SPLASH');
  const { user, isUserLoading } = useUser();

  // Automatically transition to Dashboard if user is logged in
  useEffect(() => {
    if (!isUserLoading && user && currentView !== 'DASHBOARD') {
      setCurrentView('DASHBOARD');
    }
  }, [user, isUserLoading, currentView]);

  return (
    <div className="min-h-screen">
      {currentView === 'SPLASH' && (
        <SplashScreen onComplete={() => setCurrentView(user ? 'DASHBOARD' : 'REGISTER')} />
      )}
      
      {currentView === 'REGISTER' && !user && (
        <Register onSuccess={() => setCurrentView('DASHBOARD')} />
      )}
      
      {currentView === 'DASHBOARD' && user && (
        <Dashboard />
      )}
    </div>
  );
}
