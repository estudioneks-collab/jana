
import React, { useState } from 'react';
import { Transaction } from '../types';
// Add TrendingUp to imports
import { Download, Upload, Plus, Search, Calendar, DollarSign, Wallet, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const Accounting: React.FC<Props> = ({ transactions, setTransactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    type: 'ingreso',
    category: 'venta',
    description: '',
    amount: 0
  });

  const totalIncome = transactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contabilidad");
    XLSX.writeFile(wb, `jana-contabilidad-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as Transaction[];
      setTransactions(prev => [...data, ...prev]);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTransactions(prev => [{ ...formData, id: Date.now().toString() }, ...prev]);
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'ingreso',
      category: 'venta',
      description: '',
      amount: 0
    });
  };

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold brand-font text-slate-900">Contabilidad</h2>
          <p className="text-slate-500 text-sm">Controla tus ingresos, gastos de local y ganancias mensuales.</p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all font-medium text-sm">
            <Upload size={18} />
            Importar
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} />
          </label>
          <button 
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm"
          >
            <Download size={18} />
            Exportar
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-200 font-medium text-sm"
          >
            <Plus size={18} />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <DollarSign size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Ingresos Totales</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Gastos Totales</span>
          </div>
          <p className="text-2xl font-bold text-rose-700">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <Wallet size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">Balance Neto</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700">${balance.toLocaleString()}</p>
        </div>
      </div>

      {/* Search and List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar movimientos..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Concepto</th>
              <th className="px-6 py-4">Categoría</th>
              <th className="px-6 py-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {t.date}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{t.description}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                    t.type === 'ingreso' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {t.category}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${
                  t.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {t.type === 'ingreso' ? '+' : '-'}${t.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">No hay movimientos registrados.</div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold brand-font text-slate-900">Registrar Movimiento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'ingreso'})}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                    formData.type === 'ingreso' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                  }`}
                >Ingreso</button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'egreso'})}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                    formData.type === 'egreso' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'
                  }`}
                >Egreso</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <input 
                  type="date"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <input 
                  required
                  placeholder="Ej: Insumos varios"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="venta">Venta</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="insumos">Insumos</option>
                    <option value="impuestos">Impuestos</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                  <input 
                    type="number"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
