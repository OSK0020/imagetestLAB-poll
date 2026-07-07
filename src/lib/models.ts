import React from 'react';
import { Sparkles, Zap, Settings2 } from 'lucide-react';

export const MODELS = [
  { id: 'all', name: 'All Models', iconName: 'Sparkles' },
  { id: 'flux', name: 'Flux Schnell', iconName: 'Zap' },
  { id: 'flux-2-dev', name: 'FLUX.2 Dev', iconName: 'Sparkles' },
  { id: 'dirtberry', name: 'Dirtberry', iconName: 'Settings2' },
  { id: 'zimage', name: 'Z-Image Turbo', iconName: 'Zap' },
  { id: 'imagen-4', name: 'Imagen 4', iconName: 'Settings2' },
  { id: 'grok-imagine', name: 'Grok Imagine', iconName: 'Sparkles' },
  { id: 'klein', name: 'FLUX.2 Klein 4B', iconName: 'Zap' },
  { id: 'gptimage', name: 'GPT Image 1 Mini', iconName: 'Sparkles' },
  { id: 'klein-large', name: 'FLUX.2 Klein 9B', iconName: 'Zap' }
];

export const getIcon = (name: string) => {
  switch (name) {
    case 'Sparkles': return Sparkles;
    case 'Zap': return Zap;
    case 'Settings2': return Settings2;
    default: return Sparkles;
  }
};
