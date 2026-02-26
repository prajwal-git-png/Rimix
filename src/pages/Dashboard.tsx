import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Share2, Calendar as CalendarIcon, Edit2, Trash2, Image as ImageIcon, Download, Eye, X, ChevronLeft, ChevronRight, Plus, TrendingUp, Wallet, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { AddSaleModal } from '../components/AddSaleModal';
import { Sale } from '../db';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { settings, sales, loadSales, deleteSale, attendance, loadAttendance, markAttendance } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayDetailsOpen, setIsDayDetailsOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');

  useEffect(() => {
    loadSales();
    loadAttendance();
  }, [loadSales, loadAttendance]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const mtdSales = useMemo(() => {
    return sales.filter(s => {
      const date = parseISO(s.date);
      return date >= monthStart && date <= monthEnd;
    });
  }, [sales, monthStart, monthEnd]);

  const mtdAttendance = useMemo(() => {
    return attendance.filter(a => {
      const date = parseISO(a.date);
      return date >= monthStart && date <= monthEnd && a.status === 'Present';
    });
  }, [attendance, monthStart, monthEnd]);

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

  const handleDayClick = async (day: Date, hasSales: boolean) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (viewMode === 'edit') {
      const existing = attendance.find(a => a.date === dateStr);
      if (existing?.status === 'Week Off') {
        // Remove week off (set to empty or delete, but we'll just set to Present for now, or maybe we need a delete method. Let's just toggle to Leave or something. Actually, let's just mark it as Week Off if not already)
        toast.error('Already marked as Week Off');
      } else {
        await markAttendance({
          date: dateStr,
          status: 'Week Off'
        });
        toast.success('Marked as Week Off');
      }
    } else {
      setSelectedDate(day);
      if (hasSales) setIsDayDetailsOpen(true);
    }
  };

  const progressPercentage = settings?.brandTarget ? Math.min((mtdValue / settings.brandTarget) * 100, 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
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
        <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center relative z-10">
            <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">MTD Revenue</p>
            <p className="text-xl font-bold tracking-tight">₹{mtdValue.toLocaleString()}</p>
          </div>
          {/* Progress Bar Background */}
          {settings?.brandTarget && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          )}
        </div>
        <div className="bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col justify-between h-32">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Working Days</p>
            <p className="text-xl font-bold tracking-tight">{mtdAttendance.length}</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden p-4">
        <div className="grid grid-cols-7 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-2xl" />
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
                onClick={() => handleDayClick(day, hasSales)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all
                  ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : hasSales ? 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                `}
              >
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : hasSales ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
                {hasSales && (
                  <span className={`text-[8px] font-bold mt-0.5 ${isSelected ? 'text-blue-200' : 'text-blue-500 dark:text-blue-300'}`}>
                    {dayValue >= 1000 ? `${(dayValue / 1000).toFixed(1)}k` : dayValue}
                  </span>
                )}
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
            <h3 className="text-xl font-bold mt-1">
              ₹{mtdValue.toLocaleString()}
            </h3>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> MTD
          </div>
        </div>
        
        {/* Real Weekly Breakdown */}
        <div className="flex items-end justify-between h-32 gap-2 mt-4">
          {[1, 2, 3, 4].map(week => {
            const weekSales = mtdSales.filter(s => {
              const d = parseISO(s.date).getDate();
              return d > (week - 1) * 7 && d <= (week === 4 ? 31 : week * 7);
            }).reduce((sum, s) => sum + (s.price * s.quantity), 0);
            
            const maxWeek = Math.max(1, ...[1, 2, 3, 4].map(w => mtdSales.filter(s => {
              const d = parseISO(s.date).getDate();
              return d > (w - 1) * 7 && d <= (w === 4 ? 31 : w * 7);
            }).reduce((sum, s) => sum + (s.price * s.quantity), 0)));

            const height = `${Math.max(10, (weekSales / maxWeek) * 100)}%`;

            return (
              <div key={week} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex-1 flex items-end justify-center">
                  <div 
                    className="w-full max-w-[2rem] bg-blue-100 dark:bg-blue-500/20 rounded-t-xl relative transition-all duration-500 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/40"
                    style={{ height }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {weekSales >= 1000 ? `${(weekSales/1000).toFixed(1)}k` : weekSales}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">W{week}</span>
              </div>
            );
          })}
        </div>
      </div>

      <AddSaleModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSaleToEdit(null); }} 
        saleToEdit={saleToEdit}
      />

      {/* Day Details Modal */}
      {isDayDetailsOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsDayDetailsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-slide-up-modal"
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
          </div>
        </div>
      )}
    </div>
  );
}

