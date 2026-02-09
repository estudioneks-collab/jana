
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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-bold brand-font text-[#2C3E50] italic">Hola, Jana</h2>
          <p className="text-[#5D7F8E] font-medium tracking-wide mt-1">Este es el pulso de tu emprendimiento hoy.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-white">
          <Leaf size={20} className="text-[#5D7F8E]" />
          <span className="text-xs font-bold text-[#2C3E50] uppercase tracking-widest">Estado: Activo</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Balance Neto" 
          value={`$${netProfit.toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          trend="+15.2%" 
          color="bg-[#F2EFED] text-[#5D7F8E]"
        />
        <StatCard 
          title="Materiales" 
          value={materials.length.toString()} 
          icon={<Package size={24} />} 
          trend="Stock ok" 
          color="bg-[#F2EFED] text-[#2C3E50]"
        />
        <StatCard 
          title="Ventas Totales" 
          value={`$${totalIncome.toLocaleString()}`} 
          icon={<TrendingUp size={24} />} 
          trend="+12 hoy" 
          color="bg-[#5D7F8E]/10 text-[#5D7F8E]"
        />
        <StatCard 
          title="Stock Bajo" 
          value={lowStock.toString()} 
          icon={<AlertCircle size={24} />} 
          trend={`${lowStock > 0 ? 'Reponer' : 'Completo'}`} 
          color="bg-[#2C3E50]/10 text-[#2C3E50]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-white shadow-xl shadow-slate-200/50">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-[#2C3E50]">
            <TrendingUp size={24} className="text-[#5D7F8E]" />
            Flujo Financiero
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2EFED" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F2EFED', opacity: 0.4}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                />
                <Bar dataKey="amount" radius={[12, 12, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#2C3E50] p-10 rounded-[3rem] text-white shadow-2xl shadow-[#2C3E50]/20 flex flex-col">
          <h3 className="text-xl font-bold mb-8 opacity-80 uppercase tracking-widest text-center">Actividad Reciente</h3>
          <div className="space-y-6 flex-1">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-5 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  t.type === 'ingreso' ? 'bg-[#5D7F8E] text-white' : 'bg-white/10 text-white/60'
                }`}>
                  <span className="text-xl font-bold">{t.type === 'ingreso' ? '↑' : '↓'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate uppercase tracking-wide">{t.description}</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">{t.date}</p>
                </div>
                <p className={`font-black text-lg ${t.type === 'ingreso' ? 'text-[#5D7F8E]' : 'text-white/80'}`}>
                  ${t.amount}
                </p>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                <AlertCircle size={48} />
                <p className="text-xs font-bold uppercase tracking-[0.3em]">Sin Datos</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all">Ver Más Movimientos</button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string, icon: React.ReactNode, trend: string, color: string}> = ({
  title, value, icon, trend, color
}) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-[#2C3E50]/5 transition-all hover:scale-105 duration-300">
    <div className="flex items-start justify-between mb-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${color}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold px-3 py-1 bg-slate-100 text-[#2C3E50]/60 rounded-full uppercase tracking-tighter">
        {trend}
      </span>
    </div>
    <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{title}</h4>
    <p className="text-3xl font-black text-[#2C3E50]">{value}</p>
  </div>
);

export default Dashboard;
