
import React, { useState } from 'react';
import { Product, Material, BudgetItem } from '../types';
import { Search, Plus, Trash2, Edit3, Tag, Calendar, X, BookmarkPlus } from 'lucide-react';

interface Props {
  products: Product[];
  materials: Material[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const Catalogue: React.FC<Props> = ({ products, materials, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'dateCreated'>>({
    name: '',
    description: '',
    items: [],
    totalCost: 0,
    suggestedPrice: 0,
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Deseas eliminar este diseño del catálogo?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (editingId === id) closeModal();
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description,
        items: [...product.items],
        totalCost: product.totalCost,
        suggestedPrice: product.suggestedPrice,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        items: [],
        totalCost: 0,
        suggestedPrice: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const calculateTotals = (items: BudgetItem[]) => {
    const cost = items.reduce((acc, item) => acc + item.subtotal, 0);
    return { cost, suggested: cost * 2 };
  };

  const addItem = () => {
    if (materials.length === 0) return alert('Primero debes cargar materiales en el inventario.');
    const firstMat = materials[0];
    const newItems = [...formData.items, { materialId: firstMat.id, quantity: 1, subtotal: firstMat.costPerUnit }];
    const totals = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, totalCost: totals.cost, suggestedPrice: totals.suggested });
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: any) => {
    const newItems = [...formData.items];
    const item = newItems[index];

    if (field === 'materialId') {
      const mat = materials.find(m => m.id === value);
      item.materialId = value;
      item.subtotal = (mat?.costPerUnit || 0) * item.quantity;
    } else if (field === 'quantity') {
      const mat = materials.find(m => m.id === item.materialId);
      item.quantity = Number(value);
      item.subtotal = (mat?.costPerUnit || 0) * item.quantity;
    }

    const totals = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, totalCost: totals.cost, suggestedPrice: totals.suggested });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const totals = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, totalCost: totals.cost, suggestedPrice: totals.suggested });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Debes agregar al menos un material al diseño.');

    if (editingId) {
      setProducts(prev => prev.map(p => 
        p.id === editingId ? { ...p, ...formData } : p
      ));
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
        dateCreated: new Date().toISOString().split('T')[0],
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    closeModal();
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold brand-font text-slate-900">Catálogo de Diseños</h2>
          <p className="text-slate-500 text-sm">Tus creaciones guardadas con sus costos y materiales.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar diseños..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 text-sm w-full md:w-64 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-200 font-medium text-sm"
          >
            <Plus size={18} />
            Nuevo Diseño
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No hay diseños guardados</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Crea un nuevo diseño aquí o guárdalo desde el apartado de <strong>Presupuestos</strong>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{product.name}</h3>
                    <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar size={12} />
                      {product.dateCreated}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="text-sm text-slate-600 mb-6 line-clamp-2">{product.description}</p>

                <div className="space-y-3 mb-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Materiales usados</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.items.map((item, idx) => {
                      const mat = materials.find(m => m.id === item.materialId);
                      return (
                        <span key={idx} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-medium rounded-lg border border-slate-100">
                          {item.quantity} {mat?.unit} {mat?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Costo Base</p>
                    <p className="text-lg font-bold text-slate-700">${product.totalCost}</p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] font-bold text-rose-400 uppercase">PVP Sugerido</p>
                    <p className="text-xl font-bold text-rose-600">${product.suggestedPrice}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => openModal(product)}
                className="w-full py-3 bg-slate-50 text-slate-500 font-semibold text-sm hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center gap-2 border-t border-slate-100"
              >
                <Edit3 size={16} />
                Editar Diseño
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold brand-font text-slate-900">{editingId ? 'Editar Diseño' : 'Nuevo Diseño'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del Diseño</label>
                  <input 
                    required
                    placeholder="Ej: Collar de Gala Azul"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Descripción Corta</label>
                  <input 
                    placeholder="Ej: Elegante, 45cm, perlas de cristal"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Materiales del Diseño</h4>
                  <button 
                    type="button"
                    onClick={addItem}
                    className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Agregar Material
                  </button>
                </div>
                
                <div className="space-y-3 border-t border-slate-50 pt-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50/50 p-2 rounded-xl animate-in slide-in-from-left-2 duration-200">
                      <select 
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none text-sm"
                        value={item.materialId}
                        onChange={e => updateItem(idx, 'materialId', e.target.value)}
                      >
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} (${m.costPerUnit})</option>
                        ))}
                      </select>
                      <input 
                        type="number"
                        step="0.1"
                        className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-center outline-none text-sm"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      />
                      <span className="w-20 text-right font-semibold text-slate-700 text-sm">${item.subtotal}</span>
                      <button 
                        type="button"
                        onClick={() => removeItem(idx)} 
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.items.length === 0 && (
                    <p className="text-center py-6 text-sm text-slate-400 italic">No has agregado materiales a este diseño.</p>
                  )}
                </div>
              </div>

              <div className="bg-rose-50 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-xs text-rose-400 uppercase font-bold tracking-widest">Costo de Producción</p>
                  <p className="text-3xl font-bold text-rose-700">${formData.totalCost}</p>
                </div>
                <div className="text-center md:text-right">
                  <label className="block text-xs text-indigo-400 uppercase font-bold tracking-widest mb-1">Precio de Venta Sugerido</label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-indigo-700">$</span>
                    <input 
                      type="number"
                      className="w-32 bg-white border border-indigo-100 rounded-lg px-3 py-1 text-xl font-bold text-indigo-700 text-right outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.suggestedPrice}
                      onChange={e => setFormData({...formData, suggestedPrice: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
                >
                  Cancelar
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    onClick={() => handleDelete(editingId)} 
                    className="px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button 
                  type="submit" 
                  className="flex-[2] px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
                >
                  <BookmarkPlus size={20} />
                  {editingId ? 'Actualizar Diseño' : 'Guardar en Catálogo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalogue;
