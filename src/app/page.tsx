'use client';

import React from 'react';
import { Aperture, ShieldAlert } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07030F] text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-xl space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg border border-white/20 animate-pulse">
          <Aperture className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
          AI Models Laboratory
        </h1>
        
        <p className="text-slate-400 font-medium">
          Welcome to the Public Code Preview of AI Models Laboratory.
        </p>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-purple-200">Proprietary Source Protection</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                To prevent unauthorized duplication and clones of this application, the complete frontend dashboard UI components and 3D WebGL assets are hosted in a secure private repository.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium pt-4">
          Please refer to the repository's API routes under <code className="text-purple-400">src/app/api/</code> and logic modules under <code className="text-purple-400">src/lib/</code> to inspect full-stack code quality.
        </div>
      </div>
    </div>
  );
}
