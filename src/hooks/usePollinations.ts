'use client';

import { useState, useCallback, useRef } from 'react';
import { db } from '@/lib/firebase';
import { GENERATION_MODELS } from '@/lib/models';
import { collection, doc, setDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface ImageItem {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
}

export interface KeyAnalysis {
  limit: number;
  spent: number;
  isPremium: boolean;
  percentage: number;
  rateLimit: string;
}

export function usePollinations(apiKey: string | null, uid: string | null) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [history, setHistory] = useState<ImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [keyAnalysis, setKeyAnalysis] = useState<KeyAnalysis | null>(null);
  
  // Sequential queue management
  const queueRef = useRef<{prompt: string, model: string}[]>([]);
  const isProcessingQueue = useRef(false);
  const stopRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const translatePrompt = async (prompt: string): Promise<string> => {
    const hasHebrew = /[\u0590-\u05FF]/.test(prompt);
    if (!hasHebrew) return prompt;

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userKey: apiKey
        }),
        signal: abortControllerRef.current?.signal
      });
      if (!res.ok) throw new Error('Translation request failed.');
      const { text } = await res.json();
      return typeof text === 'string' && text.trim() ? text.trim() : prompt;
    } catch (err) {
      console.error("Translation fail:", err);
      return prompt;
    } finally {
      setIsTranslating(false);
    }
  };

  const generateMedia = async (prompt: string, model: string, seed: number): Promise<string> => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model,
        seed,
        width: 1024,
        height: 1024,
        userKey: apiKey
      }),
      signal: abortControllerRef.current?.signal
    });

    const result = await response.json();
    if (!response.ok || typeof result.url !== 'string') {
      throw new Error(result.error || 'Generation failed.');
    }
    return result.url;
  };

  const saveToFirestore = async (item: ImageItem) => {
    if (!uid) return;
    try {
      const historyRef = doc(collection(db, 'users', uid, 'history'), item.id);
      await setDoc(historyRef, item);
    } catch (err) {
      console.error("Firestore save error:", err);
    }
  };

  const processQueue = async () => {
    if (isProcessingQueue.current || queueRef.current.length === 0) return;
    
    isProcessingQueue.current = true;
    setIsGenerating(true);
    stopRef.current = false;
    abortControllerRef.current = new AbortController();

    while (queueRef.current.length > 0 && !stopRef.current) {
      const { prompt, model } = queueRef.current.shift()!;
      
      try {
        const englishPrompt = await translatePrompt(prompt);
        const id = Date.now().toString();
        const seed = Math.floor(Math.random() * 1000000);
        
        const url = await generateMedia(englishPrompt, model, seed);
        
        const newImage: ImageItem = {
          id,
          url,
          prompt: englishPrompt,
          model,
          timestamp: Date.now()
        };

        setImages(prev => [newImage, ...prev]);
        setHistory(prev => [newImage, ...prev].slice(0, 50));
        saveToFirestore(newImage);
        
        // Wait for image to load or at least give a gap for rate limiting (cooldown)
        // If stopping, break the loop
        if (stopRef.current) break;
        await new Promise(r => setTimeout(r, 4000));
      } catch (err) {
        console.error("Queue item failed:", err);
      }
    }

    setIsGenerating(false);
    isProcessingQueue.current = false;
    abortControllerRef.current = null;
  };

  const clearHistory = async () => {
    if (!uid) {
      setImages([]);
      setHistory([]);
      return;
    }
    try {
      // In a real app, you'd use a cloud function or batch, 
      // but for this small prototype we'll fetch then delete or just truncate.
      const q = query(collection(db, 'users', uid, 'history'));
      const querySnapshot = await getDocs(q);
      const { deleteDoc } = await import('firebase/firestore');
      const realP = querySnapshot.docs.map(d => deleteDoc(doc(db, 'users', uid, 'history', d.id)));
      await Promise.all(realP);
      setHistory([]);
    } catch (err) {
      console.error("Clear history error:", err);
    }
  };

  const stopGeneration = () => {
    stopRef.current = true;
    queueRef.current = [];
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const addToQueue = async (prompt: string, model: string) => {
    if (model === 'all') {
      stopRef.current = false;
      setIsGenerating(true);
      setImages([]); // Clear screen for new gallery as requested
      abortControllerRef.current = new AbortController();
      
      const englishPrompt = await translatePrompt(prompt);
      
      const promises = GENERATION_MODELS.map(async (m) => {
        if (stopRef.current) return;
        
        try {
          const id = Date.now().toString() + m;
          const seed = Math.floor(Math.random() * 1000000);
          const url = await generateMedia(englishPrompt, m, seed);
          
          const newImage: ImageItem = {
            id,
            url,
            prompt: englishPrompt,
            model: m,
            timestamp: Date.now()
          };

          setImages(prev => [...prev, newImage]); // Append for concurrent view
          setHistory(prev => [newImage, ...prev].slice(0, 50));
          saveToFirestore(newImage);
        } catch (err) {
            console.error(`Concurrent generation failed for ${m}:`, err);
        }
      });

      await Promise.all(promises);
      setIsGenerating(false);
      abortControllerRef.current = null;
    } else {
      queueRef.current.push({ prompt, model });
      processQueue();
    }
  };

  const fetchHistory = useCallback(async () => {
    if (!uid) return;
    try {
      const q = query(
        collection(db, 'users', uid, 'history'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      const historyItems: ImageItem[] = [];
      querySnapshot.forEach((doc) => {
        historyItems.push(doc.data() as ImageItem);
      });
      setHistory(historyItems);
    } catch (err) {
      console.error("Firestore fetch error:", err);
    }
  }, [uid]);

  const verifyAndAnalyzeKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      if (!response.ok) {
        setKeyAnalysis(null);
        return false;
      }

      const data = await response.json();
      const availableBalance = Number(data.balance?.balance) || 0;
      setKeyAnalysis({
        limit: availableBalance,
        spent: 0,
        isPremium: availableBalance > 0,
        percentage: 0,
        rateLimit: 'Balance-backed'
      });
      return true;
    } catch {
      setKeyAnalysis(null);
      return false;
    }
  };

  return {
    images,
    history,
    isGenerating,
    isTranslating,
    keyAnalysis,
    generateImage: addToQueue,
    verifyKey: verifyAndAnalyzeKey,
    fetchHistory,
    stopGeneration,
    clearHistory
  };
}
