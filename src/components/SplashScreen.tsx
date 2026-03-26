'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Loader2, Lock, ShieldCheck, Info, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';
import { Language, translations } from '@/lib/translations';

interface SplashScreenProps {
  onConnect: (key: string) => Promise<boolean>;
  isVerifying: boolean;
  language?: Language;
}

export default function SplashScreen({ onConnect, isVerifying, language = 'en' }: SplashScreenProps) {
  const [key, setKey] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const { user, signIn } = useAuth();
  
  const t = translations[language];

  const handleStart = async () => {
    if (!key.trim()) {
      setErrorStatus(language === 'he' ? 'אנא הזן מפתח סודי כדי להמשיך.' : 'Please provide a secret key to proceed.');
      return;
    }
    
    if (!hasPermission) {
      setErrorStatus(language === 'he' ? 'עליך לאשר את הגישה לנתוני החשבון שלך.' : 'You must authorize access to your account data.');
      return;
    }

    setErrorStatus(null);
    const success = await onConnect(key);
    if (!success) {
      setErrorStatus(language === 'he' ? 'מפתח שגוי או לא פעיל. אנא בדוק את הפרטים.' : 'Invalid or inactive secret key. Please double-check your credentials.');
    }
  };

  useEffect(() => {
    if (errorStatus) {
      const timer = setTimeout(() => setErrorStatus(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-[460px] mx-auto">

        {errorStatus && (
          <div className="mb-4 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {errorStatus}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              {language === 'he' ? 'מעבדת מודלי AI' : 'AI Image Generator'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center mt-1">
              {language === 'he' ? 'גישה מאובטחת לייצור תמונות.' : 'Generate images using Pollinations.ai models.'}
            </p>
          </div>

          <div className="mb-5">
            <button
              onClick={signIn}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 border",
                user 
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 pointer-events-none" 
                  : "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white"
              )}
            >
              {user ? (
                <>
                  <img src={user.photoURL || ''} className="w-5 h-5 rounded-full" alt="" />
                  Signed in as {user.displayName?.split(' ')[0]}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {language === 'he' ? 'התחבר עם גוגל' : 'Sign in with Google'}
                </>
              )}
            </button>
            <p className="text-[11px] text-center mt-2 text-gray-400 uppercase tracking-wider">
              {language === 'he' ? 'או המשך עם מפתח סודי' : 'OR USE SECRET KEY'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                placeholder={language === 'he' ? 'הדבק את המפתח הסודי (sk_...)' : 'Paste your Secret Key (sk_...)'}
                className={cn(
                  "w-full border rounded-lg py-3 pl-10 pr-4 bg-gray-50 dark:bg-gray-700 outline-none text-sm transition-colors",
                  "border-gray-300 dark:border-gray-600 dark:text-white text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500",
                  key.startsWith('sk_') && "border-green-500 focus:border-green-500 focus:ring-green-500"
                )}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {key.startsWith('sk_') ? (
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={hasPermission}
                onChange={(e) => setHasPermission(e.target.checked)}
                className="mt-0.5 accent-purple-600 w-4 h-4"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                {language === 'he' 
                  ? 'אני מאשר גישה מאובטחת לנתוני הפרופיל ויתרת ה-Pollen שלי מ-Pollinations.ai.' 
                  : 'I authorize access to display my profile data and Pollen balance from Pollinations.ai.'}
              </span>
            </label>

            <button
              onClick={handleStart}
              disabled={isVerifying}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {language === 'he' ? 'התחבר' : 'Connect'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div>
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {language === 'he' ? 'איך מוצאים את המפתח הסודי?' : 'How do I find my Secret Key?'}
              </button>
              
              {showHelp && (
                <div className="mt-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4 text-xs text-gray-600 dark:text-purple-200 space-y-1.5">
                  <p className="font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {language === 'he' ? 'מדריך:' : 'Step-by-Step:'}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 opacity-90">
                    {language === 'he' ? (
                      <>
                        <li>התחבר לאתר <a href="https://enter.pollinations.ai" target="_blank" className="underline text-purple-600 dark:text-purple-400">enter.pollinations.ai</a></li>
                        <li>עבור למדור <b>API Management</b> מצד שמאל.</li>
                        <li>לחץ על <b>Generate New Key</b> ושמור את המפתח (<code className="bg-white/20 px-1 rounded">sk_...</code>)</li>
                        <li>הדבק את המפתח כאן.</li>
                      </>
                    ) : (
                      <>
                        <li>Log in to <a href="https://enter.pollinations.ai" target="_blank" className="underline text-purple-600 dark:text-purple-400">enter.pollinations.ai</a></li>
                        <li>Go to <b>API Management</b> on the left sidebar.</li>
                        <li>Click <b>Generate New Key</b> and copy the key (<code className="bg-white/20 px-1 rounded">sk_...</code>)</li>
                        <li>Paste it in the field above.</li>
                      </>
                    )}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
