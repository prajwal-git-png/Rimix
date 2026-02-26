import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, FileText, Settings, PlusCircle } from 'lucide-react';
import { cn } from '../utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/new-entry', icon: PlusCircle, label: 'Entry' },
  { to: '/crm', icon: FileText, label: 'Reports' },
  { to: '/attendance', icon: CalendarCheck, label: 'Log' },
  { to: '/settings', icon: Settings, label: 'More' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 pb-safe">
      <div className="max-w-md mx-auto flex justify-between items-center px-6 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 transition-all duration-300',
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
        ))}
      </div>
    </nav>
  );
}
