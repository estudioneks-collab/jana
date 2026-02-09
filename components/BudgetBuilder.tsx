
import React, { useState, useMemo } from 'react';
import { Product, BudgetItem, Transaction, Client, Budget } from '../types';
import { Plus, Trash2, FileText, Download, User, ShoppingBag, X, Search, ChevronDown, Check, Leaf, History, Edit3, Save, Eye, Lock, Unlock, Percent, DollarSign } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db, getSupabase } from '../lib/supabase';

interface Props {
  products: Product[];
  clients: Client[];
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  logo: string | null;
}

const BudgetBuilder: React.FC<Props> = ({ products, clients, budgets, setBudgets, setTransactions, logo }) => {
  const [view, setView] = useState<'create' | 'history'>('create');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [utilityPercentage, setUtilityPercentage] = useState(100); 
  
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('percent');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountDesc, setDiscountDesc] = useState('');
  
  const [status, setStatus] = useState<'pendiente' | 'emitido'>('pendiente');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      (c.instagram && c.instagram.toLowerCase().includes(clientSearch.toLowerCase()))
    );
  }, [clients, clientSearch]);

  const rawCostTotal = useMemo(() => items.reduce((acc, item) => acc + item.subtotal, 0), [items]);
  const utilityAmount = useMemo(() => (rawCostTotal * utilityPercentage) / 100, [rawCostTotal, utilityPercentage]);
  const subtotalWithUtility = useMemo(() => rawCostTotal + utilityAmount, [rawCostTotal, utilityAmount]);

  const calculatedDiscountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return (subtotalWithUtility * discountValue) / 100;
    }
    return discountValue;
  }, [subtotalWithUtility, discountType, discountValue]);

  const finalTotal = useMemo(() => subtotalWithUtility - calculatedDiscountAmount, [subtotalWithUtility, calculatedDiscountAmount]);

  const loadBudgetForEdit = (budget: Budget) => {
    if (budget.status === 'emitido') {
      alert("Este presupuesto ya fue emitido y no puede editarse.");
      return;
    }
    setEditingBudgetId(budget.id);
    setItems(budget.items);
    setUtilityPercentage(budget.utilityPercentage);
    
    if (budget.discountDesc.includes('%')) {
      const pct = parseFloat(budget.discountDesc);
      setDiscountType('percent');
      setDiscountValue(isNaN(pct) ? 0 : pct);
    } else {
      setDiscountType('fixed');
      setDiscountValue(budget.discountAmount);
    }
    
    setDiscountDesc(budget.discountDesc);
    setStatus(budget.status);
    setSelectedClient(clients.find(c => c.id === budget.clientId) || null);
    setView('create');
  };

  const resetForm = () => {
    setEditingBudgetId(null);
    setItems([]);
    setSelectedClient(null);
    setDiscountValue(0);
    setDiscountDesc('');
    setUtilityPercentage(100);
    setStatus('pendiente');
  };

  const addItem = () => {
    if (products.length === 0) return alert('Debes tener productos cargados.');
    const firstProd = products[0];
    setItems([...items, { 
      productId: firstProd.id, 
      quantity: 1, 
      unitCost: firstProd.totalCost, 
      subtotal: firstProd.totalCost 
    }]);
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      item.productId = value;
      item.unitCost = prod?.totalCost || 0;
    } else if (field === 'quantity') {
      item.quantity = Number(value);
    }
    item.subtotal = item.unitCost * item.quantity;
    setItems(newItems);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    if (logo) {
      try { doc.addImage(logo, 'PNG', 20, 15, 40, 40, undefined, 'FAST'); } catch (e) {}
    }

    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(32);
    doc.text('PRESUPUESTO', pageWidth - 20, 35, { align: 'right' });
    
    doc.setFontSize(14);
    doc.text(`# ${editingBudgetId?.slice(-6) || 'NUEVO'}`, pageWidth - 20, 48, { align: 'right' });
    doc.text(`${new Date().toLocaleDateString()}`, pageWidth - 20, 56, { align: 'right' });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Cliente', 25, 80);
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(`${selectedClient?.name || 'Consumidor Final'}`, 25, 88);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text('Teléfono:', 25, 98);
    doc.setTextColor(44, 62, 80);
    doc.text(`${selectedClient?.phone || '-'}`, 45, 98);

    const tableData = items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return [prod?.name || 'Diseño Jana', item.quantity, `$${item.unitCost.toLocaleString()}`, `$${item.subtotal.toLocaleString()}`];
    });

    autoTable(doc, {
      startY: 110,
      head: [['Descripción', 'Cantidad', 'Unitario', 'Subtotal']],
      body: tableData,
      theme: 'plain',
      headStyles: { fillColor: [242, 239, 237], textColor: [93, 127, 142], fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 11, cellPadding: 6, halign: 'center', textColor: [44, 62, 80] },
      columnStyles: { 0: { halign: 'left', cellWidth: 80 } },
      margin: { left: 20, right: 20 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    const summaryX = pageWidth - 20;

    doc.setFontSize(10);
    doc.setTextColor(93, 127, 142);
    doc.setFillColor(242, 239, 237);
    doc.rect(110, finalY, 80, 8, 'F');
    doc.text('Subtotal', 115, finalY + 5.5);
    doc.text(`$${subtotalWithUtility.toLocaleString()}`, summaryX - 5, finalY + 5.5, { align: 'right' });

    if (calculatedDiscountAmount > 0) {
      doc.setFillColor(230, 240, 245);
      doc.rect(110, finalY + 10, 80, 8, 'F');
      const label = discountType === 'percent' ? `Descuento ${discountValue}%` : `Descuento Especial`;
      doc.text(label, 115, finalY + 15.5);
      doc.text(`-$${calculatedDiscountAmount.toLocaleString()}`, summaryX - 5, finalY + 15.5, { align: 'right' });
    }

    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Final', 130, finalY + 32, { align: 'right' });
    doc.text(`$${finalTotal.toLocaleString()}`, summaryX, finalY + 32, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(93, 127, 142);
    doc.text('Gracias por elegir Jana Diseños', pageWidth / 2, 280, { align: 'center' });

    doc.save(`Jana-Presupuesto-${selectedClient?.name || 'Cliente'}.pdf`);
  };

  const handleSaveBudget = async (finalStatus: 'pendiente' | 'emitido') => {
    if (items.length === 0) return alert('Agrega al menos un producto.');
    setIsSubmitting(true);

    const id = editingBudgetId || Date.now().toString();
    const newBudget: Budget = {
      id,
      date: new Date().toISOString().split('T')[0],
      clientId: selectedClient?.id || null,
      items,
      utilityPercentage,
      discountAmount: calculatedDiscountAmount,
      discountDesc: discountType === 'percent' ? `${discountValue}%` : (discountDesc || 'Monto Fijo'),
      total: finalTotal,
      status: finalStatus
    };

    try {
      const client = getSupabase();
      if (client) {
        await db.upsert('budgets', newBudget);
        if (finalStatus === 'emitido') {
          const newTransaction: Transaction = {
            id: `sale-${id}`,
            date: newBudget.date,
            type: 'ingreso',
            category: 'venta',
            description: `Venta: ${selectedClient?.name || 'Venta General'}`,
            amount: finalTotal
          };
          await db.upsert('transactions', newTransaction);
          setTransactions(prev => [newTransaction, ...prev.filter(t => t.id !== `sale-${id}`)]);
        }
      }
      
      if (editingBudgetId) {
        setBudgets(prev => prev.map(b => b.id === editingBudgetId ? newBudget : b));
      } else {
        setBudgets(prev => [newBudget, ...prev]);
      }
      
      alert(finalStatus === 'emitido' ? '¡Venta registrada exitosamente!' : 'Borrador guardado correctamente.');
      resetForm();
      setView('history');
      setIsPreviewOpen(false);
    } catch (e: any) {
      console.error("Error al guardar presupuesto:", e);
      alert(`Error de base de datos: ${e.message || "Error desconocido"}. Revisa la pestaña de Configuración.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('¿Eliminar registro permanentemente?')) {
      try {
        if (getSupabase()) await db.remove('budgets', id);
        setBudgets(prev => prev.filter(b => b.id !== id));
      } catch (e) {
        alert("No se pudo eliminar de la base de datos.");
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-bold brand-font text-[#2C3E50] italic leading-tight">Ventas y Presupuestos</h2>
          <p className="text-[#5D7F8E] font-medium tracking-[0.1em] uppercase text-xs mt-2">Crea y emite tus cotizaciones profesionales</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => { setView('history'); resetForm(); }} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${view === 'history' ? 'bg-[#2C3E50] text-white shadow-lg' : 'bg-white text-slate-400'}`}>
            <History size={18} /> Historial
          </button>
          <button onClick={() => { setView('create'); resetForm(); }} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${view === 'create' ? 'bg-[#5D7F8E] text-white shadow-lg' : 'bg-white text-slate-400'}`}>
            <Plus size={18} /> Nuevo
          </button>
        </div>
      </header>

      {view === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 relative">
              <label className="block text-[10px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em] mb-4 ml-2">Asignar Cliente</label>
              <div className="relative">
                <div onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)} className="w-full flex items-center justify-between px-6 py-4 bg-[#F2EFED]/50 rounded-2xl cursor-pointer hover:bg-[#F2EFED] transition-all">
                  <div className="flex items-center gap-4">
                    <User size={20} className="text-[#5D7F8E]" />
                    <span className="font-bold text-[#2C3E50]">{selectedClient ? selectedClient.name : 'Venta General / Buscar Cliente...'}</span>
                  </div>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {isClientDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-[#F2EFED] z-[60] overflow-hidden">
                    <div className="p-4 border-b border-[#F2EFED]"><input className="w-full px-4 py-2 bg-[#F2EFED]/50 rounded-xl text-sm outline-none" placeholder="Buscar..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} onClick={e => e.stopPropagation()} /></div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="px-6 py-4 hover:bg-[#F2EFED] cursor-pointer" onClick={() => { setSelectedClient(null); setIsClientDropdownOpen(false); }}>Venta General</div>
                      {filteredClients.map(c => <div key={c.id} className="px-6 py-4 hover:bg-[#F2EFED] cursor-pointer" onClick={() => { setSelectedClient(c); setIsClientDropdownOpen(false); }}>{c.name} (@{c.instagram})</div>)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center justify-between border-b border-[#F2EFED] pb-6">
                <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-[0.2em]">Piezas del Presupuesto</h3>
                <button onClick={addItem} className="bg-[#F2EFED] text-[#5D7F8E] hover:bg-[#5D7F8E] hover:text-white px-5 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Plus size={16} /> Añadir Pieza
                </button>
              </div>
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 bg-[#F2EFED]/30 p-5 rounded-3xl border border-white">
                    <select className="flex-1 bg-white border-none rounded-xl px-4 py-2.5 text-sm font-bold text-[#2C3E50] outline-none shadow-sm" value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.totalCost})</option>)}
                    </select>
                    <input type="number" className="w-20 bg-white border-none rounded-xl px-2 py-2.5 text-center font-bold" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                    <div className="w-28 text-right font-bold text-[#2C3E50]">${item.subtotal.toLocaleString()}</div>
                    <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-500"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
              <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-[0.2em] mb-6">Ajuste de Precio Final (Descuentos)</h3>
              <div className="flex flex-col md:flex-row gap-8 items-end">
                <div className="flex-1 space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Aplicar Descuento</label>
                  <div className="flex bg-[#F2EFED] p-1.5 rounded-2xl gap-2">
                    <button 
                      onClick={() => setDiscountType('percent')}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${discountType === 'percent' ? 'bg-[#5D7F8E] text-white shadow-md' : 'text-slate-400'}`}
                    >
                      <Percent size={14} /> Porcentaje
                    </button>
                    <button 
                      onClick={() => setDiscountType('fixed')}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${discountType === 'fixed' ? 'bg-[#5D7F8E] text-white shadow-md' : 'text-slate-400'}`}
                    >
                      <DollarSign size={14} /> Monto Fijo
                    </button>
                  </div>
                </div>
                <div className="w-full md:w-48 space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {discountType === 'percent' ? 'Porcentaje (%)' : 'Monto ($)'}
                  </label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-[#F2EFED] rounded-2xl outline-none font-bold text-[#2C3E50] focus:ring-2 focus:ring-[#5D7F8E]" 
                    value={discountValue} 
                    onChange={e => setDiscountValue(Number(e.target.value))} 
                  />
                </div>
                {discountType === 'fixed' && (
                  <div className="flex-1 space-y-3 w-full">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Motivo / Descripción</label>
                    <input 
                      className="w-full px-6 py-4 bg-[#F2EFED] rounded-2xl outline-none text-sm font-medium" 
                      placeholder="Ej: Promo efectivo" 
                      value={discountDesc} 
                      onChange={e => setDiscountDesc(e.target.value)} 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#2C3E50] p-10 rounded-[3rem] text-white shadow-2xl sticky top-10">
              <h3 className="text-xl font-bold brand-font italic mb-10 text-white/90">Resumen de Venta</h3>
              <div className="space-y-8">
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <label className="block text-[10px] font-bold text-[#5D7F8E] uppercase tracking-widest">Margen de Utilidad ({utilityPercentage}%)</label>
                  <input type="range" min="0" max="400" step="5" className="w-full accent-[#5D7F8E]" value={utilityPercentage} onChange={e => setUtilityPercentage(Number(e.target.value))} />
                  <div className="flex justify-between text-xs font-bold uppercase text-white/40"><span>Subtotal</span><span>${subtotalWithUtility.toLocaleString()}</span></div>
                  {calculatedDiscountAmount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-rose-300">
                      <span>Descuento {discountType === 'percent' ? `(${discountValue}%)` : ''}</span>
                      <span>-${calculatedDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="pt-8 border-t border-white/20 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#5D7F8E]">Total Final</span>
                  <span className="text-6xl font-black tracking-tight">${finalTotal.toLocaleString()}</span>
                </div>
                <div className="space-y-4 pt-10">
                  <button onClick={() => setIsPreviewOpen(true)} disabled={items.length === 0} className="w-full py-5 bg-[#5D7F8E] text-white rounded-[1.8rem] font-bold text-xs uppercase flex items-center justify-center gap-3 hover:bg-[#4A6A78] transition-all"><Eye size={20} /> Vista Previa</button>
                  <button onClick={() => handleSaveBudget('pendiente')} disabled={items.length === 0 || isSubmitting} className="w-full py-5 bg-white/10 text-white rounded-[1.8rem] font-bold text-xs uppercase flex items-center justify-center gap-3 hover:bg-white/20 transition-all disabled:opacity-50"><Save size={20} /> Guardar Borrador</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F2EFED]/50 border-b border-[#F2EFED]">
                <th className="px-8 py-6 text-[10px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em]">Estado</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em]">Cliente</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em]">Total</th>
                <th className="px-8 py-6 text-[10px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFED]">
              {budgets.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${b.status === 'emitido' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-bold text-[#2C3E50]">{clients.find(c => c.id === b.clientId)?.name || 'Venta General'}</td>
                  <td className="px-8 py-6 font-black text-lg text-[#2C3E50]">${b.total.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { loadBudgetForEdit(b); setIsPreviewOpen(true); }} className="p-3 text-slate-400 hover:text-[#5D7F8E]"><FileText size={18} /></button>
                      <button onClick={() => loadBudgetForEdit(b)} disabled={b.status === 'emitido'} className={`p-3 rounded-xl ${b.status === 'emitido' ? 'opacity-20' : 'bg-[#F2EFED] text-[#5D7F8E]'}`}><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteBudget(b.id)} className="p-3 bg-rose-50 text-rose-300 rounded-xl"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-[#2C3E50]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col border border-white shadow-2xl animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-[#2C3E50] brand-font italic">Vista Previa Profesional</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-white rounded-xl"><X size={24} /></button>
            </div>
            
            <div className="p-16 space-y-12">
              <div className="flex justify-between items-start">
                {logo ? <img src={logo} className="w-32 h-32 object-contain" /> : <div className="w-20 h-20 bg-slate-100 rounded-2xl" />}
                <div className="text-right">
                  <h1 className="text-4xl font-black text-[#2C3E50] tracking-tighter">PRESUPUESTO</h1>
                  <p className="text-slate-400 font-bold mt-2"># {editingBudgetId?.slice(-6) || 'NUEVO'}</p>
                  <p className="text-slate-400 font-bold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div><p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Cliente</p><p className="text-xl font-bold text-[#2C3E50]">{selectedClient?.name || 'Venta General'}</p></div>
                <div className="text-right"><p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Estado</p><p className="font-bold text-[#5D7F8E] uppercase">{status}</p></div>
              </div>

              <table className="w-full text-left">
                <thead><tr className="bg-[#F2EFED] text-[#5D7F8E] text-[10px] font-bold uppercase"><th className="p-4">Descripción</th><th className="p-4 text-center">Cant.</th><th className="p-4 text-right">Unitario</th><th className="p-4 text-right">Subtotal</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, i) => (
                    <tr key={i}><td className="p-4 font-bold text-[#2C3E50]">{products.find(p => p.id === item.productId)?.name || 'Pieza'}</td><td className="p-4 text-center">{item.quantity}</td><td className="p-4 text-right">${item.unitCost.toLocaleString()}</td><td className="p-4 text-right font-bold">${item.subtotal.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col items-end gap-2 border-t pt-8">
                <div className="flex justify-between w-64 text-slate-400 font-bold text-xs uppercase"><span>Subtotal</span><span>${subtotalWithUtility.toLocaleString()}</span></div>
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between w-64 text-rose-400 font-bold text-xs uppercase bg-rose-50/50 p-2 rounded-lg">
                    <span>{discountType === 'percent' ? `Descuento ${discountValue}%` : 'Descuento'}</span>
                    <span>-${calculatedDiscountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 text-3xl font-black text-[#2C3E50] mt-4"><span>TOTAL</span><span>${finalTotal.toLocaleString()}</span></div>
              </div>
            </div>

            <div className="p-10 border-t flex gap-6 bg-slate-50">
              <button onClick={handleExportPDF} className="flex-1 py-4 border-2 border-[#5D7F8E] text-[#5D7F8E] rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-white transition-all"><Download size={18} /> Descargar PDF</button>
              <button onClick={() => handleSaveBudget('emitido')} disabled={isSubmitting} className="flex-[2] py-4 bg-[#2C3E50] text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-[#1A2632] transition-all"><Lock size={18} /> Confirmar y Emitir Venta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetBuilder;
