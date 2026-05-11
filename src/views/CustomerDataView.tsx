import React, { useState } from 'react';
import { Search, Plus, Save, Edit, Trash2, MessageCircle, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { ViewProps, Customer } from '../types';

export const CustomerDataView = ({ data, fetchData, setIsLoading, API_URL, confirm, alert }: ViewProps) => {
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
