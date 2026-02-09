
import React, { useState } from 'react';
import { Transaction } from '../types';
// Fixed: Added Trash2 to the imported icons from 'lucide-react'
import { Download, Upload, Plus, Search, Calendar, DollarSign, Wallet, TrendingUp, X, Save, AlertCircle, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { db, getSupabase } from '../lib/supabase';

interface Props {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const Accounting: React.FC<Props> = ({ transactions, setTransactions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
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
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as Transaction[];
        
        // Intentar guardar cada uno en Supabase
        if (getSupabase()) {
          for (const item of data) {
            await db.upsert('transactions', item);
          }
        }
        
        setTransactions(prev => [...data, ...prev]);
        alert("Importación exitosa y sincronizada.");
      } catch (err) {
        alert("Error al importar: Verifica el formato del archivo.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) return alert("El monto debe ser mayor a 0");
    
    setIsSaving(true);
    const newId = `manual-${Date.now()}`;
    const transactionData: Transaction = { ...formData, id: newId };

    try {
      if (getSupabase()) {
        await db.upsert('transactions', transactionData);
      }
      
      setTransactions(prev => [transactionData, ...prev]);
      setIsModalOpen(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: 'ingreso',
        category: 'venta',
        description: '',
        amount: 0
      });
      alert("Registro guardado correctamente en la nube.");
    } catch (err: any) {
      console.error("Error al guardar transacción:", err);
      alert(`No se pudo guardar: ${err.message || "Error de base de datos"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este registro contable?')) {
      try {
        if (getSupabase()) await db.remove('transactions', id);
        setTransactions(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        alert("Error al eliminar del servidor.");
      }
    }
  };

  const filtered = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold brand-font text-[#2C3E50] italic">Contabilidad de Jana</h2>
          <p className="text-slate-500 text-sm">Controla tus ingresos, gastos de local y ganancias mensuales.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest">
            <Upload size={16} />
            Importar
            <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} />
          </label>
          <button 
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <Download size={16} />
            Exportar
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#5D7F8E] hover:bg-[#4A6A78] text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-[#5D7F8E]/20 font-bold text-xs uppercase tracking-widest"
          >
            <Plus size={16} />
            Nuevo Registro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 text-[#5D7F8E] mb-3">
            <div className="p-2 bg-[#5D7F8E]/10 rounded-lg"><DollarSign size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ingresos Totales</span>
          </div>
          <p className="text-3xl font-black text-[#2C3E50]">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-white shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 text-rose-400 mb-3">
            <div className="p-2 bg-rose-50 rounded-lg"><TrendingUp size={20} className="rotate-180" /></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Gastos Totales</span>
          </div>
          <p className="text-3xl font-black text-[#2C3E50]">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-[#2C3E50] p-8 rounded-[2rem] text-white shadow-2xl shadow-[#2C3E50]/20">
          <div className="flex items-center gap-3 text-white/60 mb-3">
            <div className="p-2 bg-white/10 rounded-lg"><Wallet size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Balance Neto</span>
          </div>
          <p className="text-3xl font-black text-white">${balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-6 border-b border-[#F2EFED] bg-slate-50/30 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por concepto o categoría..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#F2EFED] rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#5D7F8E] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Fecha</th>
                <th className="px-8 py-5">Concepto</th>
                <th className="px-8 py-5">Categoría</th>
                <th className="px-8 py-5 text-right">Monto</th>
                <th className="px-8 py-5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFED]">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="opacity-40" />
                      {t.date}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#2C3E50]">{t.description}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                      t.type === 'ingreso' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-right font-black text-lg ${
                    t.type === 'ingreso' ? 'text-emerald-600' : 'text-[#2C3E50]'
                  }`}>
                    {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <AlertCircle size={40} className="text-slate-200" />
            <p className="text-slate-400 font-medium italic">No se han registrado movimientos aún.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C3E50]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
            <div className="p-8 border-b border-[#F2EFED] flex items-center justify-between">
              <h3 className="text-2xl font-bold brand-font text-[#2C3E50] italic">Registrar Movimiento</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-[#2C3E50] bg-slate-50 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="flex gap-4 p-1.5 bg-[#F2EFED] rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'ingreso', category: 'venta'})}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    formData.type === 'ingreso' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400'
                  }`}
                >Ingreso</button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'egreso', category: 'insumos'})}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    formData.type === 'egreso' ? 'bg-white text-rose-500 shadow-md' : 'text-slate-400'
                  }`}
                >Egreso</button>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha del Movimiento</label>
                <input 
                  type="date"
                  required
                  className="w-full px-5 py-3.5 bg-slate-50 border border-[#F2EFED] rounded-2xl outline-none focus:ring-2 focus:ring-[#5D7F8E] font-medium"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Concepto / Descripción</label>
                <input 
                  required
                  placeholder="Ej: Pago de Alquiler Local"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-[#F2EFED] rounded-2xl outline-none focus:ring-2 focus:ring-[#5D7F8E] font-medium"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoría</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-[#F2EFED] rounded-2xl outline-none font-bold text-sm"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {formData.type === 'ingreso' ? (
                      <>
                        <option value="venta">Venta</option>
                        <option value="inversion">Inversión Capital</option>
                        <option value="otro_ingreso">Otros</option>
                      </>
                    ) : (
                      <>
                        <option value="insumos">Insumos/Materiales</option>
                        <option value="alquiler">Alquiler/Servicios</option>
                        <option value="publicidad">Publicidad/Redes</option>
                        <option value="packaging">Packaging</option>
                        <option value="otros">Otros Gastos</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Monto ($)</label>
                  <input 
                    type="number"
                    required
                    className="w-full px-5 py-3.5 bg-slate-50 border border-[#F2EFED] rounded-2xl outline-none focus:ring-2 focus:ring-[#5D7F8E] font-black text-lg"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="w-full py-4 bg-[#2C3E50] hover:bg-[#1A2632] text-white rounded-[1.5rem] font-bold uppercase text-xs tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
