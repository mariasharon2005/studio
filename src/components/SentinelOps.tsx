"use client"

import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import Register from './Register';
import Dashboard from './Dashboard';
import BiometricVerify from './BiometricVerify';
import { useUser } from '@/firebase';

type AppState = 'SPLASH' | 'REGISTER' | 'BIOMETRIC' | 'DASHBOARD';

export default function SentinelOps() {
  const [currentView, setCurrentView] = useState<AppState>('SPLASH');
  const { user, isUserLoading } = useUser();

  // Reset to Splash if needed, but normally handled by initial state
  // This effect handles the transition logic after Splash or Auth changes
  useEffect(() => {
    // If we are in DASHBOARD but user logs out, go to REGISTER
    if (!isUserLoading && !user && currentView === 'DASHBOARD') {
      setCurrentView('REGISTER');
    }
  }, [user, isUserLoading, currentView]);

  const handleSplashComplete = () => {
    if (user) {
      setCurrentView('BIOMETRIC');
    } else {
      setCurrentView('REGISTER');
    }
  };

  const handleRegisterSuccess = () => {
    // After registration, we go to Biometric for first-time link
    setCurrentView('BIOMETRIC');
  };

  const handleBiometricSuccess = () => {
    setCurrentView('DASHBOARD');
  };

  return (
    <div className="min-h-screen">
      {currentView === 'SPLASH' && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {currentView === 'REGISTER' && !user && (
        <Register onSuccess={handleRegisterSuccess} />
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
