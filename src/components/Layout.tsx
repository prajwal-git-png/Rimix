import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useStore } from '../store/useStore';

export function Layout() {
  const { settings, loadSettings } = useStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 flex flex-col relative">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto pt-6 px-4">
        <div className="max-w-md mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
