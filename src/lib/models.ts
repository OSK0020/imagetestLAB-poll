import { Sparkles, Zap, Settings2 } from 'lucide-react';

export const MODELS = [
  { id: 'all', name: 'All Models', iconName: 'Sparkles' },
  { id: 'zimage', name: 'Z-Image Turbo', iconName: 'Zap' },
  { id: 'flux', name: 'Flux Schnell', iconName: 'Zap' },
  { id: 'gptimage', name: 'GPT Image Mini', iconName: 'Sparkles' },
  { id: 'gpt-image-2', name: 'GPT Image 2', iconName: 'Sparkles' },
  { id: 'nanobanana-pro', name: 'Nano Banana Pro', iconName: 'Settings2' },
  { id: 'seedream5', name: 'Seedream 5', iconName: 'Settings2' },
  { id: 'ideogram-v4-turbo', name: 'Ideogram V4 Turbo', iconName: 'Zap' },
  { id: 'grok-imagine', name: 'Grok Imagine', iconName: 'Sparkles' },
  { id: 'klein', name: 'FLUX.2 Klein 4B', iconName: 'Zap' },
  { id: 'p-image', name: 'P-Image', iconName: 'Settings2' }
];

export const GENERATION_MODELS = MODELS.filter(({ id }) => id !== 'all').map(({ id }) => id);

export const getIcon = (name: string) => {
  switch (name) {
    case 'Sparkles': return Sparkles;
    case 'Zap': return Zap;
    case 'Settings2': return Settings2;
    default: return Sparkles;
  }
};
