"use client"

import { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, CheckCircle2, IndianRupee, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UpiPaymentUplinkProps {
  amount: number; // In INR
  onSuccess: () => void;
  requireSecurity: (action: () => void) => void;
}

export default function UpiPaymentUplink({ amount, onSuccess, requireSecurity }: UpiPaymentUplinkProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS'>('IDLE');

  // Generate dynamic transaction ID
  const transactionId = useMemo(() => {
    return `TR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }, []);

  // Construct UPI Deep Link
  // Spec: upi://pay?pa=<vpa>&pn=<name>&mc=<mcc>&tr=<txn_ref>&am=<amount>&cu=<currency>&tn=<note>
  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: 'sentinel-ops@upi',
      pn: 'Sentinel Infrastructure Division',
      mc: '0000',
      tr: transactionId,
      am: amount.toString(),
      cu: 'INR',
      tn: `Sentinel-Ops Infrastructure EMI - ${new Date().toLocaleString('default', { month: 'long' })}`
    });
    return `upi://pay?${params.toString()}`;
  }, [amount, transactionId]);

  const handleAuthorize = () => {
    requireSecurity(() => {
      setIsAuthorized(true);
      setPaymentStatus('PENDING');
    });
  };

  // Mock payment verification loop
  useEffect(() => {
    if (paymentStatus === 'PENDING') {
      const timer = setTimeout(() => {
        setPaymentStatus('SUCCESS');
        onSuccess(); // Trigger receipt generation and WhatsApp dispatch
      }, 5000); // Simulate network verification delay
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, onSuccess]);

  return (
    <div className="w-full max-w-sm mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-[2.5rem] border-primary/20 relative overflow-hidden group"
      >
        {/* Decorative Background Elements */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        
        <div className="text-center mb-8 relative z-10">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9px] mb-4 uppercase tracking-[0.2em] font-bold">
            <ShieldCheck className="w-3 h-3 mr-2" /> Secure FinOps Node
          </Badge>
          <h3 className="text-2xl font-bold tracking-tighter text-white uppercase mb-1">UPI Uplink</h3>
          <p className="text-[10px] text-secondary uppercase tracking-widest font-semibold">Infrastructure EMI Payment</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[240px] relative z-10">
          <AnimatePresence mode="wait">
            {!isAuthorized ? (
              <motion.div 
                key="locked"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-40 h-40 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 mb-6 relative">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl"
                  />
                  <Lock className="w-12 h-12 text-primary/40" />
                </div>
                <Button 
                  onClick={handleAuthorize}
                  className="btn-physics bg-primary text-black font-bold h-12 px-8 rounded-xl uppercase text-xs"
                >
                  Authorize Node Link
                </Button>
              </motion.div>
            ) : paymentStatus === 'PENDING' ? (
              <motion.div 
                key="qr"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="p-4 bg-white rounded-3xl shadow-[0_0_50px_rgba(122,162,247,0.3)] mb-6">
                  <QRCodeSVG 
                    value={upiLink}
                    size={160}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "/cyber-hex-logo.svg", // This is a placeholder or you can use a base64 of the logo
                      x: undefined,
                      y: undefined,
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>
                <div className="flex flex-col items-center gap-3">
                  <p className="text-[11px] text-white font-bold tracking-tight flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" /> 
                    WAITING FOR BANK UPLINK...
                  </p>
                  <p className="text-[9px] text-secondary uppercase font-semibold">REF: {transactionId}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-[#9ECE6A]/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#9ECE6A]" />
                </div>
                <h4 className="text-lg font-bold text-white uppercase mb-2">Payment Verified</h4>
                <p className="text-[10px] text-secondary uppercase leading-relaxed font-semibold">
                  Transaction complete. Syncing receipt across secure nodes...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] text-secondary uppercase tracking-widest font-bold">Total Payable</p>
              <p className="text-xl font-bold text-primary neon-text flex items-center gap-1 tracking-tighter">
                <IndianRupee className="w-4 h-4" /> {amount.toLocaleString()}
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-accent opacity-20" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <div className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs", className)}>
      {children}
    </div>
  );
}
