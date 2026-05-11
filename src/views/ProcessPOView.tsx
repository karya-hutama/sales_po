import React, { useState, useMemo } from 'react';
import { ViewProps, PO } from '../types';
import { Calendar, Package, ChevronRight, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const ProcessPOView = ({ data, fetchData, setIsLoading, isLoading, API_URL, alert }: ViewProps) => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPO, setSelectedPO] = useState<string | null>(null);
  const [realValues, setRealValues] = useState<Record<number, number>>({});

  const pendingGroups = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    const groups: Record<string, PO[]> = {};
    (data.pos || []).forEach(p => {
      const pDate = new Date(p.tanggal_po);
      if (p.status_po !== 'Sudah Diproses' && pDate >= start && pDate <= end) {
        if (!groups[p.po_id]) groups[p.po_id] = [];
        groups[p.po_id].push(p);
      }
    });
    return Object.values(groups).sort((a, b) => new Date(a[0].tanggal_po).getTime() - new Date(b[0].tanggal_po).getTime());
  }, [data.pos, startDate, endDate]);

  const activePOItems = useMemo(() => 
    data.pos.filter(p => p.po_id === selectedPO),
    [selectedPO, data.pos]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Date Range Start
          </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none" />
        </div>
        <div className="flex-1 w-full space-y-2">
          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest flex items-center gap-2">
            <Calendar className="w-3 h-3" /> Date Range End
          </label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none" />
        </div>
      </div>

      {/* Grouped Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/20">
          <h2 className="text-xl font-bold text-gray-900">Pending Confirmations</h2>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{pendingGroups.length} Active Batches</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Transaction Date</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Target Client</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">Batch ID</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">SKUs</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {pendingGroups.map((group, idx) => {
                const first = group[0];
                return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-indigo-50/10 transition-colors">
                    <td className="p-4 text-sm font-bold text-gray-900">{new Date(first.tanggal_po).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-700">
                        {data.customers.find(c => c.id_customer === (first as any).id_customer)?.nama_customer || (first as any).id_customer}
                      </div>
                    </td>
                    <td className="p-4 text-center text-[10px] font-mono text-gray-400">{first.po_id}</td>
                    <td className="p-4 text-center">
                      <div className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-black uppercase tracking-widest">
                        {group.length} Items
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedPO(first.po_id)}
                        className="flex items-center gap-2 ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                      >
                        Detail PO <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pendingGroups.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-300 italic text-xs uppercase tracking-widest font-bold">
                    No pending orders within this date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Detail Modal */}
      <AnimatePresence>
        {selectedPO && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Realization Entry</h3>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Batch: {selectedPO}</p>
                </div>
                <button onClick={() => setSelectedPO(null)} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 shadow-sm border border-transparent hover:border-gray-100 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {activePOItems.map((item, i) => {
                  const isProcessed = item.status_po === 'Sudah Diproses';
                  return (
                    <div key={i} className={cn(
                      "p-6 rounded-2xl border transition-all",
                      isProcessed ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
                    )}>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-bold text-gray-900">{data.products.find(p => p.id_product === item.product)?.nama_product || item.product}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Planned Qty: {item.qty_po || (item as any).qty}</p>
                          </div>
                        </div>
                        {isProcessed && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                      </div>

                      {!isProcessed ? (
                        <div className="flex gap-4 items-end">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Actual Realization</label>
                            <input 
                              type="number" 
                              placeholder="Input Qty..."
                              value={realValues[item.id_row] || ''} 
                              onChange={e => setRealValues({...realValues, [item.id_row]: parseInt(e.target.value)})}
                              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-center font-mono font-bold text-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center text-xs font-bold text-green-700">
                          <span>Finalized Realization:</span>
                          <span>{item.qty_realisasi} units</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="p-6 bg-gray-50/80 space-y-3">
                {activePOItems.some(p => p.status_po !== 'Sudah Diproses') && (
                  <button 
                    onClick={async () => {
                      if (isLoading) return;
                      const itemsToProcess = activePOItems.filter(p => p.status_po !== 'Sudah Diproses');
                      const invalid = itemsToProcess.find(p => realValues[p.id_row] === undefined || isNaN(realValues[p.id_row]));
                      
                      if (invalid) {
                        alert({ title: 'Validation', message: 'Please input realization for all pending items.' });
                        return;
                      }

                      setIsLoading(true);
                      try {
                        for (const item of itemsToProcess) {
                          await fetch(API_URL, { 
                            method: 'POST', 
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              action: 'processPO', 
                              id_row: item.id_row, 
                              qty_realisasi: realValues[item.id_row] 
                            }) 
                          });
                        }
                        await fetchData();
                        alert({ title: 'Success', message: 'Batch items confirmed successfully.' });
                        setSelectedPO(null);
                      } catch (err) {
                        alert({ title: 'Error', message: 'Connection failed during batch processing.' });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                        Synchronizing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Confirm Entire Batch
                      </>
                    )}
                  </button>
                )}
                <button 
                  onClick={() => setSelectedPO(null)} 
                  className="w-full py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-600 shadow-sm transition-all"
                >
                  Cancel / Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

