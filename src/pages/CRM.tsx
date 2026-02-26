import React, { useEffect, useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Calendar, PieChart, Download, ChevronRight, TrendingUp, CloudUpload, Receipt, LayoutGrid, Package, MessageSquare, Plus, X, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

export function CRM() {
  const { settings, sales, loadSales, crmIssues, loadCRMIssues, addCRMIssue, updateCRMIssue } = useStore();
  const [activeTab, setActiveTab] = useState<'reports' | 'crm'>('reports');
  const [activeRange, setActiveRange] = useState<'this' | 'last' | 'custom'>('this');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    customerName: '',
    phone: '',
    type: 'complaint' as 'complaint' | 'registration',
    description: '',
  });

  useEffect(() => {
    loadSales();
    loadCRMIssues();
  }, [loadSales, loadCRMIssues]);

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
    return { total, count: filteredSales.length, filteredSales };
  }, [sales, activeRange]);

  const progressPercentage = settings?.brandTarget ? Math.min((stats.total / settings.brandTarget) * 100, 100) : 0;

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDailyLog = () => {
    if (stats.filteredSales.length === 0) {
      toast.error('No data available for this period');
      return;
    }
    const headers = ['Date,Product,Quantity,Price,Total'];
    const rows = stats.filteredSales.map(s => `${s.date},"${s.productName}",${s.quantity},${s.price},${s.quantity * s.price}`);
    downloadCSV(`daily_sales_log_${activeRange}.csv`, headers.concat(rows).join('\n'));
    toast.success('Daily Sales Log downloaded');
  };

  const handleMonthlyOverview = () => {
    if (stats.filteredSales.length === 0) {
      toast.error('No data available for this period');
      return;
    }
    const dayMap = new Map<string, { qty: number, revenue: number }>();
    stats.filteredSales.forEach(s => {
      const current = dayMap.get(s.date) || { qty: 0, revenue: 0 };
      dayMap.set(s.date, {
        qty: current.qty + s.quantity,
        revenue: current.revenue + (s.quantity * s.price)
      });
    });
    const headers = ['Date,Total Quantity,Total Revenue'];
    const rows = Array.from(dayMap.entries()).map(([date, data]) => `${date},${data.qty},${data.revenue}`);
    downloadCSV(`monthly_overview_${activeRange}.csv`, headers.concat(rows).join('\n'));
    toast.success('Monthly Overview downloaded');
  };

  const handleProductPerformance = () => {
    if (stats.filteredSales.length === 0) {
      toast.error('No data available for this period');
      return;
    }
    const productMap = new Map<string, { qty: number, revenue: number }>();
    stats.filteredSales.forEach(s => {
      const current = productMap.get(s.productName) || { qty: 0, revenue: 0 };
      productMap.set(s.productName, {
        qty: current.qty + s.quantity,
        revenue: current.revenue + (s.quantity * s.price)
      });
    });
    const headers = ['Product,Total Quantity,Total Revenue'];
    const rows = Array.from(productMap.entries()).map(([name, data]) => `"${name}",${data.qty},${data.revenue}`);
    downloadCSV(`product_performance_${activeRange}.csv`, headers.concat(rows).join('\n'));
    toast.success('Product Performance downloaded');
  };

  const handleExport = () => {
    handleDailyLog();
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.customerName || !issueForm.phone || !issueForm.description) {
      toast.error('Please fill all fields');
      return;
    }
    await addCRMIssue({
      ...issueForm,
      status: 'open',
      timestamp: Date.now(),
    });
    toast.success('Issue logged successfully');
    setShowIssueModal(false);
    setIssueForm({ customerName: '', phone: '', type: 'complaint', description: '' });
  };

  const handleResolveIssue = async (issue: any) => {
    const solution = window.prompt('Enter resolution details:');
    if (solution) {
      await updateCRMIssue({
        ...issue,
        status: 'resolved',
        solution,
      });
      toast.success('Issue resolved');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto animate-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports & CRM</h1>
        <button className="p-2 rounded-full bg-white dark:bg-white/10 text-blue-600 dark:text-white shadow-sm">
          <Calendar className="w-6 h-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200 dark:bg-white/10 p-1 rounded-2xl mx-2">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === 'crm' ? 'bg-white dark:bg-[#1c1c1e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          CRM
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fade-in">
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
          </div>

          {/* Summary Card */}
          <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Sales ({activeRange === 'this' ? format(currentMonth, 'MMMM') : format(lastMonth, 'MMMM')})</p>
                <p className="text-3xl font-bold tracking-tight">₹{stats.total.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            
            {settings?.brandTarget ? (
              <>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-blue-600 font-bold flex items-center gap-1">
                    {progressPercentage.toFixed(1)}% of Target
                  </span>
                  <span className="text-slate-400">{stats.count} Transactions</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{stats.count} Transactions</span>
              </div>
            )}
          </div>

          {/* Generate Reports List */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Generate Reports</h2>
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
              <button onClick={handleDailyLog} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left border-b border-slate-50 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Daily Sales Log</p>
                  <p className="text-[10px] text-slate-400">Individual transaction details</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
              <button onClick={handleMonthlyOverview} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left border-b border-slate-50 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Monthly Overview</p>
                  <p className="text-[10px] text-slate-400">Aggregated performance</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
              <button onClick={handleProductPerformance} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left">
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
      )}

      {activeTab === 'crm' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold">Issues & Complaints</h2>
            <button 
              onClick={() => setShowIssueModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Log Issue
            </button>
          </div>

          <div className="space-y-4">
            {crmIssues.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No issues logged yet.</p>
              </div>
            ) : (
              crmIssues.map(issue => (
                <div key={issue.id} className="bg-white dark:bg-[#1c1c1e] p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${issue.type === 'complaint' ? 'bg-red-50 text-red-600 dark:bg-red-500/10' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'}`}>
                        {issue.type}
                      </span>
                      <h3 className="font-bold mt-2">{issue.customerName}</h3>
                      <p className="text-xs text-slate-500">{issue.phone}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-100 text-slate-600 dark:bg-white/10'}`}>
                      {issue.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-xl">
                    {issue.description}
                  </p>
                  {issue.status === 'resolved' && issue.solution && (
                    <div className="bg-emerald-50 dark:bg-emerald-500/5 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/10">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Resolution</p>
                      <p className="text-sm text-emerald-800 dark:text-emerald-200">{issue.solution}</p>
                    </div>
                  )}
                  {issue.status === 'open' && (
                    <button 
                      onClick={() => handleResolveIssue(issue)}
                      className="w-full py-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark as Resolved
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Log Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-md rounded-[2.5rem] p-6 animate-slide-up-modal shadow-2xl border border-white/10 relative">
            <button 
              onClick={() => setShowIssueModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-6">Log New Issue</h2>
            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIssueForm({...issueForm, type: 'complaint'})}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${issueForm.type === 'complaint' ? 'bg-red-50 text-red-600 border-2 border-red-200' : 'bg-slate-50 text-slate-500 border-2 border-transparent'}`}
                  >
                    Complaint
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueForm({...issueForm, type: 'registration'})}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${issueForm.type === 'registration' ? 'bg-orange-50 text-orange-600 border-2 border-orange-200' : 'bg-slate-50 text-slate-500 border-2 border-transparent'}`}
                  >
                    Registration
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={issueForm.customerName}
                  onChange={e => setIssueForm({...issueForm, customerName: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={issueForm.phone}
                  onChange={e => setIssueForm({...issueForm, phone: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="9876543210"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                <textarea
                  required
                  value={issueForm.description}
                  onChange={e => setIssueForm({...issueForm, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                  placeholder="Describe the issue..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all mt-4"
              >
                Save Issue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

