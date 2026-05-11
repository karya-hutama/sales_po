import React, { useState, useMemo } from 'react';
import { ListOrdered, PlusCircle, X } from 'lucide-react';
import { ViewProps, Customer, Rute, Product } from '../types';
import { SearchableSelect } from '../components/ui/SearchableSelect';

export const PurchaseOrderForm = ({ data, fetchData, setIsLoading, isLoading, API_URL, user, alert }: ViewProps) => {
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
