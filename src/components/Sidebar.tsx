'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User as UserIcon, 
  History, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Zap,
  BarChart3,
  Maximize2
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { KeyAnalysis, ImageItem } from '@/hooks/usePollinations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string | null;
  keyAnalysis: KeyAnalysis | null;
  usageCount: number;
  history: ImageItem[];
  onViewArchive: () => void;
}

export default function Sidebar({ isOpen, onClose, apiKey, keyAnalysis, usageCount, history, onViewArchive }: SidebarProps) {
  const { user, logout, signIn } = useAuth();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
              <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[90vw] bg-white dark:bg-[#0D0D0D] border-l border-slate-200 dark:border-white/10 z-[101] shadow-2xl flex flex-col text-slate-900 dark:text-white"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Profile & Labs</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Profile */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 dark:from-purple-600/10 dark:to-blue-600/10 border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden">
                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    {user ? (
                      <img src={user.photoURL || ''} alt="" className="w-12 h-12 rounded-full border-2 border-purple-500 shadow-xl" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{user?.displayName || 'Guest Builder'}</h3>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-widest px-2 py-1 bg-purple-500/10 rounded-full border border-purple-500/10">
                        {keyAnalysis?.isPremium ? 'PRO MEMBER' : 'STANDARD'}
                      </span>
                    </div>
                  </div>

                  {!user && (
                    <button 
                      onClick={signIn}
                      className="w-full py-3 bg-slate-900 dark:bg-white/10 hover:opacity-90 text-white rounded-2xl font-bold transition-all text-sm mb-2"
                    >
                      Sign in with Google
                    </button>
                  )}
                </div>

                {/* Key Analysis / Deep Scan */}
                {apiKey && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-purple-500" />
                      Deep Scan Analysis
                    </h4>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                      {/* Budget Spent vs Remaining Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-400">Pollen Spent: {keyAnalysis?.spent || 0}</span>
                          <span className="text-slate-400">Limit: {keyAnalysis?.limit || 100}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${keyAnalysis?.percentage || 0}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Rate Limit</div>
                          <div className="text-xs font-bold">{keyAnalysis?.rateLimit || 'N/A'}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Status</div>
                          <div className="text-xs font-bold text-green-500">Active</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* History Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <History className="w-3 h-3" />
                    Cloud History
                  </h4>
                  {user ? (
                    <div className="space-y-4">
                       <button 
                         onClick={() => {
                           onViewArchive();
                           onClose();
                         }}
                         className="w-full py-4 bg-purple-600/5 dark:bg-purple-600/10 hover:bg-purple-600/10 dark:hover:bg-purple-600/20 text-purple-600 dark:text-purple-500 rounded-2xl font-bold transition-all text-sm border border-purple-500/10 flex items-center justify-center gap-2 shadow-sm shadow-purple-500/10"
                       >
                         <Maximize2 className="w-4 h-4" />
                         Open Archive View
                       </button>

                       <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                         {history.slice(0, 10).map((item) => (
                           <div 
                             key={item.id}
                             className="group flex gap-3 p-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer overflow-hidden"
                           >
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.url} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-slate-300 truncate tracking-tight">"{item.prompt}"</p>
                                <p className="text-[9px] text-slate-500 font-medium">{item.model}</p>
                              </div>
                           </div>
                         ))}
                         {history.length === 0 && (
                            <div className="text-center py-6 text-[11px] text-slate-500 border border-white/5 border-dashed rounded-xl">
                              No history found.
                            </div>
                         )}
                       </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs text-slate-500 border border-white/5 border-dashed rounded-2xl">
                       Sign in to save history
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
                {user && (
                  <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl font-bold transition-all text-sm mb-4 border border-red-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Account
                  </button>
                )}
                <div className="text-center text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">
                  v1.2.0-Alpha Premium
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
