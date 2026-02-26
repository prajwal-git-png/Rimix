import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Share2, Calendar as CalendarIcon, Edit2, Trash2, Image as ImageIcon, Download, Eye, X, ChevronLeft, ChevronRight, Plus, TrendingUp, Wallet, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { AddSaleModal } from '../components/AddSaleModal';
import { Sale } from '../db';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function Dashboard() {
  const { settings, sales, loadSales, deleteSale } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const mtdSales = useMemo(() => {
    return sales.filter(s => {
      const date = parseISO(s.date);
      return date >= monthStart && date <= monthEnd;
    });
  }, [sales, monthStart, monthEnd]);

  const mtdValue = mtdSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todaysSales = sales.filter(s => s.date === selectedDateStr);
  const todayValue = todaysSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  const todayQty = todaysSales.reduce((sum, s) => sum + s.quantity, 0);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleEdit = (sale: Sale) => {
    setSaleToEdit(sale);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      await deleteSale(id);
      toast.success('Sale deleted');
    }
  };

  const handleShare = () => {
    if (!settings) return;
    const message = `*Sales Report - ${format(selectedDate, 'dd MMM yyyy')}*\nStore: ${settings.storeLocation}\nTotal: ₹${todayValue.toLocaleString()}\nQty: ${todayQty}\nMTD: ₹${mtdValue.toLocaleString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Month Selector */}
      <div className="flex items-center justify-between px-2">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* View Mode Switcher */}
      <div className="bg-slate-200/50 dark:bg-white/5 p-1 rounded-2xl flex">
        <button 
          onClick={() => setViewMode('view')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${viewMode === 'view' ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500'}`}
        >
          View Mode
        </button>
        <button 
          onClick={() => setViewMode('edit')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-white' : 'text-slate-500'}`}
        >
          Mark Week-offs
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col justify-between h-32">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">MTD Revenue</p>
            <p className="text-xl font-bold tracking-tight">₹{mtdValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col justify-between h-32">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Working Days</p>
            <p className="text-xl font-bold tracking-tight">22</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 border-b border-r border-slate-50 dark:border-white/5 bg-slate-50/20 dark:bg-white/2" />
          ))}
          
          {daysInMonth.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const daySales = sales.filter(s => s.date === dateStr);
            const hasSales = daySales.length > 0;
            const isSelected = isSameDay(day, selectedDate);
            const dayValue = daySales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
            
            return (
              <button
                key={i}
                onClick={() => {
                  setSelectedDate(day);
                  if (hasSales) setIsDayDetailsOpen(true);
                }}
                className={`
                  relative h-20 border-b border-r border-slate-100 dark:border-white/5 flex flex-col items-center justify-between py-2 transition-all
                  ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                `}
              >
                <span className={`text-xs font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
                {hasSales ? (
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">
                    ₹{(dayValue / 1000).toFixed(1)}k
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-300 dark:text-slate-600">-</span>
                )}
                {isSelected && <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Monthly Trend</p>
            <h3 className="text-xl font-bold mt-1">+12% <span className="text-sm font-normal text-slate-400">vs last month</span></h3>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> 12%
          </div>
        </div>
        <div className="h-32 w-full relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
            <path d="M0 35 Q 10 32, 20 25 T 40 20 T 60 15 T 80 25 T 100 10" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            <path d="M0 35 Q 10 32, 20 25 T 40 20 T 60 15 T 80 25 T 100 10 V 40 H 0 Z" fill="url(#chartGradient)" />
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute top-4 left-[60%] -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded shadow-lg">
            ₹2,100
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </div>
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center active:scale-90 transition-transform z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AddSaleModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSaleToEdit(null); }} 
        saleToEdit={saleToEdit}
      />

      {/* Day Details Modal */}
      <AnimatePresence>
        {isDayDetailsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsDayDetailsOpen(false)}
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Sales Details</h2>
                  <p className="text-sm text-slate-500">{format(selectedDate, 'MMMM d, yyyy')}</p>
                </div>
                <button onClick={() => setIsDayDetailsOpen(false)} className="p-2 rounded-full bg-slate-100 dark:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4">
                {todaysSales.map((sale) => (
                  <div key={sale.id} className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-tight">{sale.productName}</h3>
                        <p className="text-sm text-slate-500">Qty: {sale.quantity} × ₹{sale.price.toLocaleString()}</p>
                      </div>
                      <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                        ₹{(sale.quantity * sale.price).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => handleEdit(sale)} className="flex-1 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-semibold flex items-center justify-center gap-2">
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => sale.id && handleDelete(sale.id)} className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleShare}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Share2 className="w-5 h-5" /> Share Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

