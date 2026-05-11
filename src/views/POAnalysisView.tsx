import React from 'react';
import { AppData } from '../types';
import { cn } from '../lib/utils';

interface POAnalysisRow {
  po_id: string;
  nama_sales: string;
  nama_customer: string;
  nama_product: string;
  rute: string;
  qty: number;
  qty_realisasi: number;
  persentase: number;
}

export const POAnalysisView = ({ data }: { data: AppData }) => {
  const analysis = (data.pos || []).map((po: any) => {
    const c = data.customers.find((cx: any) => cx.id_customer === po.id_customer);
    const r = data.routes.find((rx: any) => rx.id_rute === po.id_rute);
    const p = data.products.find((px: any) => px.id_product === po.product);
    const target = Number(po.qty_po || (po as any).qty) || 0;
    const real = Number(po.qty_realisasi) || 0;
    return {
      ...po,
      nama_sales: (po as any).id_sales || 'N/A',
      nama_customer: c?.nama_customer || 'N/A',
      nama_product: p?.nama_product || po.product || 'N/A',
      rute: r?.rute || 'Undefined',
      qty: target,
      qty_realisasi: real,
      persentase: target > 0 ? (real / target) * 100 : 0
    } as POAnalysisRow;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Sales</th>
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Nama Customer</th>
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Rute Kiriman</th>
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Nama Product</th>
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400 text-right">Qty (Real / PO)</th>
              <th className="p-4 text-[10px] uppercase font-bold tracking-widest text-gray-400">Fulfillment Rate</th>
            </tr>
          </thead>
          <tbody>
            {analysis.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4 text-sm font-bold text-gray-900">{row.nama_sales}</td>
                <td className="p-4 text-sm text-gray-600">{row.nama_customer}</td>
                <td className="p-4 text-xs text-gray-500">{row.rute}</td>
                <td className="p-4 text-xs font-medium text-indigo-600">{row.nama_product}</td>
                <td className="p-4 text-right">
                  <div className="text-sm font-mono font-bold text-gray-900">{row.qty_realisasi} / {row.qty}</div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 h-1.5 rounded-full relative overflow-hidden min-w-[60px]">
                      <div 
                        className={cn(
                          "absolute left-0 top-0 h-full rounded-full transition-all duration-1000",
                          row.persentase >= 100 ? "bg-green-500" : "bg-indigo-600"
                        )} 
                        style={{ width: `${Math.min(row.persentase, 100)}%` }} 
                      />
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
