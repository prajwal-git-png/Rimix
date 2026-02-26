import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useStore } from '../store/useStore';
import { GoogleGenAI } from '@google/genai';

export function Layout() {
  const { settings, loadSettings } = useStore();
  const [aiStatus, setAiStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    const checkAiStatus = async () => {
      if (!settings?.aiApiKey) {
        setAiStatus('inactive');
        return;
      }
      try {
        const ai = new GoogleGenAI({ apiKey: settings.aiApiKey });
        // Just a simple check to see if the API key is valid
        await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'hi',
        });
        setAiStatus('active');
      } catch (error) {
        setAiStatus('inactive');
      }
    };

    if (settings) {
      checkAiStatus();
    }
  }, [settings?.aiApiKey]);

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 flex flex-col relative">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      {/* Dynamic Island */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
        <div className="bg-black dark:bg-[#1c1c1e] text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md border border-white/10 text-xs font-medium transition-all">
          <div className={`w-2 h-2 rounded-full ${aiStatus === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : aiStatus === 'inactive' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-yellow-500 animate-pulse'}`} />
          <span>{settings.userName || 'User'}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto pt-14 px-4">
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
