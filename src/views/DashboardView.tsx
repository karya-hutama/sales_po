import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { PO, Product } from '../types';

export const DashboardView = ({ pos, products }: { pos: PO[], products: Product[] }) => {
  const stats = useMemo(() => {
    const totalPO = pos.length;
    const processedPO = pos.filter(p => p.status_po === 'Sudah Diproses').length;
    const targetQty = pos.reduce((acc, p) => acc + (Number(p.qty_po || (p as any).qty) || 0), 0);
    const realizationQty = pos.reduce((acc, p) => acc + (Number(p.qty_realisasi) || 0), 0);
    const realizationRate = targetQty > 0 ? (realizationQty / targetQty) * 100 : 0;
    
    // Group by Sales
    const salesData = pos.reduce((acc: any, p) => {
      const salesId = (p as any).id_sales || 'Unknown';
      acc[salesId] = (acc[salesId] || 0) + 1;
      return acc;
    }, {});
    
    const chartDataSales = Object.entries(salesData).map(([name, count]) => ({ name, count }));

    // Group by Product for Fulfillment
    const productStats = pos.reduce((acc: any, p) => {
      const pId = p.product;
      if (!acc[pId]) acc[pId] = { target: 0, real: 0 };
      acc[pId].target += (Number(p.qty_po || (p as any).qty) || 0);
      acc[pId].real += (Number(p.qty_realisasi) || 0);
      return acc;
    }, {});

    const chartDataProducts = Object.entries(productStats).map(([id, s]: [string, any]) => {
      const pName = products.find(prod => prod.id_product === id)?.nama_product || id;
      return {
        name: pName,
        target: s.target,
        real: s.real,
        rate: s.target > 0 ? (s.real / s.target) * 100 : 0
      };
    }).sort((a, b) => b.target - a.target).slice(0, 8); // Top 8 products

    return { totalPO, processedPO, realizationRate, chartDataSales, chartDataProducts };
  }, [pos, products]);

  return (
    <div className="space-y-8 pb-10">
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

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Product Fulfillment Metrics</h3>
              <p className="text-xs text-gray-500 mt-1">Comparing target PO vs actual realization per product</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-100 rounded-sm" />
                <span className="text-[10px] font-bold uppercase text-gray-400">Target</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
                <span className="text-[10px] font-bold uppercase text-gray-400">Realization</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartDataProducts} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#4b5563', fontSize: 11, fontWeight: 600}}
                  width={120}
                />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="target" fill="#e0e7ff" radius={[0, 4, 4, 0]} barSize={20} />
                <Bar dataKey="real" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
