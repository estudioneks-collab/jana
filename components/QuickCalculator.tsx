
import React, { useState } from 'react';
import { Calculator, Percent, ChevronRight, RefreshCw } from 'lucide-react';

const QuickCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number | string>('');
  const [history, setHistory] = useState<string[]>([]);

  const presets = [
    { label: '-10%', value: -0.1, color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { label: '-15% Efectivo', value: -0.15, color: 'bg-rose-50 text-rose-600 border-rose-100' },
    { label: '+20% Tarjeta', value: 0.2, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: '+30% Reseller', value: 0.3, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: '+50% Minorista', value: 0.5, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: '+100% Sugerido', value: 1.0, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  ];

  const applyModifier = (modifier: number, label: string) => {
    const base = Number(amount);
    if (isNaN(base) || base === 0) return;
    
    const result = base * (1 + modifier);
    const diff = result - base;
    const sign = diff >= 0 ? '+' : '';
    
    setAmount(result.toFixed(2));
    setHistory([`${base} ${label} (${sign}${diff.toFixed(2)}) = ${result.toFixed(2)}`, ...history.slice(0, 9)]);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold brand-font text-slate-900">Calculadora Rápida</h2>
        <p className="text-slate-500">Ajusta precios en segundos para tus clientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Monto Base / Resultado</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-light text-slate-300">$</span>
              <input 
                type="number"
                className="w-full bg-slate-50 border-none rounded-3xl pl-12 pr-8 py-6 text-4xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-200"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <button 
                onClick={() => setAmount('')}
                className="absolute right-6 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-500 transition-colors"
              >
                <RefreshCw size={24} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {presets.map(p => (
              <button 
                key={p.label}
                onClick={() => applyModifier(p.value, p.label)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95 ${p.color}`}
              >
                <Percent size={16} />
                <span className="text-sm font-bold">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl min-h-[400px]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Calculator size={20} className="text-rose-400" />
              Historial de Cálculos
            </h3>
            <div className="space-y-4">
              {history.length > 0 ? history.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-300 animate-in slide-in-from-right-2 duration-300">
                  <ChevronRight size={16} className="mt-1 text-slate-600 shrink-0" />
                  <p className="text-sm font-mono">{h}</p>
                </div>
              )) : (
                <p className="text-slate-500 text-sm italic">Usa los botones para ver el historial...</p>
              )}
            </div>
          </div>

          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
            <p className="text-xs text-rose-700/70 font-medium">Tip Profesional:</p>
            <p className="text-sm text-rose-900 mt-1">El <strong>+100% Sugerido</strong> es ideal para cubrir materiales y mano de obra con un margen de ganancia estándar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickCalculator;
