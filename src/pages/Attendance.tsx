import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Calendar as CalendarIcon, MapPin, Clock, Share2, AlertTriangle, ChevronLeft, ChevronRight, User, CheckCircle2, XCircle, Coffee } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

export function Attendance() {
  const { settings, attendance, loadAttendance, markAttendance } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLocating, setIsLocating] = useState(false);

  // Haversine formula to calculate distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  };

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todaysAttendance = attendance.find(a => a.date === selectedDateStr);

  const handleMarkAttendance = async (status: 'Present' | 'Week Off' | 'Leave') => {
    if (status === 'Present') {
      if (!settings?.storeLat || !settings?.storeLng) {
        toast.error('Store location not mapped! Please go to Settings.', { duration: 5000 });
        return;
      }

      setIsLocating(true);
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            let locationStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            const distance = calculateDistance(latitude, longitude, settings.storeLat!, settings.storeLng!);
            
            if (distance > 300) {
              toast.error(`Too far! You are ${Math.round(distance)}m away.`, { duration: 5000 });
              setIsLocating(false);
              return;
            }
            
            locationStr += ` (At Store, ${Math.round(distance)}m)`;
            await markAttendance({
              date: selectedDateStr,
              timeIn: todaysAttendance?.timeIn || format(new Date(), 'HH:mm'),
              timeOut: todaysAttendance?.timeIn ? format(new Date(), 'HH:mm') : undefined,
              location: locationStr,
              status
            });
            setIsLocating(false);
            toast.success('Attendance marked');
          },
          (error) => {
            setIsLocating(false);
            toast.error('GPS Error. Please enable location.');
          },
          { enableHighAccuracy: true }
        );
      } else {
        setIsLocating(false);
        toast.error('Geolocation not supported');
      }
    } else {
      await markAttendance({ date: selectedDateStr, status });
      toast.success(`${status} marked`);
    }
  };

  const handleShare = () => {
    if (!settings) return;
    const message = `"${settings.userName}"\nLocation: ${settings.storeLocation}\nDate: ${format(new Date(), 'dd-MM-yyyy')}\nI am in the store sir`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Log</h1>
        <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5">
          <User className="w-5 h-5 text-blue-600 dark:text-white" />
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-white/5">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-white/5">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[10px] font-bold text-slate-300 uppercase">{d}</div>
          ))}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
          {daysInMonth.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const record = attendance.find(a => a.date === dateStr);
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`
                  aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-90
                  ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 z-10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}
                `}
              >
                <span className="text-sm font-bold">{format(day, 'd')}</span>
                {record && !isSelected && (
                  <div className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                    record.status === 'Present' ? 'bg-emerald-500' : 
                    record.status === 'Leave' ? 'bg-orange-500' : 'bg-slate-400'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Details */}
      <div 
        key={selectedDateStr}
        className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-6 animate-fade-in animate-slide-up"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">{format(selectedDate, 'EEEE, MMM d')}</h3>
          {todaysAttendance ? (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              todaysAttendance.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
              todaysAttendance.status === 'Leave' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {todaysAttendance.status}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Record</span>
          )}
        </div>

        {todaysAttendance?.status === 'Present' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time In</p>
              <p className="text-lg font-bold">{todaysAttendance.timeIn || '--:--'}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Out</p>
              <p className="text-lg font-bold">{todaysAttendance.timeOut || '--:--'}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={() => handleMarkAttendance('Present')}
            disabled={isLocating}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLocating ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <MapPin className="w-5 h-5" />}
            {todaysAttendance?.timeIn ? 'Mark Time Out' : 'Mark Present'}
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleMarkAttendance('Week Off')}
              className="py-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Coffee className="w-5 h-5" /> Week Off
            </button>
            <button 
              onClick={() => handleMarkAttendance('Leave')}
              className="py-4 bg-orange-50 text-orange-600 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <XCircle className="w-5 h-5" /> Leave
            </button>
          </div>
        </div>

        <button 
          onClick={handleShare}
          className="w-full py-4 border border-slate-100 dark:border-white/5 text-slate-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
        >
          <Share2 className="w-4 h-4" /> Share with Manager
        </button>
      </div>
    </div>
  );
}

