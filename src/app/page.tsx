'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SplashScreen from '@/components/SplashScreen';
import BentoGallery from '@/components/BentoGallery';
import GenerationBar from '@/components/GenerationBar';
import Sidebar from '@/components/Sidebar';
import { usePollinations } from '@/hooks/usePollinations';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { X, Aperture, Sun, Moon, Menu, Loader2, Globe, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations, Language } from '@/lib/translations';
import { MODELS } from '@/lib/models';
import { UserProvider, useUserDashboard } from '@/components/UserContext';

const Hero = ({ language, selectedModelId, onSelectModel }: { language: Language, selectedModelId: string, onSelectModel: (id: string) => void }) => {
  const t = translations[language];
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 mt-16">
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
        {language === 'en' ? 'AI Image Generator' : 'מחולל תמונות AI'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-xl text-base mb-8">
        {language === 'en' 
          ? 'Enter a prompt and generate images using multiple AI models.'
          : 'הכניסו תיאור וצרו תמונות עם מודלי AI שונים.'}
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
        {MODELS.filter(m => m.id !== 'all').map((model) => (
          <button
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            className={cn(
              "px-4 py-2 rounded-full border text-xs font-semibold transition-colors",
              selectedModelId === model.id 
                ? "bg-purple-600 border-purple-600 text-white" 
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-purple-400"
            )}
          >
            {model.name}
          </button>
        ))}
      </div>
    </div>
  );
};

function HomeContent() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [view, setView] = useState<'generator' | 'archive'>('generator');
  const [language, setLanguage] = useState<Language>('en');
  const [showHebrewWarning, setShowHebrewWarning] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  const t = translations[language];
  const { user, signIn, logout: firebaseLogout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { profile, balance, refreshUserData, clearUserData: clearDashboard } = useUserDashboard();
  
  const [recentModel, setRecentModel] = useState<string>('all');
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);

  const { 
    images, 
    history,
    isGenerating, 
    isTranslating, 
    keyAnalysis, 
    generateImage, 
    verifyKey, 
    fetchHistory,
    stopGeneration,
    clearHistory
  } = usePollinations(apiKey, user?.uid || null);

  const onGenerate = (p: string, m: string) => {
    setRecentModel(m);
    generateImage(p, m);
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('pollinations_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      refreshUserData(savedKey);
    }
  }, [refreshUserData]);

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
      await refreshUserData(key);
      setNotification({
        message: language === 'he' 
          ? 'שים לב: נתוני החשבון שלך מגיעים ישירות מ-Pollinations.ai.' 
          : 'Connected! Your account data is loaded from Pollinations.ai.',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 6000);
    }
    
    setIsVerifying(false);
    return !!isValid;
  };

  const handleLogout = () => {
    setApiKey(null);
    localStorage.removeItem('pollinations_api_key');
    clearDashboard();
    firebaseLogout();
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await clearHistory();
      await user.delete();
      handleLogout();
    } catch (err) {
      handleLogout();
    }
  };

  const handleResetKey = () => {
    setApiKey(null);
    localStorage.removeItem('pollinations_api_key');
    clearDashboard();
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'he' : 'en';
    setLanguage(newLang);
    if (newLang === 'he') {
      setShowHebrewWarning(true);
      setTimeout(() => setShowHebrewWarning(false), 6000);
    }
  };

  const getTierIcon = (tier: string) => {
    if (tier === 'Seed') return '🌱';
    if (tier === 'Flower') return '🌸';
    if (tier === 'Nectar') return '🍯';
    return '💎';
  };

  if (!apiKey) {
    return (
      <SplashScreen 
        onConnect={handleConnect} 
        isVerifying={isVerifying} 
        language={language}
      />
    );
  }

  return (
    <main className="min-h-screen text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900" dir={language === 'he' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Aperture className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-base font-bold hidden sm:block">
              {language === 'en' ? 'AI Lab' : 'מעבדת AI'}
              {view === 'archive' && <span className="text-xs font-normal text-gray-500 ml-2">({t.archive})</span>}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {view === 'archive' && (
            <button
              onClick={() => setView('generator')}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {t.backToGen}
            </button>
          )}

          {view === 'generator' && images.length > 0 && (
            <button
              onClick={() => clearHistory()}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 border border-gray-200 dark:border-gray-600 rounded-lg font-medium transition-colors text-gray-600 dark:text-gray-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {language === 'he' ? 'נקה' : 'Clear'}
            </button>
          )}

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={t.language}
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold hidden md:inline">{language.toUpperCase()}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {(user || profile) && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <img 
                src={profile?.image || user?.photoURL || ''} 
                className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-600" 
                alt="" 
              />
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-xs font-semibold truncate max-w-[80px]">
                  {profile?.username || user?.displayName?.split(' ')[0] || 'User'}
                </span>
                {profile?.tier && (
                  <span className="text-[9px] text-purple-500 font-bold">
                    {getTierIcon(profile.tier)} {profile.tier}
                  </span>
                )}
              </div>
            </button>
          )}

          {!user && !profile && (
            <button
              onClick={signIn}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t.signIn}
            </button>
          )}
        </div>
      </header>

      {/* Toast Notifications */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium min-w-[260px] max-w-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="flex-1 text-xs leading-snug">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {showHebrewWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium min-w-[260px] max-w-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="flex-1 text-xs leading-snug">{t.hebrewWarning}</p>
          <button onClick={() => setShowHebrewWarning(false)} className="text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isTranslating && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t.translateToast}
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16 pb-36">
        {view === 'generator' && images.length === 0 && (
          <Hero 
            language={language} 
            selectedModelId={selectedModelId} 
            onSelectModel={setSelectedModelId} 
          />
        )}
        
        <BentoGallery 
          images={view === 'generator' ? images : history} 
          onOpenImage={setSelectedImage} 
          isUniform={recentModel === 'all' && view === 'generator'}
        />
        
        {view === 'generator' && (
          <GenerationBar 
            onGenerate={onGenerate} 
            onStop={stopGeneration}
            isGenerating={isGenerating} 
            language={language} 
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
          />
        )}
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        apiKey={apiKey}
        keyAnalysis={keyAnalysis}
        usageCount={images.length}
        history={history}
        onViewArchive={() => setView('archive')}
        language={language}
        onApiKeyChange={handleConnect}
        onClearHistory={clearHistory}
        onDeleteAccount={handleDeleteAccount}
        onLogout={handleLogout}
        onResetKey={handleResetKey}
        side={language === 'he' ? 'right' : 'left'}
      />

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={selectedImage}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            alt=""
          />
        </div>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <UserProvider>
      <HomeContent />
    </UserProvider>
  );
}
