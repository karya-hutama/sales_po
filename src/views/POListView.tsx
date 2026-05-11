import React, { useState, useMemo } from 'react';
import { Trash2, Eye, X, Package } from 'lucide-react';
import { ViewProps, PO } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const POListView = ({ data, fetchData, setIsLoading, API_URL, user, confirm, alert }: ViewProps) => {
  const [selectedPO, setSelectedPO] = useState<string | null>(null);

  const groupedPOs = useMemo(() => {
    const groups: Record<string, PO[]> = {};
    (data.pos || []).forEach(po => {
      if (!groups[po.po_id]) groups[po.po_id] = [];
      groups[po.po_id].push(po);
    });
    return Object.values(groups).sort((a, b) => new Date(b[0].tanggal_po).getTime() - new Date(a[0].tanggal_po).getTime());
  }, [data.pos]);

  const handleDeletePO = async (po_id: string) => {
    const poItems = data.pos.filter(p => p.po_id === po_id);
    confirm({
      title: 'HAPUS SELURUH PO?',
      message: `Anda akan menghapus PO [${po_id}] yang berisi ${poItems.length} item produk.\n\nTindakan ini permanen.`,
      onConfirm: async () => {
        setIsLoading(true);
        try {
          // Delete all items in this PO batch
          for (const item of poItems) {
            await fetch(API_URL, { 
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'deletePO', id_row: item.id_row }) 
            });
          }
          await fetchData();
        } catch (err) { 
          alert({ title: 'Error', message: 'Failed to delete some items.' }); 
        } finally { 
          setIsLoading(false); 
        }
      }
    });
  };

  const activePOItems = useMemo(() => 
    data.pos.filter(p => p.po_id === selectedPO),
    [selectedPO, data.pos]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Archive</h2>
            <p className="text-xs text-gray-500 mt-1">Summary of all transactions grouped by Order ID</p>
          </div>
          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full tracking-widest">{groupedPOs.length} Batches</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Date & ID</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer / Route</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Items</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupedPOs.map((group, idx) => {
                const first = group[0];
                const isProcessed = group.every(p => p.status_po === 'Sudah Diproses');
                return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-indigo-50/20 transition-colors group">
                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-900">{new Date(first.tanggal_po).toLocaleDateString()}</div>
                      <div className="text-[10px] font-mono text-gray-400">{first.po_id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-700">
                        {data.customers.find(c => c.id_customer === (first as any).id_customer)?.nama_customer || (first as any).id_customer}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">
                        {data.routes.find(r => r.id_rute === (first as any).id_rute)?.rute || 'Reguler'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md text-[11px] font-bold text-gray-600">
                        <Package className="w-3 h-3" /> {group.length}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter",
                        isProcessed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {isProcessed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setSelectedPO(first.po_id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {(user as any)?.level === 'Admin' && (
                          <button 
                            onClick={() => handleDeletePO(first.po_id)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPO && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Order Detail: {selectedPO}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Product Breakdown</p>
                </div>
                <button onClick={() => setSelectedPO(null)} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-transparent hover:border-gray-100 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {activePOItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                          <Package className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {data.products.find(p => p.id_product === item.product)?.nama_product || item.product}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            {data.products.find(p => p.id_product === item.product)?.satuan_stock || '-'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">PO Quantity</p>
                        <p className="text-xl font-black text-indigo-600">{item.qty_po || (item as any).qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50/80 text-center">
                <button onClick={() => setSelectedPO(null)} className="w-full py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all">
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

