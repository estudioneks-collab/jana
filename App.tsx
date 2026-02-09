
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
  Cloud,
  Users,
  Leaf
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import BudgetBuilder from './components/BudgetBuilder';
import Accounting from './components/Accounting';
import QuickCalculator from './components/QuickCalculator';
import Catalogue from './components/Catalogue';
import Clients from './components/Clients';
import { Material, Transaction, Product, Client } from './types';
import { getSupabase, db, getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from './lib/supabase';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'budgets' | 'accounting' | 'calculator' | 'catalogue' | 'clients' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setSbUrl(config.url);
      setSbKey(config.key);
      loadAllData();
    } else {
      setMaterials([
        { id: '1', name: 'Perlas de Rio 6mm', category: 'perlas', unit: 'unidad', costPerUnit: 15, stock: 100 },
        { id: '2', name: 'Cadena Acero Quirúrgico', category: 'cadenas', unit: 'metro', costPerUnit: 250, stock: 50 },
      ]);
    }
  }, []);

  const loadAllData = async () => {
    if (!getSupabase()) return;
    setIsLoading(true);
    try {
      const [mats, trans, prods, clis] = await Promise.all([
        db.fetch<Material>('materials'),
        db.fetch<Transaction>('transactions'),
        db.fetch<Product>('products'),
        db.fetch<Client>('clients')
      ]);
      setMaterials(mats || []);
      setTransactions(trans || []);
      setProducts(prods || []);
      setClients(clis || []);
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
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'budgets', label: 'Ventas/Presup.', icon: FileText },
    { id: 'accounting', label: 'Contabilidad', icon: TrendingUp },
    { id: 'calculator', label: 'Calculadora', icon: Calculator },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-[#F2EFED] border-t-[#5D7F8E] rounded-full animate-spin"></div>
          <p className="text-[#2C3E50]/60 font-medium text-lg">Cargando Jana Diseños...</p>
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
      case 'clients':
        return <Clients clients={clients} setClients={setClients} />;
      case 'budgets':
        return <BudgetBuilder products={products} clients={clients} setTransactions={setTransactions} />;
      case 'accounting':
        return <Accounting transactions={transactions} setTransactions={setTransactions} />;
      case 'calculator':
        return <QuickCalculator />;
      case 'settings':
        return (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold brand-font text-[#2C3E50] mb-6 text-center">Nube Supabase</h2>
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-[#2C3E50]/5 space-y-8">
              <div className="flex items-center gap-5 p-6 bg-[#F2EFED] rounded-[2rem] border border-white/50">
                {isDbConnected ? (
                  <div className="w-16 h-16 bg-[#5D7F8E]/10 text-[#5D7F8E] rounded-2xl flex items-center justify-center shadow-inner">
                    <Cloud size={32} />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-white text-slate-300 rounded-2xl flex items-center justify-center shadow-inner">
                    <CloudOff size={32} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-[#2C3E50] text-xl">{isDbConnected ? 'Conexión Segura' : 'Modo Offline'}</h3>
                  <p className="text-sm text-[#2C3E50]/60">
                    {isDbConnected 
                      ? 'Tus datos están sincronizados en tiempo real.' 
                      : 'Vincula Supabase para guardar tus diseños.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleConnectSupabase} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Supabase URL</label>
                  <input 
                    type="text" 
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-6 py-4 bg-[#F2EFED]/50 border border-transparent rounded-[1.5rem] outline-none focus:ring-2 focus:ring-[#5D7F8E] transition-all font-medium"
                    value={sbUrl}
                    onChange={e => setSbUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Anon Key</label>
                  <input 
                    type="password" 
                    placeholder="API Key"
                    className="w-full px-6 py-4 bg-[#F2EFED]/50 border border-transparent rounded-[1.5rem] outline-none focus:ring-2 focus:ring-[#5D7F8E] transition-all font-medium"
                    value={sbKey}
                    onChange={e => setSbKey(e.target.value)}
                  />
                </div>
                <div className="pt-4 flex gap-4">
                  {isDbConnected && (
                    <button 
                      type="button" 
                      onClick={handleDisconnect}
                      className="flex-1 px-6 py-4 bg-white border border-slate-100 text-[#2C3E50]/50 rounded-[1.5rem] font-bold transition-all hover:bg-slate-50"
                    >
                      Desconectar
                    </button>
                  )}
                  <button 
                    type="submit" 
                    className="flex-[2] px-6 py-4 bg-[#5D7F8E] hover:bg-[#4A6A78] text-white rounded-[1.5rem] font-bold shadow-lg shadow-[#5D7F8E]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Database size={20} />
                    {isDbConnected ? 'Actualizar Nube' : 'Vincular Proyecto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      default:
        return <Dashboard materials={materials} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen flex text-[#2C3E50] bg-[#F2EFED]">
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-[#2C3E50]/5 transition-all duration-500 flex flex-col fixed h-full z-50`}
      >
        <div className="p-8 flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-[#5D7F8E] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#5D7F8E]/20 shrink-0">
            <Leaf size={24} />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="brand-font text-3xl leading-none text-[#5D7F8E]">Jana</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2C3E50]/40 ml-1">Diseños</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-[#5D7F8E] text-white shadow-lg shadow-[#5D7F8E]/10 font-semibold' 
                : 'text-slate-400 hover:bg-[#F2EFED] hover:text-[#2C3E50]'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-slate-300'} />
              {isSidebarOpen && <span className="text-sm tracking-wide">{item.label}</span>}
            </button>
          ))}
          
          <div className="pt-6 mt-6 border-t border-[#F2EFED]">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all ${
                activeTab === 'settings' 
                ? 'bg-[#2C3E50] text-white shadow-xl' 
                : 'text-slate-400 hover:bg-[#F2EFED]'
              }`}
            >
              <Database size={22} />
              {isSidebarOpen && <span className="text-sm font-medium">Supabase</span>}
            </button>
          </div>
        </nav>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="m-6 p-4 flex items-center justify-center bg-[#F2EFED] rounded-2xl text-[#5D7F8E] hover:bg-[#5D7F8E] hover:text-white transition-all duration-300"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </aside>

      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-24'} p-10 min-h-screen`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
