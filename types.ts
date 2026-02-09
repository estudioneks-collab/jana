
export interface Material {
  id: string;
  name: string;
  category: 'perlas' | 'cadenas' | 'dijes' | 'otros';
  unit: string;
  costPerUnit: number;
  stock: number;
}

export interface BudgetItem {
  materialId: string;
  quantity: number;
  subtotal: number;
}

export interface Budget {
  id: string;
  clientName: string;
  date: string;
  items: BudgetItem[];
  discountAmount: number;
  discountDescription: string;
  total: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  items: BudgetItem[];
  totalCost: number;
  suggestedPrice: number;
  dateCreated: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'ingreso' | 'egreso';
  category: string;
  description: string;
  amount: number;
}

export interface MonthlyStats {
  month: string;
  ingresos: number;
  egresos: number;
  balance: number;
}
