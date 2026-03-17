'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from '@/components/ThreeBackground';
import SplashScreen from '@/components/SplashScreen';
import BentoGallery from '@/components/BentoGallery';
import GenerationBar from '@/components/GenerationBar';
import Sidebar from '@/components/Sidebar';
import { usePollinations } from '@/hooks/usePollinations';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { LogOut, Maximize2, X, Aperture, Sun, Moon, Menu, User as UserIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'generator' | 'archive'>('generator');
  
  const { user, signIn, logout: firebaseLogout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const { 
    images, 
    history,
    isGenerating, 
    isTranslating, 
    keyAnalysis, 
    generateImage, 
    verifyKey, 
    fetchHistory 
  } = usePollinations(apiKey, user?.uid || null);

  // Load API key
  useEffect(() => {
    const savedKey = localStorage.getItem('pollinations_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Fetch history when user signs in
  useEffect(() => {
    if (user && apiKey) {
      fetchHistory();
    }
  }, [user, apiKey, fetchHistory]);

  const handleConnect = async (key: string): Promise<boolean> => {
    setIsVerifying(true);
    const isValid = await verifyKey(key);
    
    if (isValid) {
      setApiKey(key);
      localStorage.setItem('pollinations_api_key', key);
    }
    
    setIsVerifying(false);
    return !!isValid;
  };

  const handleLogout = () => {
    setApiKey(null);
    localStorage.removeItem('pollinations_api_key');
    firebaseLogout();
  };

  return (
    <main className="min-h-screen text-slate-950 dark:text-white overflow-x-hidden selection:bg-purple-500/30">
      <ThreeBackground />
      
      <AnimatePresence mode="wait">
        {!apiKey ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
          >
            <SplashScreen onConnect={handleConnect} isVerifying={isVerifying} />
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 pt-24 pb-40"
          >
            {/* Header */}
            <div className={cn(
               "fixed top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center transition-all duration-500",
               "bg-white/80 dark:bg-black/20 backdrop-blur-xl border-b border-white/5"
            )}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all border border-slate-200 dark:border-white/5"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/10 p-0.5">
                    <div className="w-full h-full rounded-xl border border-white/20 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                      <Aperture className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h1 className="text-xl font-black tracking-tighter uppercase hidden sm:block">
                    AI Lab <span className="text-purple-500">Modern</span>
                    {view === 'archive' && <span className="ml-3 text-xs opacity-50 font-medium bg-white/10 px-2 py-1 rounded-lg">ARCHIVE</span>}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {view === 'archive' && (
                  <button
                    onClick={() => setView('generator')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
                  >
                    Back to Gen
                  </button>
                )}
                <button
                  onClick={toggleTheme}
                  className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-2xl transition-all"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {user ? (
                   <button 
                     onClick={() => setIsSidebarOpen(true)}
                     className="flex items-center gap-2 p-1 pr-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold text-sm"
                   >
                     <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-purple-500" alt="" />
                     <span className="hidden md:inline">{user.displayName?.split(' ')[0]}</span>
                   </button>
                ) : (
                  <button
                    onClick={signIn}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-2xl transition-all text-sm font-bold text-white shadow-xl shadow-purple-500/20"
                  >
                    <UserIcon className="w-4 h-4" />
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Translation Progress Toast */}
            <AnimatePresence>
              {isTranslating && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="fixed top-28 left-1/2 z-[100] bg-blue-600/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="text-sm font-bold text-white tracking-wide">Gemini Translating Prompt...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Content */}
            <BentoGallery images={view === 'generator' ? images : history} onOpenImage={setSelectedImage} />
            
            {/* Bottom Input Area */}
            {view === 'generator' && (
              <GenerationBar onGenerate={generateImage} isGenerating={isGenerating} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        apiKey={apiKey}
        keyAnalysis={keyAnalysis}
        usageCount={images.length}
        history={history}
        onViewArchive={() => setView('archive')}
      />

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-10 right-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
            <motion.img
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              src={selectedImage}
              className="max-w-full max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
