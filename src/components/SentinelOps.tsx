"use client"

import { useState, useEffect, useCallback } from 'react';
import SplashScreen from './SplashScreen';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import BiometricVerify from './BiometricVerify';
import { useUser } from '@/firebase';

type AppState = 'SPLASH' | 'LOGIN' | 'REGISTER' | 'BIOMETRIC' | 'DASHBOARD';

export default function SentinelOps() {
  const [currentView, setCurrentView] = useState<AppState>('SPLASH');
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user && (currentView === 'DASHBOARD' || currentView === 'BIOMETRIC')) {
      setCurrentView('LOGIN');
    }
  }, [user, isUserLoading, currentView]);

  const handleSplashComplete = useCallback(() => {
    if (user) {
      setCurrentView('BIOMETRIC');
    } else {
      setCurrentView('LOGIN');
    }
  }, [user]);

  const handleAuthSuccess = useCallback(() => {
    setCurrentView('BIOMETRIC');
  }, []);

  const handleBiometricSuccess = useCallback(() => {
    setCurrentView('DASHBOARD');
  }, []);

  return (
    <div className="min-h-screen">
      {currentView === 'SPLASH' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {currentView === 'LOGIN' && !user && (
        <Login 
          onSuccess={handleAuthSuccess} 
          onToggleRegister={() => setCurrentView('REGISTER')} 
        />
      )}

      {currentView === 'REGISTER' && !user && (
        <Register 
          onSuccess={handleAuthSuccess} 
          onToggleLogin={() => setCurrentView('LOGIN')} 
        />
      )}

      {currentView === 'BIOMETRIC' && (
        <BiometricVerify onSuccess={handleBiometricSuccess} />
      )}
      
      {currentView === 'DASHBOARD' && user && (
        <Dashboard />
      )}
    </div>
  );
}
