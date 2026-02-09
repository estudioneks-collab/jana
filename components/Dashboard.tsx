
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Material, Transaction } from '../types';
import { DollarSign, Package, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  materials: Material[];
  transactions: Transaction[];
}

const Dashboard: React.FC<Props> = ({ materials, transactions }) => {
  const totalIncome = transactions.filter(t => t.type === 'ingreso').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'egreso').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const lowStock = materials.filter(m => m.stock < 10).length;

  // Process data for chart (Grouped by month/category for demo)
  const chartData = [
    { name: 'Ingresos', amount: totalIncome, color: '#10b981' },
    { name: 'Gastos', amount: totalExpenses, color: '#f43f5e' },
    { name: 'Ganancia', amount: netProfit, color: '#6366f1' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 brand-font">Bienvenida, Jana</h2>
        <p className="text-slate-500">Aquí tienes un resumen de tu emprendimiento hoy.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Balance Total" 
          value={`$${netProfit.toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          trend="+12%" 
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          title="Materiales" 
          value={materials.length.toString()} 
          icon={<Package size={24} />} 
          trend="Stock ok" 
          color="bg-rose-50 text-rose-600"
        />
        <StatCard 
          title="Ventas del Mes" 
          value={`$${totalIncome.toLocaleString()}`} 
          icon={<TrendingUp size={24} />} 
          trend="+5 hoy" 
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          title="Stock Crítico" 
          value={lowStock.toString()} 
          icon={<AlertCircle size={24} />} 
          trend={`${lowStock > 0 ? 'Reponer ya' : 'Todo bien'}`} 
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-rose-500" />
            Rendimiento Financiero
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Actividad Reciente</h3>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  t.type === 'ingreso' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  {t.type === 'ingreso' ? '+' : '-'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{t.description}</p>
                  <p className="text-sm text-slate-400">{t.date}</p>
                </div>
                <p className={`font-bold ${t.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'ingreso' ? '' : '-'}${t.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: string, icon: React.ReactNode, trend: string, color: string}> = ({
  title, value, icon, trend, color
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
        {trend}
      </span>
    </div>
    <h4 className="text-slate-500 text-sm font-medium">{title}</h4>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

export default Dashboard;
