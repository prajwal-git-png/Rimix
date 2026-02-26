/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewEntry } from './pages/NewEntry';
import { Attendance } from './pages/Attendance';
import { Target } from './pages/Target';
import { CRM } from './pages/CRM';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useStore } from './store/useStore';
import { useEffect, useState } from 'react';

export default function App() {
  const { settings, loadSettings, isInitialized } = useStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings().catch(err => {
      console.error('App initialization error:', err);
      setError(err.message);
    });
  }, [loadSettings]);

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
        <p className="text-slate-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 relative mb-4">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-sm font-medium tracking-widest uppercase opacity-50 animate-pulse">Initializing</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!settings?.isLoggedIn ? (
          <Route path="*" element={<Login />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="new-entry" element={<NewEntry />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="target" element={<Target />} />
            <Route path="crm" element={<CRM />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
      <Toaster position="top-center" toastOptions={{
        className: '!bg-slate-800 !text-white !rounded-2xl !backdrop-blur-xl !bg-opacity-80 border border-white/10',
      }} />
    </Router>
  );
}
