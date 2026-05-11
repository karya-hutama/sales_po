import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from './components/Navigation';
import { CustomModal } from './components/modals/CustomModal';
import { DashboardView } from './views/DashboardView';
import { PurchaseOrderForm } from './views/PurchaseOrderForm';
import { POListView } from './views/POListView';
import { ProcessPOView } from './views/ProcessPOView';
import { POAnalysisView } from './views/POAnalysisView';
import { CustomerDataView } from './views/CustomerDataView';
import { AppData, User } from './types';

// --- CONFIG ---
const API_URL = '/api/proxy';

// --- TYPES ---
type View = 'Dashboard' | 'PurchaseOrder' | 'DaftarPO' | 'ProsesPO' | 'AnalisaPO' | 'CustomerData';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('Dashboard');
  const [data, setData] = useState<AppData>({
    products: [],
    customers: [],
    routes: [],
    pos: []
  } as any);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
    type: 'confirm' | 'alert';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'confirm'
  });

  const customConfirm = (options: { title: string; message: string; onConfirm: () => void }) => {
    setModal({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: options.onConfirm,
      type: 'confirm'
    });
  };

  const customAlert = (options: { title: string; message: string }) => {
    setModal({
      isOpen: true,
      title: options.title,
      message: options.message,
      onConfirm: null,
      type: 'alert'
    });
  };

  // Login inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = async () => {
    if (!API_URL) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=getData`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.user);
        setError(null);
      } else {
        setError(json.message || json.error || "Login gagal: Kredensial tidak valid.");
      }
    } catch (err: any) {
      setError("Kesalahan Koneksi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('Dashboard');
  };

  const viewProps = {
    data,
    fetchData,
    setIsLoading,
    isLoading,
    API_URL,
    user,
    confirm: customConfirm,
    alert: customAlert
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-10 rounded-2xl border border-gray-200 shadow-xl"
        >
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-indigo-100 shadow-xl">
              <ShoppingCart className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Order System</h1>
            <p className="text-gray-500 text-sm">Secure Authentication Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest font-bold text-gray-400 ml-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-3" />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-indigo-100 shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? "Validating..." : "Sign In"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-gray-300 text-[10px] uppercase tracking-widest">
            System Managed • Secured Connection
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      <Navigation 
        user={user}
        currentView={view}
        setView={setView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        handleLogout={handleLogout}
      />

      <main className="flex-1 min-h-screen overflow-y-auto pb-24 md:pb-0">
        <header className="h-16 px-6 md:px-8 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <h2 className="font-bold text-gray-900 truncate pr-4">{view}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">{user.username}</p>
              <p className="text-[9px] uppercase tracking-widest text-gray-400">{(user as any).level} Session</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
           {isLoading && <div className="fixed inset-0 bg-white/20 backdrop-blur-[2px] z-50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 animate-spin rounded-full" /></div>}
           <AnimatePresence mode="wait">
             <motion.div key={view} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
               {view === 'Dashboard' && <DashboardView pos={data.pos} products={data.products} />}
               {view === 'PurchaseOrder' && <PurchaseOrderForm {...viewProps} />}
               {view === 'DaftarPO' && <POListView {...viewProps} />}
               {view === 'ProsesPO' && <ProcessPOView {...viewProps} />}
               {view === 'AnalisaPO' && <POAnalysisView data={data} />}
               {view === 'CustomerData' && <CustomerDataView {...viewProps} />}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>

      <CustomModal 
        isOpen={modal.isOpen} 
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm || undefined}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
    </div>
  );
}
