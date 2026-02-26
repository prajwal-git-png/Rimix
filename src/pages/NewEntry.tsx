import React, { useState, useEffect } from 'react';
import { Camera, Upload, Search, FileText, X, History, Eye, Download, ChevronLeft, User, Store, Calendar, Plus, Minus, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PRODUCTS } from '../utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { createWorker } from 'tesseract.js';
import { useNavigate } from 'react-router-dom';
import { Sale } from '../db';
import { motion, AnimatePresence } from 'framer-motion';

export function NewEntry() {
  const { addSale, sales, loadSales, settings } = useStore();
  const navigate = useNavigate();
  const [productSearch, setProductSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const recentSales = sales.slice(0, 5);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    productName: '',
    quantity: 1,
    price: undefined as number | undefined,
    billId: '',
    billNumber: '',
    customerNumber: '',
  });
  
  const [billImage, setBillImage] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const filteredProducts = PRODUCTS.filter(p => p.toLowerCase().includes(productSearch.toLowerCase()));

  // Stats for the top of the page
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysSales = sales.filter(s => s.date === todayStr);
  const todayValue = todaysSales.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  const todayQty = todaysSales.reduce((sum, s) => sum + s.quantity, 0);
  const mtdValue = sales.reduce((sum, s) => sum + (s.price * s.quantity), 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName) {
      toast.error('Please select a product');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const saleData = {
      ...formData,
      price: formData.price || 0,
      timestamp: Date.now(),
      billImage: billImage || undefined,
    };

    await addSale(saleData);
    toast.success('Sale added successfully');
    navigate('/');
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-600 font-semibold">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-lg font-bold">Daily Sales</h1>
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-white/10 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600 dark:text-white" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-1">
        <div className="min-w-[120px] bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's Value</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Plus className="w-3 h-3 text-blue-600" />
            </div>
          </div>
          <p className="text-lg font-bold">₹{todayValue.toLocaleString()}</p>
        </div>
        <div className="min-w-[120px] bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today's Qty</span>
            <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
              <Plus className="w-3 h-3 text-orange-600" />
            </div>
          </div>
          <p className="text-lg font-bold">{todayQty}</p>
        </div>
        <div className="min-w-[120px] bg-white dark:bg-[#1c1c1e] p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MTD Value</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <Plus className="w-3 h-3 text-emerald-600" />
            </div>
          </div>
          <p className="text-lg font-bold">₹{mtdValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Entry Details */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-4">Entry Details</h2>
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-white/5">
            <Calendar className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-white/5">
            <User className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</p>
              <p className="text-sm font-semibold">{settings?.userName || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <Store className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store</p>
              <p className="text-sm font-semibold">{settings?.storeLocation || 'Main Branch'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Products</h2>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-full">
            {formData.productName ? '1 Item Selected' : 'No Items'}
          </span>
        </div>
        
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="text"
              placeholder="Search product..."
              value={productSearch}
              onChange={e => {
                setProductSearch(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full pl-8 bg-transparent border-none p-0 text-sm font-semibold focus:ring-0"
            />
            {showDropdown && productSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#2c2c2e] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/5 z-50 max-h-48 overflow-y-auto">
                {filteredProducts.map((p, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setFormData({...formData, productName: p});
                      setProductSearch(p);
                      setShowDropdown(false);
                    }}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-medium cursor-pointer"
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.productName && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 pt-4 border-t border-slate-50 dark:border-white/5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{formData.productName}</h3>
                  <p className="text-xs text-slate-400 mt-1">Enter unit price below</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">₹{((formData.price || 0) * formData.quantity).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
                <button 
                  onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                  className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                >
                  <Minus className="w-5 h-5 text-blue-600" />
                </button>
                <span className="text-xl font-bold">{formData.quantity}</span>
                <button 
                  onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                  className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-90 transition-transform"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Unit Price</p>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={formData.price ?? ''}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || undefined})}
                  className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-lg font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bill Copy */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-4">Bill Copy</h2>
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 p-8 flex flex-col items-center justify-center gap-4 border-dashed border-2 border-slate-200 dark:border-white/10">
          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
              <img src={imagePreview} alt="Bill" className="w-full h-full object-cover" />
              <button 
                onClick={() => {setBillImage(null); setImagePreview(null);}}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-bold">Tap to Snap Bill</p>
                <p className="text-xs text-slate-400 mt-1">or upload from gallery</p>
              </div>
              <input type="file" accept="image/*" className="hidden" id="bill-upload" onChange={handleImageUpload} />
              <label htmlFor="bill-upload" className="absolute inset-0 cursor-pointer" />
            </>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
            <span className="text-xl font-bold">₹{((formData.price || 0) * formData.quantity).toLocaleString()}</span>
          </div>
          <button 
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-5 h-5" /> Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}
