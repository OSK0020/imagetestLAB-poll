'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Aperture, ArrowRight, HelpCircle, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onConnect: (key: string) => Promise<void>;
  isVerifying: boolean;
}

export default function SplashScreen({ onConnect, isVerifying }: SplashScreenProps) {
  const [key, setKey] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#0F071A]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[460px] mx-auto"
      >
        {/* Glassmorphism Card */}
        <div 
          className="backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden relative group flex flex-col items-center"
          style={{ background: 'rgba(15, 7, 26, 0.8)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-30 pointer-events-none" />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl p-0.5 border border-white/10"
            >
              <div className="w-full h-full rounded-xl border border-white/20 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                <Aperture className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-black text-center mb-1 tracking-tighter text-white"
            >
              AI Lab <span className="text-purple-400">Modern</span>
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-center mb-10 text-base font-medium"
            >
              The ultimate generation experience.
            </motion.p>

            {/* Form Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full space-y-6"
            >
              <div className="relative w-full group/input">
                <input
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter Pollinations API Key..."
                  className="w-full border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-lg"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white' }}
                />
                <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="flex items-center gap-2 text-sm text-purple-400/90 hover:text-purple-400 transition-colors w-fit px-1 font-semibold bg-transparent border-none cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  How to get a key?
                </button>
                
                <AnimatePresence>
                  {showHelp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-sm text-purple-200/90 space-y-2 mt-2 backdrop-blur-md">
                        <p>1. Visit <a href="https://enter.pollinations.ai" target="_blank" className="text-purple-400 font-bold underline decoration-purple-400/30 underline-offset-4">enter.pollinations.ai</a></p>
                        <p>2. Sign in and generate a secret key (sk_...)</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-4">
                <button
                  disabled={isVerifying || key.length < 10}
                  onClick={() => onConnect(key)}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-2xl relative",
                    "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:from-neutral-900 disabled:to-neutral-900 disabled:text-gray-600 disabled:cursor-not-allowed"
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
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Thinking...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="flex items-center gap-3"
                      >
                        Connect Access
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
