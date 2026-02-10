
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Material, Transaction } from '../types';
import { DollarSign, Package, TrendingUp, AlertCircle, Leaf } from 'lucide-react';

interface Props {
  materials: Material[];
  transactions: Transaction[];
}

const Dashboard: React.FC<Props> = ({ materials, transactions }) => {
  const totalIncome = transactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const lowStock = materials.filter(m => m.stock < 10).length;

  const chartData = [
    { name: 'Ingresos', amount: totalIncome, color: '#5D7F8E' },
    { name: 'Gastos', amount: totalExpenses, color: '#2C3E50' },
    { name: 'Ganancia', amount: netProfit, color: '#A9C2CD' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header Estilo Captura Actualizado - Tamaño Reducido */}
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black brand-font text-[#2C3E50] leading-none tracking-tighter uppercase">Hola, Jana</h2>
          <p className="text-[#5D7F8E]/70 font-medium tracking-wide mt-2 text-base">Este es el pulso de tu emprendimiento hoy.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-white/50 self-start">
          <div className="bg-[#F2EFED] p-1.5 rounded-lg text-[#2C3E50]">
            <Leaf size={16} />
          </div>
          <span className="text-[9px] font-bold text-[#2C3E50] uppercase tracking-[0.2em]">Estado: Activo</span>
        </div>
      </header>

      {/* Grid de Stats Estilo Captura */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="BALANCE NETO" 
          value={`$${netProfit.toLocaleString()}`} 
          icon={<DollarSign size={24} className="text-[#5D7F8E]" />} 
          trend="+15.2%" 
          showUnderline
        />
        <StatCard 
          title="MATERIALES" 
          value={materials.length.toString()} 
          icon={<Package size={24} className="text-[#2C3E50]" />} 
          trend="STOCK OK" 
        />
        <StatCard 
          title="VENTAS TOTALES" 
          value={`$${totalIncome.toLocaleString()}`} 
          icon={<TrendingUp size={24} className="text-[#5D7F8E]" />} 
          trend="+12 HOY" 
        />
        <StatCard 
          title="STOCK BAJO" 
          value={lowStock.toString()} 
          icon={<AlertCircle size={24} className="text-[#2C3E50]" />} 
          trend={`${lowStock > 0 ? 'REPONER' : 'COMPLETO'}`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-white shadow-xl shadow-slate-200/40">
          <h3 className="text-xl font-bold mb-10 flex items-center gap-3 text-[#2C3E50] tracking-tight">
            <TrendingUp size={24} className="text-[#5D7F8E]" />
            Flujo Financiero
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFED" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#F2EFED', opacity: 0.4}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                />
                <Bar dataKey="amount" radius={[14, 14, 0, 0]} barSize={64}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#2C3E50] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-[#2C3E50]/20 flex flex-col">
          <h3 className="text-xs font-bold mb-8 opacity-40 uppercase tracking-[0.4em] text-center">Actividad Reciente</h3>
          <div className="space-y-6 flex-1">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-5 p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all border border-white/5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                  t.type === 'ingreso' ? 'bg-[#5D7F8E] text-white' : 'bg-white/10 text-white/60'
                }`}>
                  <span className="text-xl font-bold">{t.type === 'ingreso' ? '↑' : '↓'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate uppercase tracking-widest">{t.description}</p>
                  <p className="text-[10px] text-white/30 font-bold uppercase mt-1">{t.date}</p>
                </div>
                <p className={`font-black text-lg tracking-tighter ${t.type === 'ingreso' ? 'text-[#5D7F8E]' : 'text-white/80'}`}>
                  ${t.amount}
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4 mt-10">
                <AlertCircle size={64} strokeWidth={1} />
                <p className="text-[10px] font-bold uppercase tracking-[0.5em]">Sin Datos</p>
              </div>
            )}
          </div>
          <button className="w-full mt-10 py-5 bg-white/5 hover:bg-white/10 rounded-[1.8rem] text-[10px] font-bold uppercase tracking-[0.3em] transition-all border border-white/10">Ver Historial</button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string, icon: React.ReactNode, trend: string, showUnderline?: boolean}> = ({
  title, value, icon, trend, showUnderline
}) => (
  <div className="bg-white p-8 rounded-[3rem] border border-white shadow-xl shadow-slate-200/30 transition-all hover:scale-[1.03] duration-500 relative group overflow-hidden">
    <div className="flex items-start justify-between mb-8">
      <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-[#F2EFED] text-[#2C3E50] shadow-inner transition-colors group-hover:bg-[#5D7F8E] group-hover:text-white duration-500">
        {icon}
      </div>
      <span className="text-[9px] font-black px-4 py-2 bg-slate-50 text-slate-400 rounded-xl uppercase tracking-widest border border-slate-100">
        {trend}
      </span>
    </div>
    
    <div className="space-y-2">
      <div className="inline-block relative">
        <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.25em] mb-1 pl-1">{title}</h4>
        {showUnderline && (
          <div className="absolute -bottom-1 left-0 w-full h-[3px] bg-[#5D7F8E]/40 rounded-full" />
        )}
      </div>
      <p className="text-5xl font-black text-[#2C3E50] tracking-tighter">{value}</p>
    </div>

    {/* Sutil efecto de fondo */}
    <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
       <Leaf size={150} fill="currentColor" className="text-[#2C3E50]" />
    </div>
  </div>
);

export default Dashboard;
