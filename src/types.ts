export interface Product {
  id_product: string;
  nama_product: string;
  satuan_stock: string;
  kategori?: string;
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
  po_id: string;
  tanggal_po: string;
  customer: string;
  rute: string;
  product: string;
  qty_po: number;
  qty_realisasi: number;
  status_po: string;
}

export interface AppData {
  products: Product[];
  customers: Customer[];
  routes: Rute[];
  pos: PO[];
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface ViewProps {
  data: AppData;
  fetchData: () => Promise<void>;
  setIsLoading: (loading: boolean) => void;
  isLoading: boolean;
  API_URL: string;
  user: User | null;
  confirm: (options: { title: string; message: string; onConfirm: () => void }) => void;
  alert: (options: { title: string; message: string }) => void;
}
