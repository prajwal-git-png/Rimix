import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, FileText, Settings, Plus } from 'lucide-react';
import { cn } from '../utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/crm', icon: FileText, label: 'Reports' },
  { to: '/new-entry', icon: Plus, label: 'Entry', isPrimary: true },
  { to: '/attendance', icon: CalendarCheck, label: 'Log' },
  { to: '/settings', icon: Settings, label: 'More' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 pb-safe">
      <div className="max-w-md mx-auto flex justify-between items-center px-6 py-2">
        {navItems.map((item) => {
          if (item.isPrimary) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative -top-6 flex flex-col items-center group"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/40 text-white border-4 border-white dark:border-[#050505] group-active:scale-95 transition-transform">
                  <item.icon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-slate-600 dark:text-slate-400">{item.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 transition-all duration-300 mt-2',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 scale-110'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
