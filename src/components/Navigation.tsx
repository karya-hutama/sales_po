import React from 'react';
import { 
  ShoppingCart, 
  Menu, 
  LogOut,
  LayoutDashboard,
  ListOrdered,
  Users,
  ClipboardCheck,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { User } from '../types';

interface SidebarItemProps {
  key?: string;
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}

function SidebarItem({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  isCollapsed 
}: SidebarItemProps) {
  return (
    <button
      id={`nav-${label.toLowerCase().replace(/\s/g, '-')}`}
      onClick={onClick}
      className={cn(
        "flex items-center w-full p-3 rounded-lg transition-all duration-200 group",
        isActive 
          ? "bg-indigo-50 text-indigo-700 shadow-sm" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <Icon className={cn("w-5 h-5 min-w-[20px]", !isCollapsed && "mr-3 text-indigo-600")} />
      {!isCollapsed && <span className="font-semibold">{label}</span>}
      {isActive && !isCollapsed && (
        <motion.div 
          layoutId="active-indicator" 
          className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" 
        />
      )}
    </button>
  );
}

interface NavigationProps {
  user: User;
  currentView: string;
  setView: (view: any) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  handleLogout: () => void;
}

export const Navigation = ({ 
  user, 
  currentView, 
  setView, 
  isCollapsed, 
  setIsCollapsed, 
  handleLogout 
}: NavigationProps) => {
  const sideMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, view: 'Dashboard', roles: ['Sales', 'Admin'] },
    { label: 'Purchase Order', icon: ShoppingCart, view: 'PurchaseOrder', roles: ['Sales', 'Admin'] },
    { label: 'View Archive', icon: ListOrdered, view: 'DaftarPO', roles: ['Sales', 'Admin'] },
    { label: 'Customers', icon: Users, view: 'CustomerData', roles: ['Sales', 'Admin'] },
    { label: 'Process Unit', icon: ClipboardCheck, view: 'ProsesPO', roles: ['Admin'] },
    { label: 'Analytics', icon: BarChart3, view: 'AnalisaPO', roles: ['Sales', 'Admin'] },
  ].filter(i => i.roles.includes((user as any).level));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex-col h-screen sticky top-0 z-20", 
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="h-16 px-6 flex items-center border-b border-gray-100">
           <ShoppingCart className="w-6 h-6 mr-3 min-w-[24px] text-indigo-600" />
           {!isCollapsed && <h1 className="font-bold text-lg text-gray-900 tracking-tight">PO System</h1>}
        </div>
        <nav className="p-4 space-y-1 mt-2 flex-1">
          {sideMenu.map(m => (
            <SidebarItem 
              key={m.label} 
              icon={m.icon} 
              label={m.label} 
              isActive={currentView === m.view} 
              onClick={() => setView(m.view)} 
              isCollapsed={isCollapsed} 
            />
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="flex items-center w-full p-3 text-gray-400 hover:text-gray-900 transition-colors">
            <Menu className="w-5 h-5 mx-auto" />
            {!isCollapsed && <span className="text-[10px] uppercase font-bold tracking-widest ml-4">Toggle Menu</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center w-full p-3 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5 mx-auto" />
            {!isCollapsed && <span className="text-[10px] uppercase font-bold tracking-widest ml-4">Terminal Exit</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl z-[90] flex items-center justify-around px-2">
        {sideMenu.slice(0, 5).map(m => {
          const Icon = m.icon;
          const isActive = currentView === m.view;
          return (
            <button
              key={m.label}
              onClick={() => setView(m.view)}
              className={cn(
                "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all relative",
                isActive ? "text-indigo-600" : "text-gray-400"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-600"
                />
              )}
            </button>
          );
        })}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-12 h-12 text-gray-400"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>
    </>
  );
};
