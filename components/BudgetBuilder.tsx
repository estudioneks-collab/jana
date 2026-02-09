
import React, { useState } from 'react';
import { Material, BudgetItem, Transaction, Product } from '../types';
import { Plus, Trash2, FileText, Download, User, BookmarkPlus, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Props {
  materials: Material[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

const BudgetBuilder: React.FC<Props> = ({ materials, setTransactions, setProducts }) => {
  const [clientName, setClientName] = useState('');
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountDesc, setDiscountDesc] = useState('');
  
  // Catalogue Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');

  const addItem = () => {
    setItems([...items, { materialId: materials[0]?.id || '', quantity: 1, subtotal: materials[0]?.costPerUnit || 0 }]);
  };

  const updateItem = (index: number, field: keyof BudgetItem, value: any) => {
    const newItems = [...items];
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
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const rawTotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const finalTotal = rawTotal - discountAmount;

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(225, 29, 72); 
    doc.text('Jana Diseños', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Presupuesto de Bijouterie Personalizada', 105, 30, { align: 'center' });
    doc.setDrawColor(244, 244, 244);
    doc.line(20, 35, 190, 35);
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(`Cliente: ${clientName || 'General'}`, 20, 50);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 140, 50);

    const tableData = items.map(item => {
      const mat = materials.find(m => m.id === item.materialId);
      return [mat?.name || '-', item.quantity, `$${mat?.costPerUnit || 0}`, `$${item.subtotal}`];
    });

    (doc as any).autoTable({
      startY: 60,
      head: [['Material', 'Cantidad', 'Precio Unit.', 'Subtotal']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillStyle: 'rose', fillColor: [225, 29, 72] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total Bruto: $${rawTotal}`, 140, finalY);
    if (discountAmount > 0) {
      doc.setTextColor(225, 29, 72);
      doc.text(`Descuento: -$${discountAmount}`, 140, finalY + 7);
      doc.setFontSize(10);
      doc.text(`Motivo: ${discountDesc}`, 140, finalY + 12);
      doc.setFontSize(12);
    }
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Total Final: $${finalTotal}`, 140, finalY + 22);
    doc.save(`presupuesto-${clientName || 'jana'}.pdf`);
  };

  const handleRegisterSale = () => {
    if (finalTotal <= 0) return alert('El total debe ser mayor a 0');
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'ingreso',
      category: 'venta',
      description: `Venta a ${clientName || 'Cliente'} (Presupuesto)`,
      amount: finalTotal
    };
    setTransactions(prev => [newTransaction, ...prev]);
    alert('Venta registrada con éxito');
    setItems([]);
    setClientName('');
    setDiscountAmount(0);
    setDiscountDesc('');
  };

  const handleSaveToCatalogue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName) return alert('El diseño necesita un nombre');
    
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productName,
      description: productDesc,
      items: [...items],
      totalCost: rawTotal,
      suggestedPrice: rawTotal * 2, // Default markup
      dateCreated: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [newProduct, ...prev]);
    alert('Diseño guardado en el catálogo');
    setShowSaveModal(false);
    setProductName('');
    setProductDesc('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold brand-font text-slate-900">Armar Presupuesto</h2>
          <p className="text-slate-500 text-sm">Crea diseños a medida y calcula costos reales.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre del Cliente</label>
                <input 
                  placeholder="Ej: María García"
                  className="w-full bg-transparent border-none text-lg font-medium outline-none focus:ring-0"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase border-b border-slate-50 pb-2">
                <span className="w-1/2">Material</span>
                <span className="w-1/6 text-center">Cant.</span>
                <span className="w-1/4 text-right">Subtotal</span>
                <span className="w-10"></span>
              </div>
              
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 animate-in slide-in-from-left-2 duration-200">
                  <select 
                    className="w-1/2 px-3 py-2 bg-slate-50 rounded-xl border-none outline-none text-sm"
                    value={item.materialId}
                    onChange={e => updateItem(idx, 'materialId', e.target.value)}
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (${m.costPerUnit})</option>
                    ))}
                  </select>
                  <input 
                    type="number"
                    className="w-1/6 px-3 py-2 bg-slate-50 rounded-xl border-none text-center outline-none text-sm"
                    value={item.quantity}
                    onChange={e => updateItem(idx, 'quantity', e.target.value)}
                  />
                  <span className="w-1/4 text-right font-medium text-slate-700">${item.subtotal}</span>
                  <button onClick={() => removeItem(idx)} className="w-10 p-2 text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button 
                onClick={addItem}
                className="w-full py-3 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus size={18} />
                Agregar Material
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Aplicar Descuento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Monto de Descuento ($)</label>
                <input 
                  type="number"
                  className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none outline-none"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Descripción del Descuento</label>
                <input 
                  placeholder="Ej: Pago en efectivo, Mayorista..."
                  className="w-full px-4 py-2 bg-slate-50 rounded-xl border-none outline-none"
                  value={discountDesc}
                  onChange={e => setDiscountDesc(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-rose-500 p-8 rounded-3xl text-white shadow-xl shadow-rose-200 sticky top-8">
            <h3 className="text-lg font-semibold mb-6 opacity-90">Resumen de Cuenta</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Subtotal</span>
                <span>${rawTotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">Descuento ({discountDesc || 'Especial'})</span>
                  <span className="text-rose-200">-${discountAmount}</span>
                </div>
              )}
              <div className="pt-4 border-t border-rose-400 flex justify-between items-center">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-3xl">${finalTotal}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowSaveModal(true)}
                disabled={items.length === 0}
                className="w-full py-3 bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <BookmarkPlus size={20} />
                Guardar en Catálogo
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={items.length === 0}
                className="w-full py-3 bg-white text-rose-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors disabled:opacity-50"
              >
                <Download size={20} />
                Descargar PDF
              </button>
              <button 
                onClick={handleRegisterSale}
                disabled={items.length === 0}
                className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-rose-400 hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                <FileText size={20} />
                Registrar Venta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Catalogue Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold brand-font text-slate-900">Guardar Diseño</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveToCatalogue} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Diseño</label>
                <input 
                  required
                  placeholder="Ej: Collar de Gala Azul"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea 
                  rows={3}
                  placeholder="Detalles sobre el estilo, longitud, materiales específicos..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                  value={productDesc}
                  onChange={e => setProductDesc(e.target.value)}
                />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Costo de Materiales</p>
                  <p className="text-xl font-bold text-slate-700">${rawTotal}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-rose-400 uppercase font-bold">PVP Sugerido (x2)</p>
                  <p className="text-xl font-bold text-rose-600">${rawTotal * 2}</p>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowSaveModal(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium shadow-lg shadow-rose-200">Guardar en Catálogo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetBuilder;
