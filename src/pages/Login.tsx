import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { LogIn, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function Login() {
  const { settings, updateSettings } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    userName: settings?.userName || '',
    empId: settings?.empId || '',
    storeLocation: settings?.storeLocation || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.empId || !formData.storeLocation) {
      toast.error('Please fill in all fields');
      return;
    }
    
    await updateSettings({
      ...formData,
      isLoggedIn: true,
    });
    toast.success('Welcome back!');
  };

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#000000] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="splash"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center text-center space-y-8"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Your Daily Sales,<br />Simplified.
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-[280px] mx-auto">
                  Get real-time insights and track your performance with just one tap.
                </p>
              </div>

              <div className="w-full space-y-4 pt-8">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98]"
                >
                  Get Started
                </button>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  By continuing, you agree to our <span className="underline">Terms</span> & <span className="underline">Privacy Policy</span>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full pt-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Fast</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-50">Insightful</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/5"
            >
              <div className="mb-8">
                <button 
                  onClick={() => setShowForm(false)}
                  className="mb-6 text-blue-600 font-medium flex items-center gap-1 text-sm"
                >
                  ← Back
                </button>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Profile</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tell us a bit about yourself to get started.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.empId}
                    onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="EMP-12345"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 ml-1">Store Location</label>
                  <input
                    type="text"
                    required
                    value={formData.storeLocation}
                    onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    placeholder="Downtown Branch"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Complete Setup <LogIn className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
