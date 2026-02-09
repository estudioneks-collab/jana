
import React, { useState } from 'react';
import { Material } from '../types';
import { Search, Plus, Trash2, Edit2, Filter, X } from 'lucide-react';
import { db, getSupabase } from '../lib/supabase';

interface Props {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
}

const Inventory: React.FC<Props> = ({ materials, setMaterials }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Material, 'id'>>({
    name: '',
    category: 'otros',
    unit: 'unidad',
    costPerUnit: 0,
    stock: 0
  });

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás segura de eliminar este material?')) {
      try {
        if (getSupabase()) await db.remove('materials', id);
        setMaterials(prev => prev.filter(m => m.id !== id));
      } catch (err: any) {
        alert("Error al eliminar material: " + (err.message || "Error desconocido"));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const id = editingId || Date.now().toString();
    const materialData: Material = { ...formData, id };

    try {
      if (getSupabase()) {
        await db.upsert('materials', materialData);
      }
      
      if (editingId) {
        setMaterials(prev => prev.map(m => m.id === editingId ? materialData : m));
      } else {
        setMaterials(prev => [...prev, materialData]);
      }
      closeModal();
    } catch (err: any) {
      console.error("Error completo de Supabase:", err);
      alert("Error al guardar en base de datos: " + (err.message || "Verifica las columnas en Supabase"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (material?: Material) => {
    if (material) {
      setEditingId(material.id);
      setFormData({ ...material });
    } else {
      setEditingId(null);
      setFormData({ name: '', category: 'otros', unit: 'unidad', costPerUnit: 0, stock: 0 });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filtered = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold brand-font text-slate-900">Inventario de Materiales</h2>
          <p className="text-slate-500 text-sm">Administra tus perlas, cadenas y dijes para armar presupuestos.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-200"
        >
          <Plus size={20} />
          Nuevo Material
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar materiales..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium">
          <Filter size={16} />
          Filtrar
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Costo Unidad</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">{m.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-full capitalize">{m.category}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">${m.costPerUnit}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${m.stock < 10 ? 'text-rose-500' : 'text-slate-600'}`}>{m.stock} {m.unit}s</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => openModal(m)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">No se encontraron materiales.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold brand-font text-slate-900">{editingId ? 'Editar Material' : 'Nuevo Material'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input 
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    <option value="perlas">Perlas</option>
                    <option value="cadenas">Cadenas</option>
                    <option value="dijes">Dijes</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="unidad">Unidad</option>
                    <option value="metro">Metro</option>
                    <option value="gramo">Gramo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Costo Unitario</label>
                  <input 
                    type="number"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    value={formData.costPerUnit}
                    onChange={e => setFormData({...formData, costPerUnit: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Inicial</label>
                  <input 
                    type="number"
                    required
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium shadow-lg shadow-rose-200 disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
