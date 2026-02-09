
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Calculator, 
  TrendingUp, 
  Menu, 
  X,
  Plus,
  Settings,
  BookOpen,
  Database,
  CloudOff,
  Cloud
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import BudgetBuilder from './components/BudgetBuilder';
import Accounting from './components/Accounting';
import QuickCalculator from './components/QuickCalculator';
import Catalogue from './components/Catalogue';
import { Material, Transaction, Budget, Product } from './types';
import { getSupabase, db, getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from './lib/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'budgets' | 'accounting' | 'calculator' | 'catalogue' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // States
  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Supabase Credentials State
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');

  // Initial data load
  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setSbUrl(config.url);
      setSbKey(config.key);
      loadAllData();
    } else {
      // Load fallback mock data if no config
      setMaterials([
        { id: '1', name: 'Perlas de Rio 6mm', category: 'perlas', unit: 'unidad', costPerUnit: 15, stock: 100 },
        { id: '2', name: 'Cadena Acero Quirúrgico', category: 'cadenas', unit: 'metro', costPerUnit: 250, stock: 50 },
        { id: '3', name: 'Dije Corazón Oro', category: 'dijes', unit: 'unidad', costPerUnit: 120, stock: 20 },
      ]);
    }
  }, []);

  const loadAllData = async () => {
    if (!getSupabase()) return;
    setIsLoading(true);
    try {
      const [mats, trans, prods] = await Promise.all([
        db.fetch<Material>('materials'),
        db.fetch<Transaction>('transactions'),
        db.fetch<Product>('products')
      ]);
      setMaterials(mats);
      setTransactions(trans);
      setProducts(prods);
      setIsDbConnected(true);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setIsDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sbUrl || !sbKey) return;
    saveSupabaseConfig({ url: sbUrl, key: sbKey });
    loadAllData();
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setIsDbConnected(false);
    setSbUrl('');
    setSbKey('');
  };

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'inventory', label: 'Materiales', icon: Package },
    { id: 'catalogue', label: 'Catálogo', icon: BookOpen },
    { id: 'budgets', label: 'Presupuestos', icon: FileText },
    { id: 'accounting', label: 'Contabilidad', icon: TrendingUp },
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Sincronizando con Supabase...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard materials={materials} transactions={transactions} />;
      case 'inventory':
        return <Inventory materials={materials} setMaterials={setMaterials} />;
      case 'catalogue':
        return <Catalogue products={products} materials={materials} setProducts={setProducts} />;
      case 'budgets':
        return <BudgetBuilder materials={materials} setTransactions={setTransactions} setProducts={setProducts} />;
      case 'accounting':
        return <Accounting transactions={transactions} setTransactions={setTransactions} />;
      case 'calculator':
        return <QuickCalculator />;
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold brand-font text-slate-900 mb-6">Configuración de Supabase</h2>
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                {isDbConnected ? (
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <Cloud size={24} />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center">
                    <CloudOff size={24} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900">{isDbConnected ? 'Conectado a la nube' : 'Modo local (Sin conexión)'}</h3>
                  <p className="text-sm text-slate-500">
                    {isDbConnected 
                      ? 'Tus datos se están guardando de forma segura en Supabase.' 
                      : 'Configura las credenciales para sincronizar tus datos.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConnectSupabase} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Supabase URL</label>
                  <input 
                    type="text" 
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                    value={sbUrl}
                    onChange={e => setSbUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Anon Key</label>
                  <input 
                    type="password" 
                    placeholder="eyJhbG..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                    value={sbKey}
                    onChange={e => setSbKey(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  {isDbConnected && (
                    <button 
                      type="button" 
                      onClick={handleDisconnect}
                      className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold"
                    >
                      Desconectar
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="flex-[2] px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                  >
                    <Database size={20} />
                    {isDbConnected ? 'Actualizar Conexión' : 'Conectar a Supabase'}
                  </button>
                </div>
              </form>

              <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-700 leading-relaxed border border-amber-100">
                <strong>Importante:</strong> Asegúrate de haber creado las tablas <code>materials</code>, <code>transactions</code> y <code>products</code> en tu proyecto de Supabase con los campos definidos en los tipos de la aplicación.
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard materials={materials} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen flex text-slate-800">
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-slate-50">
          <div className="w-8 h-8 bg-rose-400 rounded-lg flex items-center justify-center text-white shrink-0">
            <Settings size={20} />
          </div>
          {isSidebarOpen && <h1 className="brand-font text-xl font-bold text-rose-600 truncate">Jana Diseños</h1>}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-rose-50 text-rose-600 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-rose-600' : 'text-slate-400'} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-50">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                activeTab === 'settings' 
                ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Database size={22} />
              {isSidebarOpen && <span className="font-medium">Supabase</span>}
            </button>
          </div>
        </nav>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-4 flex items-center justify-center border-t border-slate-100 hover:bg-slate-50 text-slate-400"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-8 min-h-screen`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
