
import React, { useState, useMemo } from 'react';
import { Product, BudgetItem, Transaction, Client } from '../types';
// Added Leaf to the imported icons from 'lucide-react'
import { Plus, Trash2, FileText, Download, User, ShoppingBag, X, Search, ChevronDown, Check, Leaf } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  products: Product[];
  clients: Client[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const BudgetBuilder: React.FC<Props> = ({ products, clients, setTransactions }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [utilityPercentage, setUtilityPercentage] = useState(100); // 100% de utilidad por defecto (doble del costo)
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountDesc, setDiscountDesc] = useState('');

  // Filtrar clientes por búsqueda
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    return clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      (c.instagram && c.instagram.toLowerCase().includes(clientSearch.toLowerCase()))
    );
  }, [clients, clientSearch]);

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

  // Cálculos
  const rawCostTotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const utilityAmount = (rawCostTotal * utilityPercentage) / 100;
  const subtotalWithUtility = rawCostTotal + utilityAmount;
  const finalTotal = subtotalWithUtility - discountAmount;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header Estilizado Jana
    doc.setFillColor(44, 62, 80); // Navy
    doc.rect(0, 0, 210, 40, 'F');
    
    // Fallback to helvetica if playfair is not loaded in jsPDF context
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text('Jana Diseños', 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255, 0.6);
    doc.text('PRESUPUESTO DE ALTA JOYERÍA ARTESANAL', 105, 33, { align: 'center' });

    // Información del Cliente
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DEL CLIENTE', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${selectedClient?.name || 'Venta General'}`, 20, 62);
    if (selectedClient?.instagram) doc.text(`Instagram: @${selectedClient.instagram}`, 20, 68);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 62);

    const tableData = items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return [
        prod?.name || '-', 
        item.quantity, 
        `$${item.unitCost.toLocaleString()}`, 
        `$${item.subtotal.toLocaleString()}`
      ];
    });

    // Use autoTable function directly to avoid prototype issues
    autoTable(doc, {
      startY: 75,
      head: [['Diseño Seleccionado', 'Cantidad', 'Costo Unit.', 'Subtotal Costo']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [93, 127, 142], textColor: [255, 255, 255] }, // Teal
      styles: { fontSize: 10 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Totales
    doc.setFontSize(11);
    doc.text(`Costo de Producción: $${rawCostTotal.toLocaleString()}`, 130, finalY);
    doc.text(`Utilidad aplicada (${utilityPercentage}%): $${utilityAmount.toLocaleString()}`, 130, finalY + 7);
    
    if (discountAmount > 0) {
      doc.setTextColor(231, 76, 60);
      doc.text(`Descuento especial: -$${discountAmount.toLocaleString()}`, 130, finalY + 14);
      doc.setTextColor(44, 62, 80);
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL FINAL: $${finalTotal.toLocaleString()}`, 130, finalY + 25);
    
    doc.save(`JanaPresupuesto-${selectedClient?.name || 'Cliente'}.pdf`);
  };

  const handleRegisterSale = () => {
    if (finalTotal <= 0) return alert('El total debe ser mayor a 0');
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'ingreso',
      category: 'venta',
      description: `Venta a ${selectedClient?.name || 'Cliente'} (Diseños Catálogo)`,
      amount: finalTotal
    };
    setTransactions(prev => [newTransaction, ...prev]);
    alert('¡Venta registrada exitosamente!');
    setItems([]);
    setSelectedClient(null);
    setDiscountAmount(0);
    setUtilityPercentage(100);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h2 className="text-5xl font-bold brand-font text-[#2C3E50] italic leading-tight">Gestión de Ventas</h2>
        <p className="text-[#5D7F8E] font-medium tracking-[0.1em] uppercase text-xs mt-2">Crea presupuestos usando tus diseños exclusivos</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {/* Selector de Cliente Inteligente */}
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
                    <div 
                      className="px-6 py-4 hover:bg-[#F2EFED] cursor-pointer flex items-center justify-between group"
                      onClick={() => { setSelectedClient(null); setIsClientDropdownOpen(false); }}
                    >
                      <span className="text-sm font-medium text-slate-400">Venta General (Sin registrar)</span>
                    </div>
                    {filteredClients.map(client => (
                      <div 
                        key={client.id}
                        className="px-6 py-4 hover:bg-[#F2EFED] cursor-pointer flex items-center justify-between group"
                        onClick={() => { setSelectedClient(client); setIsClientDropdownOpen(false); }}
                      >
                        <div>
                          <p className="font-bold text-[#2C3E50]">{client.name}</p>
                          {client.instagram && <p className="text-[10px] text-[#5D7F8E]">@{client.instagram}</p>}
                        </div>
                        {selectedClient?.id === client.id && <Check size={18} className="text-[#5D7F8E]" />}
                      </div>
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="p-8 text-center text-slate-300 italic text-sm">No hay resultados</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Listado de Productos en Presupuesto */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F2EFED] pb-6">
              <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-[0.2em]">Piezas del Presupuesto</h3>
              <button 
                onClick={addItem}
                className="bg-[#F2EFED] text-[#5D7F8E] hover:bg-[#5D7F8E] hover:text-white px-5 py-2.5 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
              >
                <Plus size={16} />
                Añadir Diseño
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 bg-[#F2EFED]/30 p-5 rounded-3xl border border-white animate-in slide-in-from-left-4 duration-300">
                  <div className="flex-1">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-2">Seleccionar Diseño</label>
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
                  <div className="w-24">
                    <label className="block text-[8px] font-bold text-slate-400 uppercase mb-2 text-center">Cantidad</label>
                    <input 
                      type="number"
                      className="w-full bg-white border-none rounded-xl px-2 py-2.5 text-center font-bold text-[#2C3E50] outline-none shadow-sm"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="w-28 text-right">
                    <p className="text-[8px] font-bold text-[#5D7F8E] uppercase mb-2">Subtotal Costo</p>
                    <p className="text-lg font-bold text-[#2C3E50]">${item.subtotal.toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeItem(idx)} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-16 text-center">
                  <ShoppingBag size={48} className="mx-auto text-[#F2EFED] mb-4" />
                  <p className="text-slate-300 italic text-sm">El presupuesto está vacío. Añade una pieza del catálogo.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sección de Descuento */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50">
            <h3 className="text-xs font-bold text-[#2C3E50] uppercase tracking-[0.2em] mb-6">Ajuste de Precio Final</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Monto de Descuento ($)</label>
                <input 
                  type="number"
                  className="w-full px-6 py-4 bg-[#F2EFED]/50 border-none rounded-[1.5rem] outline-none font-bold text-[#2C3E50] shadow-inner"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Motivo del Ajuste</label>
                <input 
                  placeholder="Ej: Promo Lanzamiento / Amiga"
                  className="w-full px-6 py-4 bg-[#F2EFED]/50 border-none rounded-[1.5rem] outline-none text-sm font-medium shadow-inner"
                  value={discountDesc}
                  onChange={e => setDiscountDesc(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral de Totales con Utilidad Manual */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#2C3E50] p-10 rounded-[3rem] text-white shadow-2xl shadow-[#2C3E50]/20 sticky top-10 overflow-hidden">
            {/* Adorno visual */}
            <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
              <Leaf size={200} strokeWidth={1} />
            </div>

            <h3 className="text-xl font-bold brand-font italic mb-10 text-white/90">Resumen Financiero</h3>
            
            <div className="space-y-8 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/40">
                  <span>Costo de Producción</span>
                  <span>${rawCostTotal.toLocaleString()}</span>
                </div>
                
                {/* Campo de Utilidad Manual */}
                <div className="pt-4 pb-2 border-t border-white/10">
                  <label className="block text-[10px] font-bold text-[#5D7F8E] uppercase tracking-widest mb-3">Margen de Utilidad Manual (%)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="0"
                      max="400"
                      step="5"
                      className="flex-1 accent-[#5D7F8E]"
                      value={utilityPercentage}
                      onChange={e => setUtilityPercentage(Number(e.target.value))}
                    />
                    <span className="text-2xl font-black min-w-[70px] text-right">{utilityPercentage}%</span>
                  </div>
                  <p className="text-[9px] text-white/30 mt-2 italic">Ganancia estimada: ${utilityAmount.toLocaleString()}</p>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold text-rose-300 py-2">
                    <span className="opacity-60">Ajuste / Descuento</span>
                    <span>-${discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-white/20 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#5D7F8E]">Precio de Venta Jana</span>
                <span className="text-6xl font-black tracking-tight">${finalTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-4 mt-12 relative z-10">
              <button 
                onClick={handleExportPDF}
                disabled={items.length === 0}
                className="w-full py-5 bg-[#5D7F8E] text-white rounded-[1.8rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#4A6A78] transition-all shadow-xl shadow-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                Descargar Presupuesto
              </button>
              <button 
                onClick={handleRegisterSale}
                disabled={items.length === 0}
                className="w-full py-5 bg-white text-[#2C3E50] rounded-[1.8rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#F2EFED] transition-all shadow-xl shadow-black/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FileText size={20} />
                Confirmar Venta
              </button>
            </div>
          </div>
          
          <div className="bg-[#5D7F8E]/10 p-8 rounded-[2rem] border border-[#5D7F8E]/20">
            <h4 className="text-xs font-bold text-[#5D7F8E] uppercase tracking-widest mb-3">Nota para Jana</h4>
            <p className="text-xs text-[#2C3E50]/70 italic leading-relaxed">
              Recuerda que el margen del 100% cubre el costo y te deja el mismo valor como ganancia neta. Para piezas especiales de autor, considera subir a 200% o 300%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetBuilder;
