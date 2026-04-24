export type UserLevel = 'Sales' | 'Admin';

export interface User {
  id_user: string;
  username: string;
  level: UserLevel;
}

export interface Product {
  id_product: string;
  nama_product: string;
  satuan_stock: string;
}

export interface Customer {
  id_row: number;
  id_customer: string;
  nama_customer: string;
  whatsapp_customer: string;
  alamat: string;
}

export interface Rute {
  id_rute: string;
  rute: string;
}

export interface PO {
  id_row: number;
  tanggal_po: string;
  id_sales: string;
  id_customer: string;
  product: string;
  qty: number;
  id_rute: string;
  status_po: 'Belum Diproses' | 'Sudah Diproses';
  qty_realisasi: number;
  po_id: string; // Internal grouping ID
}

export interface POAnalysisRow extends PO {
  nama_sales: string;
  nama_customer: string;
  alamat: string;
  rute: string;
  persentase: number;
}
