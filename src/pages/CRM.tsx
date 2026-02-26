import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Calendar, PieChart, Download, ChevronRight, TrendingUp, CloudUpload, Receipt, LayoutGrid, Package } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export function CRM() {
  const { sales, loadSales } = useStore();
  const [activeRange, setActiveRange] = useState<'this' | 'last' | 'custom'>('this');

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);

  const stats = useMemo(() => {
    const range = activeRange === 'this' ? currentMonth : lastMonth;
    const start = startOfMonth(range);
    const end = endOfMonth(range);
    
    const filteredSales = sales.filter(s => {
      const d = new Date(s.date);
      return d >= start && d <= end;
    });

    const total = filteredSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    return { total, count: filteredSales.length };
  }, [sales, activeRange]);

  const handleExport = () => {
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports & Insights</h1>
        <button className="p-2 rounded-full bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm">
          <Calendar className="w-6 h-6" />
        </button>
      </div>

      {/* Range Selector */}
      <div className="flex gap-2 px-2 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveRange('this')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeRange === 'this' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-white/10 text-slate-500'}`}
        >
          This Month
        </button>
        <button 
          onClick={() => setActiveRange('last')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeRange === 'last' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-white/10 text-slate-500'}`}
        >
          Last Month
        </button>
        <button 
          onClick={() => setActiveRange('custom')}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeRange === 'custom' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-white dark:bg-white/10 text-slate-500'}`}
        >
          Custom Range
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Sales ({activeRange === 'this' ? 'October' : 'September'})</p>
            <p className="text-3xl font-bold tracking-tight">₹{stats.total.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        
        <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full w-[75%]" />
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            ↑ 12.5%
          </span>
          <span className="text-slate-400">vs. last month</span>
        </div>
      </div>

      {/* Generate Reports List */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Generate Reports</h2>
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
          <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left border-b border-slate-50 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Daily Sales Log</p>
              <p className="text-[10px] text-slate-400">Individual transaction details</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left border-b border-slate-50 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Monthly Overview</p>
              <p className="text-[10px] text-slate-400">Aggregated performance</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <button className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Product Performance</p>
              <p className="text-[10px] text-slate-400">Sales by category & item</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Recent Exports */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-sm font-bold">Recent Exports</h2>
          <button className="text-blue-600 text-xs font-bold">See All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[140px] bg-white dark:bg-[#1c1c1e] p-3 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 space-y-2">
              <div className="aspect-[4/3] rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold truncate">Oct_Sales.pdf</p>
                <p className="text-[10px] text-slate-400">Today, 10:23 AM</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Sync */}
      <div className="bg-blue-50 dark:bg-blue-500/5 p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-500/10 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold">Backup & Sync</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Export your latest reports directly to local storage as CSV or PDF.</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          Export Data <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

