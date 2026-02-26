import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, Save, Download, Upload, FileText, LogOut, Camera, MapPin, ChevronRight, Shield, Bell, Globe, HelpCircle, User, CreditCard, TrendingUp, Phone, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { dbPromise } from '../db';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

export function Settings() {
  const { settings, updateSettings } = useStore();
  const [formData, setFormData] = useState(settings || {
    userName: '',
    empId: '',
    storeLocation: '',
    theme: 'dark' as 'dark' | 'light',
    brandWebsite: '',
    demoLink: '',
    tollFree: '',
    aiApiKey: '',
    isLoggedIn: false,
    brandTarget: 500000,
    profilePhoto: '',
    storeLat: undefined as number | undefined,
    storeLng: undefined as number | undefined,
  });

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  if (!settings) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMapLocation = () => {
    if ('geolocation' in navigator) {
      toast.loading('Getting location...', { id: 'location' });
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const updatedData = { ...formData, storeLat: latitude, storeLng: longitude };
          setFormData(updatedData);
          await updateSettings({ storeLat: latitude, storeLng: longitude });
          toast.success('Location mapped!', { id: 'location' });
        },
        (error) => {
          toast.error('Failed to get location.', { id: 'location' });
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSave = async () => {
    await updateSettings(formData);
    toast.success('Settings saved!');
  };

  const handleLogout = async () => {
    await updateSettings({ isLoggedIn: false });
    toast.success('Logged out');
  };

  const toggleTheme = async () => {
    const newTheme = formData.theme === 'dark' ? 'light' : 'dark';
    setFormData({ ...formData, theme: newTheme });
    await updateSettings({ theme: newTheme });
  };

  const handleNotificationClick = () => {
    toast('Notifications are currently enabled.', { icon: '🔔' });
  };

  const handlePrivacyClick = () => {
    toast('Your data is securely stored locally.', { icon: '🛡️' });
  };

  const handleHelpClick = () => {
    toast('Please contact support at support@example.com', { icon: '💬' });
  };

  return (
    <div className="space-y-8 pb-24 max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-white/10 shadow-sm border border-slate-100 dark:border-white/5"
        >
          {formData.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-white/5 border-4 border-white dark:border-[#1c1c1e] shadow-xl">
            {formData.profilePhoto ? (
              <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer shadow-lg active:scale-90 transition-transform">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} />
          </label>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{formData.userName || 'User Name'}</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">ID: {formData.empId || 'EMP000'}</p>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {/* Account Group */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Account Settings</h3>
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="p-4 flex items-center gap-4 border-b border-slate-50 dark:border-white/5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                <input 
                  type="text" 
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0" 
                />
              </div>
            </div>
            <div className="p-4 flex items-center gap-4 border-b border-slate-50 dark:border-white/5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee ID</p>
                <input 
                  type="text" 
                  name="empId"
                  value={formData.empId}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0" 
                />
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store Location</p>
                <input 
                  type="text" 
                  name="storeLocation"
                  value={formData.storeLocation}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0" 
                />
              </div>
              <button onClick={handleMapLocation} className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Map</button>
            </div>
          </div>
        </div>

        {/* Brand Group */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Brand & Tools</h3>
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="p-4 flex items-center gap-4 border-b border-slate-50 dark:border-white/5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand Website</p>
                <input 
                  type="url" 
                  name="brandWebsite"
                  value={formData.brandWebsite}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0" 
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="p-4 flex items-center gap-4 border-b border-slate-50 dark:border-white/5">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600">
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Toll Free Number</p>
                <input 
                  type="tel" 
                  name="tollFree"
                  value={formData.tollFree}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0" 
                  placeholder="1800-XXX-XXXX"
                />
              </div>
            </div>
            <div className="p-4 flex items-center gap-4 border-b border-slate-50 dark:border-white/5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Target</p>
                <input 
                  type="number" 
                  name="brandTarget"
                  value={formData.brandTarget}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0" 
                />
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-600">
                <Key className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI API Key</p>
                <input 
                  type="password" 
                  name="aiApiKey"
                  value={formData.aiApiKey}
                  onChange={handleChange}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0" 
                  placeholder="Enter API Key"
                />
              </div>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">App Settings</h3>
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
            <button 
              onClick={handleNotificationClick}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <Bell className="w-4 h-4" />
              </div>
              <span className="flex-1 text-sm font-bold text-left">Notifications</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
            <button 
              onClick={handlePrivacyClick}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <Shield className="w-4 h-4" />
              </div>
              <span className="flex-1 text-sm font-bold text-left">Privacy & Security</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
            <button 
              onClick={handleHelpClick}
              className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="flex-1 text-sm font-bold text-left">Help & Support</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4 pt-4">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-5 h-5" /> Save Changes
          </button>
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

