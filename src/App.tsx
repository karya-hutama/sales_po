/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ListOrdered, 
  ClipboardCheck, 
  BarChart3, 
  LogOut, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  PlusCircle,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
  EyeOff,
  Users,
  MessageCircle,
  Save,
  MapPin,
  Phone
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import type { 
  User, 
  Product, 
  Customer, 
  Rute, 
  PO, 
  POAnalysisRow
} from './types';

// --- CONFIG ---
const API_URL = '/api/proxy';

// --- TYPES ---
type View = 'Dashboard' | 'PurchaseOrder' | 'DaftarPO' | 'ProsesPO' | 'AnalisaPO' | 'CustomerData';

// --- COMPONENTS ---

// 1. Sidebar Item
function SidebarItem({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick, 
  isCollapsed 
}: { 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onClick: () => void,
  isCollapsed: boolean,
  key?: string
}) {
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
          className="ml-auto w-1.5 h-1.5 rounded-full bg-white" 
        />
      )}
    </button>
  );
}

interface ViewProps {
  data: any;
  fetchData: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
  API_URL: string;
  user: User | null;
  confirm: (options: { title: string; message: string; onConfirm: () => void }) => void;
  alert: (options: { title: string; message: string }) => void;
}

// --- HELPER COMPONENTS ---

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  label,
  isLoading = false
}: { 
  options: { value: string, label: string }[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string,
  label?: string,
  isLoading?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative space-y-2">
      {label && <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>}
      <div 
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        className={cn(
          "relative w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium cursor-pointer flex justify-between items-center transition-all",
          isOpen ? "ring-4 ring-indigo-50 border-indigo-400 bg-white" : "hover:border-indigo-200"
        )}
      >
        <span className={cn("transition-colors", !selected ? "text-gray-400" : "text-gray-900")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="absolute z-[70] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-0"
            >
              <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  autoFocus
                  type="text" 
                  className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-300" 
                  placeholder="Search and filter..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 p-1">
                {filtered.length > 0 ? filtered.map(opt => (
                  <div 
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "p-3.5 text-sm font-bold cursor-pointer transition-all rounded-xl m-1 flex items-center justify-between group",
                      opt.value === value 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "hover:bg-indigo-50 text-gray-600 hover:text-indigo-700"
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.value === value && <CheckCircle2 className="w-4 h-4 ml-2" />}
                  </div>
                )) : (
                  <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                    <Search className="w-8 h-8 text-gray-100" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">No data match found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- UNIVERSAL MODAL ---
const CustomModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm?: () => void; 
  title: string; 
  message: string; 
  type?: 'confirm' | 'alert' 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              type === 'confirm' ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"
            )}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="bg-gray-50 p-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
          >
            {type === 'confirm' ? 'Cancel' : 'Close'}
          </button>
          {type === 'confirm' && onConfirm && (
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
            >
              Confirm / Delete
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- SUB-VIEWS ---

const POAnalysisView = ({ data }: { data: any }) => {
  const analysis = (data.pos || []).map((po: any) => {
    const c = data.customers.find((cx: any) => cx.id_customer === po.id_customer);
    const r = data.routes.find((rx: any) => rx.id_rute === po.id_rute);
    return {
      ...po,
      nama_sales: po.id_sales,
      nama_customer: c?.nama_customer || 'N/A',
      alamat: c?.alamat || 'No Address',
      rute: r?.rute || 'Undefined',
      persentase: po.qty > 0 ? ((po.qty_realisasi || 0) / po.qty) * 100 : 0
    } as POAnalysisRow;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Sales/Client</th>
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Logistics</th>
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400 text-right">Metrics</th>
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Fulfillment</th>
            </tr>
          </thead>
          <tbody>
            {analysis.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50">
                <td className="p-4">
                  <div className="text-sm font-bold text-gray-900">{row.nama_sales}</div>
                  <div className="text-[10px] text-gray-400 italic">{row.nama_customer}</div>
                </td>
                <td className="p-4">
                  <div className="text-xs text-gray-700">{row.rute}</div>
                  <div className="text-[9px] text-gray-400 truncate max-w-[150px]">{row.alamat}</div>
                </td>
                <td className="p-4 text-right">
                  <div className="text-sm font-mono font-bold text-gray-900">{row.qty_realisasi} / {row.qty}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 h-1 rounded-full relative">
                      <div className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min(row.persentase, 100)}%` }} />
                    </div>
                    <span className="text-[11px] font-mono font-bold min-w-[40px] text-right text-indigo-600">{row.persentase.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ProcessPOView = ({ data, fetchData, setIsLoading, isLoading, API_URL, user, confirm, alert }: ViewProps) => {
  const [realValues, setRealValues] = useState<Record<number, number>>({});
  const pending = (data.pos || []).filter((p: any) => p.status_po !== 'Sudah Diproses');

  const handleProcess = async (po: any) => {
    const v = realValues[po.id_row];
    if (v === undefined) return alert({ title: 'Validation Info', message: 'Realization qty is required.' });
    setIsLoading(true);
    try {
      const res = await fetch(API_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'processPO', id_row: po.id_row, qty_realisasi: v }) 
      });
      const json = await res.json();
      if (json.success) {
        alert({ title: 'Processed', message: 'PO realization recorded successfully.' });
        fetchData();
        setRealValues(prev => {
          const next = { ...prev };
          delete next[po.id_row];
          return next;
        });
      } else {
        alert({ title: 'Processing Failed', message: json.message || 'Gagal memproses PO.' });
      }
    } catch (err) { 
      alert({ title: 'Connection Error', message: 'Terjadi kesalahan koneksi.' }); 
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {pending.map((po, idx) => (
        <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gray-50 rotate-45 translate-x-8 -translate-y-8" />
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest block mb-2">Queue Item</span>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{data.customers.find((c: any) => c.id_customer === po.id_customer)?.nama_customer}</h3>
            <p className="text-xs text-gray-500">{data.products.find((p: any) => p.id_product === po.product)?.nama_product}</p>
          </div>
          <div className="space-y-6 pt-6 border-t border-gray-100">
             <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-gray-400">Target Inventory:</span>
                <span className="font-bold text-gray-900">{po.qty}</span>
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Input Actual Qty</label>
               <input type="number" value={realValues[po.id_row] || ''} onChange={e => setRealValues({...realValues, [po.id_row]: parseInt(e.target.value)})} className="w-full p-3 bg-indigo-600 text-white rounded-lg font-mono text-center focus:ring-4 focus:ring-indigo-100 transition-all" placeholder="0" />
             </div>
             <button type="button" onClick={() => handleProcess(po)} className="w-full py-3 bg-gray-100 text-gray-900 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">Confirm Realization</button>
          </div>
        </div>
      ))}
    </div>
  );
};

const POListView = ({ data, fetchData, setIsLoading, isLoading, API_URL, user, confirm, alert }: ViewProps) => {
  const handleDelete = async (po: any) => {
    console.log('PO Delete triggered:', po);
    
    if (!po || (po.id_row === undefined || po.id_row === null)) {
      alert({ 
        title: 'Data Error', 
        message: 'ID Baris (id_row) tidak ditemukan. Silahkan refresh data.' 
      });
      return;
    }

    const prodName = data.products?.find((p: any) => p.id_product === po.product)?.nama_product || po.product;
    
    confirm({
      title: 'HAPUS DATA PO?',
      message: `ID: ${po.po_id || 'N/A'}\nProduk: ${prodName}\n\nTindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const res = await fetch(API_URL, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deletePO', id_row: po.id_row }) 
          });
          
          const json = await res.json();
          if (json.success) {
            await fetchData();
          } else {
            alert({ title: 'Delete Failed', message: (json.message || json.error || 'Server error.') });
          }
        } catch (err: any) { 
          console.error('Delete PO error:', err);
          alert({ title: 'Connection Error', message: 'Terjadi kesalahan koneksi.' }); 
        } finally { 
          setIsLoading(false); 
        }
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Operational Archive</h2>
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{(data.pos || []).length} Entries</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date/ID</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Client Info</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Item Details</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Qty</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Lifecycle</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            {(data.pos || []).map((po: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                <td className="p-4">
                  <div className="text-sm font-medium text-gray-900">{new Date(po.tanggal_po).toLocaleDateString()}</div>
                  <div className="text-[10px] text-gray-400 font-mono italic">{po.po_id || 'ID-N/A'}</div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-semibold text-gray-900">{data.customers.find((c: any) => c.id_customer === po.id_customer)?.nama_customer || po.id_customer}</div>
                  <div className="text-[10px] text-gray-400">{data.routes.find((r: any) => r.id_rute === po.id_rute)?.rute || 'Global'}</div>
                </td>
                <td className="p-4 text-sm text-gray-600">{data.products.find((p: any) => p.id_product === po.product)?.nama_product || po.product}</td>
                <td className="p-4 font-mono text-sm text-right font-bold text-gray-900">{po.qty}</td>
                <td className="p-4 text-center">
                  <span className={cn(
                    "inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter",
                    po.status_po === 'Sudah Diproses' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  )}>{po.status_po === 'Sudah Diproses' ? 'Finalized' : 'Draft'}</span>
                </td>
                <td className="p-4 text-right">
                  {(po.status_po !== 'Sudah Diproses' || user?.level === 'Admin') && (
                    <button 
                      type="button" 
                      onClick={() => handleDelete(po)} 
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                      title="Hapus / Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PurchaseOrderForm = ({ data, fetchData, setIsLoading, isLoading, API_URL, user, confirm, alert }: ViewProps) => {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [idCustomer, setIdCustomer] = useState('');
  const [idRute, setIdRute] = useState('');
  const [items, setItems] = useState<{ product: string, qty: number }[]>([{ product: '', qty: 1 }]);

  const customerOptions = useMemo(() => (data.customers || []).map((c: Customer) => ({
    value: c.id_customer,
    label: c.nama_customer
  })), [data.customers]);

  const routeOptions = useMemo(() => (data.routes || []).map((r: Rute) => ({
    value: r.id_rute,
    label: r.rute
  })), [data.routes]);

  const productOptions = useMemo(() => (data.products || []).map((p: Product) => ({
    value: p.id_product,
    label: `${p.nama_product} (${p.satuan_stock})`
  })), [data.products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCustomer || !idRute || items.some(i => !i.product)) {
      alert({ title: 'Invalid Data', message: 'Please select customer, route, and products.' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createPO',
          tanggal_po: tanggal,
          id_sales: user?.username,
          id_customer: idCustomer,
          id_rute: idRute,
          items: items.map(({ product, qty }) => ({ product, qty }))
        })
      });
      const json = await res.json();
      if (json.success) {
        alert({ title: 'Success', message: 'PO created successfully!' });
        setTanggal(new Date().toISOString().split('T')[0]);
        setIdCustomer('');
        setIdRute('');
        setItems([{ product: '', qty: 1 }]);
        fetchData();
      } else {
        alert({ title: 'Submission Failed', message: json.message || 'Gagal menyimpan data ke database.' });
      }
    } catch (err) {
      alert({ title: 'Submission Failed', message: 'Error creating PO batch.' });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => setItems([...items, { product: '', qty: 1 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, val: any) => {
    const newItems = [...items];
    (newItems[idx] as any)[field] = val;
    setItems(newItems);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-3xl border border-gray-200 shadow-xl shadow-gray-100">
        <div className="border-b border-gray-100 pb-6 flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">New Order Dispatch</h2>
          <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Secure Entry</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction Date</label>
            <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-medium focus:ring-4 focus:ring-indigo-50 focus:bg-white transition-all outline-none" required />
          </div>

          <SearchableSelect 
            label="Assign Route"
            placeholder="Select Logistics Rute"
            options={routeOptions}
            value={idRute}
            onChange={setIdRute}
          />

          <div className="md:col-span-2">
            <SearchableSelect 
              label="Target Customer"
              placeholder="Select Target Customer"
              options={customerOptions}
              value={idCustomer}
              onChange={setIdCustomer}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-indigo-600" /> Order Components
            </h3>
            <button type="button" onClick={addItem} className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 py-2 px-4 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors">
              <PlusCircle className="w-4 h-4" /> Add Line Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row items-end gap-4 p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 group relative">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="absolute -top-3 -right-3 w-8 h-8 bg-white text-gray-400 hover:text-red-500 rounded-full border border-gray-100 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="flex-1 w-full">
                  <SearchableSelect 
                    placeholder="Select Inventory Item"
                    options={productOptions}
                    value={item.product}
                    onChange={(val) => updateItem(idx, 'product', val)}
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Qty</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={item.qty} 
                    onChange={e => updateItem(idx, 'qty', parseInt(e.target.value) || 0)} 
                    className="w-full p-4 bg-white border border-gray-200 rounded-2xl text-center font-bold text-gray-900 focus:ring-4 focus:ring-indigo-50 outline-none" 
                    required 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-extrabold uppercase tracking-[0.2em] shadow-indigo-200 shadow-2xl hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 mt-10">
          {isLoading ? "Synchronizing..." : "Submit PO Batch"}
        </button>
      </form>
    </div>
  );
};


const DashboardView = ({ pos }: { pos: PO[] }) => {
  const stats = useMemo(() => {
    const totalPO = pos.length;
    const processedPO = pos.filter(p => p.status_po === 'Sudah Diproses').length;
    const targetQty = pos.reduce((acc, p) => acc + (Number(p.qty) || 0), 0);
    const realizationQty = pos.reduce((acc, p) => acc + (Number(p.qty_realisasi) || 0), 0);
    const realizationRate = targetQty > 0 ? (realizationQty / targetQty) * 100 : 0;
    
    // Group by Sales
    const salesData = pos.reduce((acc: any, p) => {
      acc[p.id_sales] = (acc[p.id_sales] || 0) + 1;
      return acc;
    }, {});
    
    const chartDataSales = Object.entries(salesData).map(([name, count]) => ({ name, count }));

    return { totalPO, processedPO, realizationRate, chartDataSales };
  }, [pos]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-indigo-100">
          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Total Orders</h3>
          <p className="text-4xl font-bold text-gray-900">{stats.totalPO}</p>
          <div className="mt-4 h-1 w-12 bg-indigo-600 rounded-full" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-indigo-100">
          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Processed</h3>
          <p className="text-4xl font-bold text-gray-900">{stats.processedPO}</p>
          <div className="mt-4 h-1 w-12 bg-green-500 rounded-full" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-indigo-100">
          <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Realization</h3>
          <p className="text-4xl font-bold text-gray-900">{stats.realizationRate.toFixed(1)}%</p>
          <div className="mt-4 h-1 w-12 bg-indigo-400 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6">Distribution by Sales</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartDataSales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10}} />
                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
          <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6 w-full">Queue Status</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Processed', value: stats.processedPO },
                    { name: 'Pending', value: stats.totalPO - stats.processedPO }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#4f46e5" />
                  <Cell fill="#e0e7ff" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerDataView = ({ data, fetchData, setIsLoading, isLoading, API_URL, user, confirm, alert }: ViewProps) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nama: '', wa: '', alamat: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (c: Customer) => {
    setIsEditing(c.id_customer);
    setFormData({ 
      nama: c.nama_customer, 
      wa: c.whatsapp_customer, 
      alamat: c.alamat 
    });
    setIsAdding(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const action = isEditing ? 'updatecustomer' : 'createcustomer';
      const body = isEditing 
        ? { action, id_customer: isEditing, nama_customer: formData.nama, whatsapp_customer: formData.wa, alamat: formData.alamat }
        : { action, nama_customer: formData.nama, whatsapp_customer: formData.wa, alamat: formData.alamat };
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        setIsEditing(null);
        setIsAdding(false);
        setFormData({ nama: '', wa: '', alamat: '' });
        fetchData();
      } else {
        alert({ title: 'Save Failed', message: json.message || 'Gagal menyimpan data customer.' });
      }
    } catch (err) {
      alert({ title: 'Error', message: 'Failed to save customer data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    console.log('Customer Delete triggered:', customer);
    
    if (!customer || (customer.id_row === undefined || customer.id_row === null)) {
      alert({ 
        title: 'Data Error', 
        message: 'ID Baris (id_row) tidak ditemukan. Coba refresh data.' 
      });
      return;
    }

    confirm({
      title: 'HAPUS PERMANEN?',
      message: `Record: "${customer.nama_customer}"\n\nData ini akan dihapus selamanya dari Google Sheets.`,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'deletecustomer', 
              id_row: customer.id_row 
            })
          });
          
          const json = await res.json();
          if (json.success) {
            await fetchData();
          } else {
            alert({ title: 'Delete Failed', message: (json.message || json.error || 'Server error.') });
          }
        } catch (err: any) {
          console.error('Delete customer error:', err);
          alert({ title: 'Connection Error', message: 'Terjadi kesalahan koneksi.' });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const formatWA = (num: any) => {
    const sNum = String(num || '');
    if (!sNum) return '';
    const cleanNum = sNum.replace(/\D/g, '');
    return cleanNum.startsWith('0') ? '62' + cleanNum.substring(1) : cleanNum;
  };

  const filteredCustomers = (data.customers || []).filter((c: Customer) => 
    c.nama_customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(c.whatsapp_customer || '').includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Customer Repository</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button 
            id="btn-register-customer"
            onClick={() => { setIsAdding(true); setIsEditing(null); setFormData({ nama: '', wa: '', alamat: '' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Register
          </button>
        </div>
      </div>

      {(isEditing || isAdding) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-50/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-4">{isEditing ? 'Update Client Record' : 'Create New Client'}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</label>
              <input required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">WhatsApp</label>
              <input required placeholder="08..." value={formData.wa} onChange={e => setFormData({...formData, wa: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</label>
              <input required value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => { setIsEditing(null); setIsAdding(false); }} className="px-4 py-2 text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest">Abort</button>
              <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700">
                <Save className="w-3 h-3" /> Commit Changes
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer Name</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">WhatsApp</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Address</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id_customer} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {c.nama_customer.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{c.nama_customer}</div>
                        <div className="text-[10px] text-gray-400 font-mono italic">{c.id_customer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <a 
                      href={`https://wa.me/${formatWA(c.whatsapp_customer)}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-full text-xs font-bold transition-all"
                    >
                      <MessageCircle className="w-3 h-3 fill-current" />
                      {c.whatsapp_customer}
                    </a>
                  </td>
                  <td className="p-4">
                    <div className="flex items-start gap-2 max-w-xs">
                      <MapPin className="w-3 h-3 text-gray-300 mt-1 flex-shrink-0" />
                      <span className="text-xs text-gray-600 line-clamp-1 group-hover:line-clamp-none">{c.alamat}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleEdit(c)} 
                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                        title="Edit Record"
                      >
                        <Edit className="w-5 h-5 pointer-events-none" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(c)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                        title="Hapus Permanen"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 italic text-sm">No customers found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 3. Main Business Logic
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('Dashboard');
  const [data, setData] = useState<{
    products: Product[],
    customers: Customer[],
    routes: Rute[],
    pos: PO[],
    users: any[]
  }>({
    products: [],
    customers: [],
    routes: [],
    pos: [],
    users: []
  });
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
    if (!API_URL) {
      setError("API URL is missing. Check .env or update APPS_SCRIPT.gs first.");
      return;
    }
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
        // Jika ada pesan dari server, pakai itu. Jika tidak, pakai error/message generic.
        setError(json.message || json.error || "Login gagal: Kredensial tidak valid atau masalah koneksi.");
      }
    } catch (err: any) {
      setError("Kesalahan Koneksi: Pastikan Backend dan Apps Script berjalan. " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('Dashboard');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Order System <span className="text-indigo-600 italic"></span></h1>
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

  const sideMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, view: 'Dashboard' as View, roles: ['Sales', 'Admin'] },
    { label: 'Purchase Order', icon: ShoppingCart, view: 'PurchaseOrder' as View, roles: ['Sales', 'Admin'] },
    { label: 'View Archive', icon: ListOrdered, view: 'DaftarPO' as View, roles: ['Sales', 'Admin'] },
    { label: 'Customers', icon: Users, view: 'CustomerData' as View, roles: ['Sales', 'Admin'] },
    { label: 'Process Unit', icon: ClipboardCheck, view: 'ProsesPO' as View, roles: ['Admin'] },
    { label: 'Analytics', icon: BarChart3, view: 'AnalisaPO' as View, roles: ['Sales', 'Admin'] },
  ].filter(i => i.roles.includes(user.level));

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      <aside className={cn("bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col", isSidebarCollapsed ? "w-20" : "w-64")}>
        <div className="h-16 px-6 flex items-center border-b border-gray-100">
           <ShoppingCart className="w-6 h-6 mr-3 min-w-[24px] text-indigo-600" />
           {!isSidebarCollapsed && <h1 className="font-bold text-lg text-gray-900 tracking-tight">Purchase Order System</h1>}
        </div>
        <nav className="p-4 space-y-1 mt-2">
          {sideMenu.map(m => (
            <SidebarItem key={m.label} icon={m.icon} label={m.label} isActive={view === m.view} onClick={() => setView(m.view)} isCollapsed={isSidebarCollapsed} />
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-100">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="flex items-center w-full p-3 text-gray-400 hover:text-gray-900 transition-colors">
            <Menu className="w-5 h-5 mx-auto" />
            {!isSidebarCollapsed && <span className="text-[10px] uppercase font-bold tracking-widest ml-4">Toggle Menu</span>}
          </button>
          <button onClick={handleLogout} className="flex items-center w-full p-3 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5 mx-auto" />
            {!isSidebarCollapsed && <span className="text-[10px] uppercase font-bold tracking-widest ml-4">Terminal Exit</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 px-8 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <h2 className="font-bold text-gray-900">{view}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-900">{user.username}</p>
              <p className="text-[9px] uppercase tracking-widest text-gray-400">{user.level} Session</p>
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
               {view === 'Dashboard' && <DashboardView pos={data.pos} />}
               {view === 'PurchaseOrder' && <PurchaseOrderForm data={data} fetchData={fetchData} setIsLoading={setIsLoading} isLoading={isLoading} API_URL={API_URL} user={user} confirm={customConfirm} alert={customAlert} />}
               {view === 'DaftarPO' && <POListView data={data} fetchData={fetchData} setIsLoading={setIsLoading} isLoading={isLoading} API_URL={API_URL} user={user} confirm={customConfirm} alert={customAlert} />}
               {view === 'ProsesPO' && <ProcessPOView data={data} fetchData={fetchData} setIsLoading={setIsLoading} isLoading={isLoading} API_URL={API_URL} user={user} confirm={customConfirm} alert={customAlert} />}
               {view === 'AnalisaPO' && <POAnalysisView data={data} />}
               {view === 'CustomerData' && <CustomerDataView data={data} fetchData={fetchData} setIsLoading={setIsLoading} isLoading={isLoading} API_URL={API_URL} user={user} confirm={customConfirm} alert={customAlert} />}
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
