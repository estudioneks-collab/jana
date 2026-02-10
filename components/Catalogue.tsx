
import React, { useState } from 'react';
import { Product, Material } from '../types';
import { Search, Plus, Trash2, Edit3, Tag, Calendar, X, BookmarkPlus, Camera, Image as ImageIcon, Leaf, Layers, ShoppingBag } from 'lucide-react';
import { db, getSupabase } from '../lib/supabase';

interface Props {
  products: Product[];
  materials: Material[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const CATEGORIES = ['Collares', 'Pulseras', 'Aros', 'Anillos', 'Sets', 'Otros'];

const Catalogue: React.FC<Props> = ({ products, materials, setProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<Product, 'id' | 'dateCreated'>>({
    name: '',
    category: 'Collares',
    description: '',
    items: [],
    totalCost: 0,
    suggestedPrice: 0,
    imageUrl: ''
  });

  const handleDelete = async (id: string) => {
    if (confirm('¿Deseas eliminar este diseño?')) {
      try {
        if (getSupabase()) await db.remove('products', id);
        setProducts(prev => prev.filter(p => p.id !== id));
        if (editingId === id) closeModal();
      } catch (err) {
        alert("Error al eliminar.");
      }
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        category: product.category || 'Collares',
        description: product.description || '',
        items: [...product.items],
        totalCost: product.totalCost,
        suggestedPrice: product.suggestedPrice,
        imageUrl: product.imageUrl || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: 'Collares',
        description: '',
        items: [],
        totalCost: 0,
        suggestedPrice: 0,
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateTotals = (items: Product['items']) => {
    const cost = items.reduce((acc, item) => acc + item.subtotal, 0);
    return { cost, suggested: cost * 2 };
  };

  const addItem = () => {
    if (materials.length === 0) return alert('Carga materiales primero.');
    const firstMat = materials[0];
    const newItems = [...formData.items, { materialId: firstMat.id, quantity: 1, subtotal: firstMat.costPerUnit }];
    const totals = calculateTotals(newItems);
    setFormData({ ...formData, items: newItems, totalCost: totals.cost, suggestedPrice: totals.suggested });
  };

  const updateItem = (index: number, field: keyof (Product['items'][0]), value: any) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Agrega materiales.');
    
    setIsSaving(true);
    const id = editingId || Date.now().toString();
    const productData: Product = {
      id,
      name: formData.name,
      category: formData.category,
      description: formData.description, // SE ENVÍA AQUÍ
      items: formData.items,
      totalCost: formData.totalCost,
      suggestedPrice: formData.suggestedPrice,
      imageUrl: formData.imageUrl,
      dateCreated: editingId ? (products.find(p => p.id === editingId)?.dateCreated || '') : new Date().toISOString().split('T')[0]
    };

    try {
      if (getSupabase()) await db.upsert('products', productData);
      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? productData : p));
      } else {
        setProducts(prev => [productData, ...prev]);
      }
      closeModal();
    } catch (err) {
      console.error("Error al guardar producto:", err);
      alert("Error al guardar en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenShop = () => {
    window.open(window.location.origin + '?mode=shop', '_blank');
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold brand-font text-[#2C3E50] leading-tight">Catálogo</h2>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-[#5D7F8E] font-medium tracking-[0.1em] uppercase text-[10px]">Gestión de Diseños Jana</p>
             <button 
               onClick={handleOpenShop}
               className="flex items-center gap-2 text-[9px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
             >
               <ShoppingBag size={10} />
               Ver Tienda
             </button>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#5D7F8E] transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar pieza..."
              className="pl-11 pr-5 py-2.5 bg-white border-none rounded-[1.2rem] focus:ring-2 focus:ring-[#5D7F8E] text-xs w-full md:w-56 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-[#5D7F8E] hover:bg-[#4A6A78] text-white px-6 py-2.5 rounded-[1.2rem] transition-all shadow-xl shadow-[#5D7F8E]/20 font-bold text-xs tracking-wide uppercase"
          >
            <Plus size={16} />
            Nueva Creación
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center border border-white shadow-xl shadow-slate-200/50">
          <div className="w-24 h-24 bg-[#F2EFED] text-[#5D7F8E] rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Tag size={48} strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-[#2C3E50]">Comienza tu colección</h3>
          <p className="text-slate-400 max-w-sm mx-auto mt-3">
            Crea tu primer diseño para tener un registro visual y de costos de tus joyas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-[2.5rem] border border-white shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden group flex flex-col h-full">
              <div className="aspect-[5/4] bg-[#F2EFED] relative overflow-hidden">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                    <ImageIcon size={56} strokeWidth={1} />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Sin Imagen</span>
                  </div>
                )}
                <div className="absolute top-6 left-6 flex gap-2">
                   <span className="bg-white/90 backdrop-blur-md text-[#5D7F8E] text-[9px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">{product.category}</span>
                   <button 
                    onClick={() => handleDelete(product.id)}
                    className="w-10 h-10 bg-white/80 backdrop-blur-md text-slate-400 hover:text-rose-500 rounded-xl transition-all shadow-lg flex items-center justify-center"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-2xl font-bold text-[#2C3E50] group-hover:text-[#5D7F8E] transition-colors leading-tight line-clamp-1">{product.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={12} className="text-[#5D7F8E]" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.dateCreated}</span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 italic leading-relaxed">{product.description || 'Sin descripción disponible.'}</p>
                </div>

                <div className="mt-auto pt-6 border-t border-[#F2EFED] space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em] mb-1">Costo Base</p>
                      <p className="text-xl font-bold text-[#2C3E50]">${product.totalCost}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em] mb-1">Sugerido</p>
                      <p className="text-2xl font-bold text-[#5D7F8E]">${product.suggestedPrice}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => openModal(product)}
                    className="w-full py-4 bg-[#F2EFED] text-[#2C3E50] font-bold text-xs uppercase tracking-widest hover:bg-[#5D7F8E] hover:text-white transition-all rounded-2xl flex items-center justify-center gap-3 shadow-inner"
                  >
                    <Edit3 size={16} />
                    Refinar Diseño
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2C3E50]/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-[#F2EFED] rounded-[3rem] w-full max-w-5xl max-h-[92vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white">
            <div className="p-10 flex items-center justify-between bg-white border-b border-[#F2EFED]">
              <div>
                <h3 className="text-2xl font-bold brand-font text-[#2C3E50]">Refinar Diseño</h3>
                <p className="text-xs text-[#5D7F8E] font-medium mt-1 uppercase tracking-widest">Detalles técnicos y visuales de tu obra.</p>
              </div>
              <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-[#2C3E50] bg-[#F2EFED] rounded-2xl transition-all active:scale-90">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[#2C3E50]/40 uppercase tracking-[0.2em] ml-2">Vista del Producto</label>
                    <div className="relative aspect-square bg-white rounded-[2.5rem] border-2 border-dashed border-[#5D7F8E]/20 overflow-hidden group/img shadow-inner">
                      {formData.imageUrl ? (
                        <>
                          <img src={formData.imageUrl} className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, imageUrl: ''})}
                            className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur shadow-xl rounded-2xl flex items-center justify-center text-rose-500 opacity-0 group-hover/img:opacity-100 transition-all active:scale-90"
                          >
                            <Trash2 size={24} />
                          </button>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all gap-4 p-10 text-center">
                          <div className="w-20 h-20 bg-[#F2EFED] text-[#5D7F8E] rounded-3xl flex items-center justify-center shadow-lg">
                            <Camera size={40} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-[#2C3E50]">Capturar Obra</p>
                            <p className="text-xs text-slate-400 mt-1">JPEG o PNG • Máx 5MB</p>
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#2C3E50]/40 uppercase tracking-[0.2em] mb-2 ml-2">Categoría</label>
                        <div className="relative">
                          <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <select 
                            className="w-full pl-12 pr-6 py-4 bg-white border border-transparent rounded-[1.5rem] focus:ring-2 focus:ring-[#5D7F8E] outline-none transition-all font-semibold shadow-sm appearance-none"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                          >
                            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-[#2C3E50]/40 uppercase tracking-[0.2em] mb-2 ml-2">Nombre de la Pieza</label>
                        <input 
                          required
                          className="w-full px-6 py-4 bg-white border border-transparent rounded-[1.5rem] focus:ring-2 focus:ring-[#5D7F8E] outline-none transition-all font-semibold shadow-sm"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#2C3E50]/40 uppercase tracking-[0.2em] mb-2 ml-2">Descripción del Producto</label>
                      <textarea 
                        rows={4}
                        className="w-full px-6 py-4 bg-white border border-transparent rounded-[1.5rem] focus:ring-2 focus:ring-[#5D7F8E] outline-none transition-all resize-none text-sm leading-relaxed shadow-sm"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Escribe aquí los detalles, historia o inspiración de esta pieza..."
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-10">
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-[#2C3E50]/5 space-y-6 border border-white">
                    <div className="flex items-center justify-between border-b border-[#F2EFED] pb-6">
                      <h4 className="text-xs font-bold text-[#2C3E50] uppercase tracking-[0.2em]">Insumos y Detalles</h4>
                      <button 
                        type="button"
                        onClick={addItem}
                        className="text-[#5D7F8E] hover:text-[#4A6A78] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 bg-[#F2EFED] px-4 py-2 rounded-xl transition-all active:scale-95"
                      >
                        <Plus size={16} />
                        Añadir Material
                      </button>
                    </div>
                    
                    <div className="space-y-4 custom-scrollbar max-h-[350px] overflow-y-auto pr-3">
                      {formData.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-[#F2EFED]/50 p-4 rounded-2xl border border-white transition-all hover:bg-[#F2EFED]">
                          <select 
                            className="flex-1 px-4 py-3 bg-white border-none rounded-xl outline-none text-xs font-bold text-[#2C3E50]"
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
                            className="w-20 px-4 py-3 bg-white border-none rounded-xl text-center outline-none text-xs font-bold"
                            value={item.quantity}
                            onChange={e => updateItem(idx, 'quantity', e.target.value)}
                          />
                          <span className="w-24 text-right font-bold text-[#2C3E50] text-sm">${item.subtotal}</span>
                          <button 
                            type="button"
                            onClick={() => removeItem(idx)} 
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#5D7F8E] p-10 rounded-[3rem] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-[#5D7F8E]/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                      <Leaf size={180} strokeWidth={1} />
                    </div>
                    <div className="text-center md:text-left relative z-10">
                      <p className="text-[10px] text-white/50 uppercase font-bold tracking-[0.3em] mb-2">Inversión Base</p>
                      <p className="text-5xl font-bold text-white">${formData.totalCost}</p>
                    </div>
                    <div className="text-center md:text-right relative z-10">
                      <label className="block text-[10px] text-white/50 uppercase font-bold tracking-[0.3em] mb-3">Valor Sugerido Mercado</label>
                      <div className="flex items-center gap-4 justify-center md:justify-end">
                        <span className="text-3xl font-light text-white/30">$</span>
                        <input 
                          type="number"
                          className="w-40 bg-white/10 border-2 border-white/20 rounded-[1.5rem] px-6 py-3 text-3xl font-bold text-white text-right outline-none focus:bg-white/20 transition-all"
                          value={formData.suggestedPrice}
                          onChange={e => setFormData({...formData, suggestedPrice: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 flex gap-6 border-t border-white/50">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 px-8 py-5 bg-white text-[#2C3E50]/40 rounded-[1.8rem] font-bold uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
                >
                  Regresar
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-[2] px-8 py-5 bg-[#2C3E50] hover:bg-[#1A2632] text-white rounded-[1.8rem] font-bold uppercase text-xs tracking-[0.2em] shadow-2xl shadow-[#2C3E50]/20 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <BookmarkPlus size={22} />
                  )}
                  {editingId ? 'Preservar Cambios' : 'Lanzar al Catálogo'}
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
