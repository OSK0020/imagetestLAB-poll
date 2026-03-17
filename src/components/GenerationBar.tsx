'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Zap, SlidersHorizontal, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationBarProps {
  onGenerate: (prompt: string, model: string) => void;
  isGenerating: boolean;
}

const MODELS = [
  { id: 'all', name: 'All Models (Sequential)', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'flux', name: 'Flux Schnell', icon: <Zap className="w-3 h-3" /> },
  { id: 'flux-2-dev', name: 'FLUX.2 Dev', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'dirtberry', name: 'Dirtberry', icon: <Settings2 className="w-3 h-3" /> },
  { id: 'zimage', name: 'Z-Image Turbo', icon: <Zap className="w-3 h-3" /> },
  { id: 'imagen-4', name: 'Imagen 4', icon: <Settings2 className="w-3 h-3" /> },
  { id: 'grok-imagine', name: 'Grok Imagine', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'klein', name: 'FLUX.2 Klein 4B', icon: <Zap className="w-3 h-3" /> },
  { id: 'gptimage', name: 'GPT Image 1 Mini', icon: <Sparkles className="w-3 h-3" /> },
  { id: 'klein-large', name: 'FLUX.2 Klein 9B', icon: <Zap className="w-3 h-3" /> }
];

export default function GenerationBar({ onGenerate, isGenerating }: GenerationBarProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [showModels, setShowModels] = useState(false);

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative flex items-center gap-3 p-3 bg-white/90 dark:bg-[#1A1A1A]/80 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Model Selector */}
        <div className="relative">
          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center gap-3 px-6 py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full text-slate-900 dark:text-white text-[13px] font-bold transition-all border border-slate-200 dark:border-white/10 min-h-[48px]"
          >
            {selectedModel.icon}
            <span className="hidden md:inline">{selectedModel.name}</span>
            <span className="md:hidden">Model</span>
            <SlidersHorizontal className="w-4 h-4 opacity-50 ml-1" />
          </button>

          <AnimatePresence>
            {showModels && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: -10, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                className="absolute bottom-full left-0 mb-4 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 p-2 rounded-3xl shadow-2xl min-w-[240px] max-h-[400px] overflow-y-auto custom-scrollbar"
              >
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModels(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-[13px] font-bold transition-all text-slate-900 dark:text-white",
                      selectedModel.id === model.id ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    {model.icon}
                    {model.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isGenerating && onGenerate(prompt, selectedModel.id)}
            placeholder="Describe your vision..."
            className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white px-4 text-xl placeholder:text-slate-400 dark:placeholder:text-gray-500 font-medium tracking-tight"
          />
        </div>

        {/* Generate Button */}
        <button
          disabled={!prompt.trim() || isGenerating}
          onClick={() => onGenerate(prompt, selectedModel.id)}
          className={cn(
            "group flex items-center justify-center p-5 rounded-full transition-all duration-500",
            prompt.trim() ? "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20" : "bg-white/5 text-gray-500"
          )}
        >
          {isGenerating ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className={cn("w-6 h-6 transition-transform duration-500", prompt.trim() && "group-hover:translate-x-1 group-hover:-translate-y-1")} />
          )}
        </button>
      </motion.div>
    </div>
  );
}
