
export interface Material {
  id: string;
  name: string;
  category: 'perlas' | 'cadenas' | 'dijes' | 'otros';
  unit: string;
  costPerUnit: number;
  stock: number;
}

export interface BudgetItem {
  productId: string;
  quantity: number;
  unitCost: number; 
  subtotal: number;
}

export interface Budget {
  id: string;
  date: string;
  clientId: string | null;
  items: BudgetItem[];
  utilityPercentage: number;
  discountAmount: number;
  discountDesc: string;
  total: number;
  status: 'pendiente' | 'emitido';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  items: { materialId: string; quantity: number; subtotal: number }[];
  totalCost: number;
  suggestedPrice: number;
  imageUrl?: string;
  dateCreated: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  instagram?: string;
  address?: string;
  dateAdded: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'ingreso' | 'egreso';
  category: string;
  description: string;
  amount: number;
}
