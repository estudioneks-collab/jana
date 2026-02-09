
import React, { useState, useMemo } from 'react';
import { Product, BudgetItem, Transaction, Client, Budget } from '../types';
import { Plus, Trash2, FileText, Download, User, ShoppingBag, X, Search, ChevronDown, Check, Leaf, History, Edit3, Save, Eye, Lock, Unlock } from 'lucide-react';
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
  const [discountAmount, setDiscountAmount] = useState(0);
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

  const loadBudgetForEdit = (budget: Budget) => {
    if (budget.status === 'emitido') {
      alert("Este presupuesto ya fue emitido y no puede editarse. Si necesitas cambios, crea uno nuevo.");
      return;
    }
    setEditingBudgetId(budget.id);
    setItems(budget.items);
    setUtilityPercentage(budget.utilityPercentage);
    setDiscountAmount(budget.discountAmount);
    setDiscountDesc(budget.discountDesc);
    setStatus(budget.status);
    const client = clients.find(c => c.id === budget.clientId);
    setSelectedClient(client || null);
    setView('create');
  };

  const resetForm = () => {
    setEditingBudgetId(null);
    setItems([]);
    setSelectedClient(null);
    setDiscountAmount(0);
    setDiscountDesc('');
    setUtilityPercentage(100);
    setStatus('pendiente');
  };

  const addItem = () => {
    if (products.length === 0) return alert('Debes tener productos cargados en el catálogo.');
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
      item.subtotal = item.unitCost * item.quantity;
    } else if (field === 'quantity') {
      item.quantity = Number(value);
      item.subtotal = item.unitCost * item.quantity;
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const rawCostTotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const utilityAmount = (rawCostTotal * utilityPercentage) / 100;
  const subtotalWithUtility = rawCostTotal + utilityAmount;
  const finalTotal = subtotalWithUtility - discountAmount;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    if (logo) {
      try { doc.addImage(logo, 'PNG', 20, 15, 45, 45, undefined, 'FAST'); } catch (e) {}
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

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const summaryX = pageWidth - 20;

    doc.setFontSize(10);
    doc.setTextColor(93, 127, 142);
    doc.setFillColor(242, 239, 237);
    doc.rect(120, finalY, 70, 8, 'F');
    doc.text('Subtotal', 130, finalY + 5.5);
    doc.text(`$${subtotalWithUtility.toLocaleString()}`, summaryX - 5, finalY + 5.5, { align: 'right' });

    if (discountAmount > 0) {
      doc.setFillColor(230, 240, 245);
      doc.rect(120, finalY + 10, 70, 8, 'F');
      doc.text(`Descuento ${discountDesc || ''}`, 130, finalY + 15.5);
      doc.text(`-$${discountAmount.toLocaleString()}`, summaryX - 5, finalY + 15.5, { align: 'right' });
    }

    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Final', 140, finalY + 32, { align: 'right' });
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
      discountAmount,
      discountDesc,
      total: finalTotal,
      status: finalStatus
    };

    try {
      if (getSupabase()) {
        await db.upsert('budgets', newBudget);
        
        // Solo registrar en contabilidad si se emite
        if (finalStatus === 'emitido') {
          const newTransaction: Transaction = {
            id: `sale-${id}`,
            date: newBudget.date,
            type: 'ingreso',
            category: 'venta',
            description: `Presupuesto Emitido: ${selectedClient?.name || 'Venta General'}`,
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
      
      alert(finalStatus === 'emitido' ? '¡Presupuesto emitido y bloqueado!' : 'Borrador guardado correctamente.');
      resetForm();
      setView('history');
      setIsPreviewOpen(false);
    } catch (e) {
      alert("Error al guardar presupuesto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('¿Eliminar este presupuesto del historial?')) {
      try {
        if (getSupabase()) await db.remove('budgets', id);
        setBudgets(prev => prev.filter(b => b.id !== id));
      } catch (e) {
        alert("Error al eliminar.");
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-bold brand-font text-[#2C3E50] italic leading-tight">Ventas y Presupuestos</h2>
          <p className="text-[#5D7F8E] font-medium tracking-[0.1em] uppercase text-xs mt-2">Crea, revisa y emite tus cotizaciones</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => { setView('history'); resetForm(); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${view === 'history' ? 'bg-[#2C3E50] text-white shadow-lg' : 'bg-white text-slate-400 hover:text-[#2C3E50]'}`}
          >
            <History size={18} />
            Historial
          </button>
          <button 
            onClick={() => { setView('create'); resetForm(); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${view === 'create' ? 'bg-[#5D7F8E] text-white shadow-lg' : 'bg-white text-slate-400 hover:text-[#5D7F8E]'}`}
          >
            <Plus size={18} />
            Nuevo
          </button>
        </div>
      </header>

      {view === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 relative">
              <label className="block text-[10px] font-bold text-[#5D7F8E] uppercase tracking-[0.2em] mb-4 ml-2">Asignar Cliente</label>
              <div className="relative">
                <div 
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-[#F2EFED]/50 rounded-2xl cursor-pointer hover:bg-[#F2EFED] transition-all border border-transparent focus-within:border-[#5D7F8E]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#5D7F8E] shadow-sm">
                      <User size={20} />
                    </div>
                    <span className="font-bold text-[#2C3E50]">
                      {selectedClient ? selectedClient.name : 'Venta General / Buscar Cliente...'}
                    </span>
                  </div>
                  <ChevronDown size={20} className={`text-slate-400 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {isClientDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-[#F2EFED] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-[#F2EFED]">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                        <input 
                          className="w-full pl-10 pr-4 py-2 bg-[#F2EFED]/50 rounded-xl outline-none text-sm"
                          placeholder="Escribe nombre o Instagram..."
                          value={clientSearch}
                          onChange={(e) => setClientSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      <div className="px-6 py-4 hover:bg-[#F2EFED] cursor-pointer" onClick={() => { setSelectedClient(null); setIsClientDropdownOpen(false); }}>
                        <span className="text-sm font-medium text-slate-400">Venta General (Sin registrar)</span>
                      </div>
                      {filteredClients.map(client => (
                        <div key={client.id} className="px-6 py-4 hover:bg-[#F2EFED] cursor-pointer flex items-center justify-between" onClick={() => { setSelectedClient(client); setIsClientDropdownOpen(false); }}>
                          <div>
                            <p className="font-bold text-[#2C3E50]">{client.name}</p>
                            {client.instagram && <p className="text-[10px] text-[#5D7F8E]">@{client.instagram}</p>}
                          </div>
                          {selectedClient?.id === client.id && <Check size={18} className="text-[#5D7F8E]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 space-y-6">
              <div className="flex items-center justify-between border-b border-[#F2EFED] pb-6">
                <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-[0.2em]">Piezas del Presupuesto</h3>
                <button onClick={addItem} className="bg-[#F2EFED] text-[#5D7F8E] hover:bg-[#5D7F8E] hover:text-white px-5 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <Plus size={16} /> Añadir Diseño
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 bg-[#F2EFED]/30 p-5 rounded-3xl border border-white">
                    <div className="flex-1">
                      <select 
                        className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm font-bold text-[#2C3E50] outline-none shadow-sm"
                        value={item.productId}
                        onChange={e => updateItem(idx, 'productId', e.target.value)}
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Costo: ${p.totalCost})</option>
                        ))}
                      </select>
                    </div>
                    <input type="number" className="w-20 bg-white border-none rounded-xl px-2 py-2.5 text-center font-bold" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                    <div className="w-28 text-right font-bold text-[#2C3E50]">${item.subtotal.toLocaleString()}</div>
                    <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-500"><Trash2 size={20} /></button>
                  </div>
                ))}
                {items.length === 0 && <div className="py-10 text-center text-slate-300 italic">Presupuesto vacío</div>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#2C3E50] p-10 rounded-[3rem] text-white shadow-2xl sticky top-10">
              <h3 className="text-xl font-bold brand-font italic mb-10 text-white/90">Resumen Financiero</h3>
              
              <div className="space-y-8 relative z-10">
                <div className="pt-4 pb-2 border-t border-white/10">
                  <label className="block text-[10px] font-bold text-[#5D7F8E] uppercase tracking-widest mb-3">Margen Utilidad ({utilityPercentage}%)</label>
                  <input type="range" min="0" max="400" step="5" className="w-full accent-[#5D7F8E]" value={utilityPercentage} onChange={e => setUtilityPercentage(Number(e.target.value))} />
                </div>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-xs font-bold uppercase text-white/40">
                    <span>Costo Base</span>
                    <span>${rawCostTotal.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && <div className="flex justify-between items-center text-sm font-bold text-rose-300"><span>Ajuste</span><span>-${discountAmount.toLocaleString()}</span></div>}
                </div>

                <div className="pt-8 border-t border-white/20 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#5D7F8E]">Precio Final</span>
                  <span className="text-6xl font-black tracking-tight">${finalTotal.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-4 mt-12">
                <button onClick={() => setIsPreviewOpen(true)} disabled={items.length === 0} className="w-full py-5 bg-[#5D7F8E] text-white rounded-[1.8rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#4A6A78] disabled:opacity-30 transition-all">
                  <Eye size={20} /> Vista Previa
                </button>
                <button onClick={() => handleSaveBudget('pendiente')} disabled={items.length === 0 || isSubmitting} className="w-full py-5 bg-white/10 text-white rounded-[1.8rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/20 disabled:opacity-30 transition-all">
                  <Save size={20} /> Guardar Borrador
                </button>
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
              {budgets.map(budget => {
                const client = clients.find(c => c.id === budget.clientId);
                return (
                  <tr key={budget.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit ${
                        budget.status === 'emitido' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {budget.status === 'emitido' ? <Lock size={12} /> : <Unlock size={12} />}
                        {budget.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#2C3E50]">{client?.name || 'Venta General'}</span>
                        <span className="text-[10px] text-slate-400">{budget.date}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-lg text-[#2C3E50]">${budget.total.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                         <button 
                          onClick={() => {
                            // Cargar datos sin editar si está emitido para vista previa rápida
                            setEditingBudgetId(budget.id);
                            setItems(budget.items);
                            setUtilityPercentage(budget.utilityPercentage);
                            setDiscountAmount(budget.discountAmount);
                            setDiscountDesc(budget.discountDesc);
                            setSelectedClient(clients.find(c => c.id === budget.clientId) || null);
                            setIsPreviewOpen(true);
                          }}
                          className="p-3 text-slate-400 hover:text-[#5D7F8E]" title="Ver PDF"
                        >
                          <FileText size={18} />
                        </button>
                        <button 
                          onClick={() => loadBudgetForEdit(budget)}
                          disabled={budget.status === 'emitido'}
                          className={`p-3 rounded-xl transition-all ${budget.status === 'emitido' ? 'text-slate-200 cursor-not-allowed' : 'bg-[#F2EFED] text-[#5D7F8E] hover:bg-[#5D7F8E] hover:text-white'}`}
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDeleteBudget(budget.id)} className="p-3 bg-rose-50 text-rose-300 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL VISTA PREVIA */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-[#2C3E50]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col border border-white shadow-2xl animate-in zoom-in-95">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-[#2C3E50] brand-font italic">Vista Previa del Presupuesto</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-white rounded-xl"><X size={24} /></button>
            </div>
            
            <div className="p-16 space-y-12">
              {/* Simulación del PDF */}
              <div className="flex justify-between items-start">
                {logo ? <img src={logo} className="w-32 h-32 object-contain" /> : <div className="w-20 h-20 bg-slate-100 rounded-2xl" />}
                <div className="text-right">
                  <h1 className="text-4xl font-black text-[#2C3E50] tracking-tighter">PRESUPUESTO</h1>
                  <p className="text-slate-400 font-bold mt-2"># {editingBudgetId?.slice(-6) || 'NUEVO'}</p>
                  <p className="text-slate-400 font-bold">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Cliente</p>
                  <p className="text-xl font-bold text-[#2C3E50]">{selectedClient?.name || 'Venta General'}</p>
                  <p className="text-sm text-slate-500">{selectedClient?.phone || 'Sin teléfono'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Estado</p>
                  <p className="font-bold text-[#5D7F8E] uppercase">{status}</p>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F2EFED] text-[#5D7F8E] text-[10px] font-bold uppercase">
                    <th className="p-4">Descripción</th>
                    <th className="p-4 text-center">Cant.</th>
                    <th className="p-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td className="p-4 font-bold text-[#2C3E50]">{products.find(p => p.id === item.productId)?.name || 'Pieza'}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right font-bold">${item.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex flex-col items-end gap-2 border-t pt-8">
                <div className="flex justify-between w-64 text-slate-400 font-bold text-xs uppercase">
                  <span>Subtotal</span>
                  <span>${subtotalWithUtility.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between w-64 text-rose-400 font-bold text-xs uppercase">
                    <span>Descuento</span>
                    <span>-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 text-3xl font-black text-[#2C3E50] mt-4">
                  <span>TOTAL</span>
                  <span>${finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-10 border-t flex gap-6 bg-slate-50">
              <button onClick={handleExportPDF} className="flex-1 py-4 border-2 border-[#5D7F8E] text-[#5D7F8E] rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-white transition-all">
                <Download size={18} /> Descargar PDF
              </button>
              <button 
                onClick={() => handleSaveBudget('emitido')} 
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-[#2C3E50] text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-[#1A2632] transition-all"
              >
                <Lock size={18} /> Confirmar y Emitir Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetBuilder;
