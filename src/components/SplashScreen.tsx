'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Aperture, ArrowRight, HelpCircle, Loader2, Lock, ShieldCheck, Mail, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';

interface SplashScreenProps {
  onConnect: (key: string) => Promise<boolean>;
  isVerifying: boolean;
}

export default function SplashScreen({ onConnect, isVerifying }: SplashScreenProps) {
  const [key, setKey] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const { user, signIn } = useAuth();

  const handleStart = async () => {
    if (!key.trim()) {
      setErrorStatus('Please provide a secret key to proceed.');
      return;
    }
    
    setErrorStatus(null);
    const success = await onConnect(key);
    if (!success) {
      setErrorStatus('Invalid or inactive secret key. Please double-check your credentials.');
    }
  };

  // Clear error after some time
  useEffect(() => {
    if (errorStatus) {
      const timer = setTimeout(() => setErrorStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorStatus]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-[#0F071A] transition-colors duration-500 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[480px] mx-auto"
      >
        {/* Custom Error Toast */}
        <AnimatePresence>
          {errorStatus && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute -top-16 left-0 right-0 z-50 flex justify-center"
            >
              <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400/20 backdrop-blur-md">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-bold tracking-tight">{errorStatus}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          className="backdrop-blur-[40px] border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.05)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden relative group flex flex-col items-center bg-white/70 dark:bg-[#0F071A]/80"
        >
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Logo Section */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl p-0.5 border border-white/20"
            >
              <div className="w-full h-full rounded-[1.8rem] border border-white/20 flex items-center justify-center animate-[spin_30s_linear_infinite]">
                <Aperture className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-4xl font-black text-center mb-2 tracking-tighter dark:text-white text-slate-900">
              AI Lab <span className="text-purple-500">Modern</span>
            </h1>
            
            <p className="text-slate-500 dark:text-gray-400 text-center mb-10 text-base font-medium leading-relaxed max-w-[280px]">
              Securely access professional AI model generation.
            </p>

            {/* Google Sign-In (Optional) */}
            <div className="w-full mb-8">
              <button
                onClick={signIn}
                className={cn(
                  "w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 border",
                  user 
                    ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400 pointer-events-none" 
                    : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 dark:text-white text-slate-900 hover:bg-slate-200 dark:hover:bg-white/10"
                )}
              >
                {user ? (
                  <>
                    <img src={user.photoURL || ''} className="w-6 h-6 rounded-full" alt="" />
                    Syncing as {user.displayName?.split(' ')[0]}
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Sign in with Google (Optional)
                  </>
                )}
              </button>
              <p className="text-[10px] text-center mt-3 text-slate-400 uppercase font-black tracking-widest opacity-50">
                OR PROCEED WITH SECRET KEY
              </p>
            </div>

            {/* Mandatory Secret Key Section */}
            <div className="w-full space-y-4">
              <div className="relative w-full group/input">
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Paste your Secret Key (sk_...)"
                  className={cn(
                    "w-full border rounded-2xl py-4 pl-14 pr-6 bg-slate-50 dark:bg-black/40 outline-none transition-all text-lg font-medium",
                    "border-slate-200 dark:border-white/10 dark:text-white text-slate-900 focus:ring-2 focus:ring-purple-500/50",
                    key.startsWith('sk_') && "ring-2 ring-green-500/30 border-green-500/50"
                  )}
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2">
                  {key.startsWith('sk_') ? (
                    <ShieldCheck className="w-5 h-5 text-green-500 animate-pulse" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400 group-focus-within/input:text-purple-500 transition-colors" />
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity w-fit"
                >
                  <HelpCircle className="w-4 h-4" />
                  How do I find my Secret Key?
                </button>
                
                <AnimatePresence>
                  {showHelp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-purple-600/5 dark:bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 text-xs text-slate-600 dark:text-purple-200/90 space-y-3 mt-1 backdrop-blur-md">
                        <div className="flex gap-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg h-fit"><Info className="w-4 h-4 text-purple-500" /></div>
                          <div className="space-y-2">
                            <p className="font-bold text-purple-600 dark:text-purple-400">Strict Step-by-Step Guide:</p>
                            <ol className="list-decimal list-inside space-y-1 opacity-80 font-medium">
                              <li>Go to <a href="https://enter.pollinations.ai" target="_blank" className="underline font-bold text-purple-500">enter.pollinations.ai</a></li>
                              <li>Sign in with your email or GitHub.</li>
                              <li>Go to <b>API Management</b> section.</li>
                              <li>Click <b>Generate New Key</b> & copy the string starting with <code className="bg-white/10 px-1 rounded text-purple-500">sk_</code></li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  disabled={isVerifying}
                  onClick={handleStart}
                  className={cn(
                    "w-full py-5 px-8 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group/btn",
                    "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white",
                    "disabled:from-slate-200 disabled:to-slate-200 dark:disabled:from-slate-800 dark:disabled:to-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {isVerifying ? (
                      <motion.div
                        key="verifying"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Validating Identity...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center justify-center gap-3 w-full"
                      >
                        <span>Activate Lab Access</span>
                        <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Premium Glow Effect */}
                  {!isVerifying && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
