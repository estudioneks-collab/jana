
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
  Users,
  Leaf,
  ShieldCheck,
  Camera,
  Trash2,
  Image as ImageIcon,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import BudgetBuilder from './components/BudgetBuilder';
import Accounting from './components/Accounting';
import QuickCalculator from './components/QuickCalculator';
import Catalogue from './components/Catalogue';
import Clients from './components/Clients';
import MarketView from './components/MarketView';
import { Material, Transaction, Product, Client, Budget } from './types';
import { getSupabase, db } from './lib/supabase';

const App: React.FC = () => {
  // Detección de modo Tienda vs Modo Manager
  const isShopMode = new URLSearchParams(window.location.search).get('mode') === 'shop';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'budgets' | 'accounting' | 'calculator' | 'catalogue' | 'clients' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [logo, setLogo] = useState<string | null>(localStorage.getItem('jana_logo'));

  useEffect(() => {
    if (!isShopMode) {
      loadAllData();
    }
  }, [isShopMode]);

  const loadAllData = async () => {
    setIsLoading(true);
    setDbErrorMessage(null);
    try {
      const client = getSupabase();
      if (!client) {
        setIsDbConnected(false);
        setIsLoading(false);
        return;
      }

      const [mats, trans, prods, clis, buds] = await Promise.all([
        db.fetch<Material>('materials'),
        db.fetch<Transaction>('transactions'),
        db.fetch<Product>('products'),
        db.fetch<Client>('clients'),
        db.fetch<Budget>('budgets')
      ]);

      setMaterials(mats || []);
      setTransactions(trans || []);
      setProducts(prods || []);
      setClients(clis || []);
      setBudgets(buds || []);
      setIsDbConnected(true);
    } catch (err: any) {
      console.error("Error cargando datos de Jana:", err);
      setIsDbConnected(false);
      setDbErrorMessage(err.message || "Error al conectar con la base de datos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        localStorage.setItem('jana_logo', base64);
      };
      reader.readAsDataURL(file);
    }
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

  // Si estamos en modo tienda, renderizamos solo la tienda
  if (isShopMode) {
    return <MarketView />;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-[#F2EFED] border-t-[#5D7F8E] rounded-full animate-spin"></div>
          <p className="text-[#2C3E50]/60 font-medium text-lg italic brand-font">Sincronizando Jana Diseños...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard materials={materials} transactions={transactions} />;
      case 'inventory': return <Inventory materials={materials} setMaterials={setMaterials} />;
      case 'catalogue': return <Catalogue products={products} materials={materials} setProducts={setProducts} />;
      case 'clients': return <Clients clients={clients} setClients={setClients} />;
      case 'budgets': return <BudgetBuilder products={products} clients={clients} budgets={budgets} setBudgets={setBudgets} setTransactions={setTransactions} logo={logo} />;
      case 'accounting': return <Accounting transactions={transactions} setTransactions={setTransactions} />;
      case 'calculator': return <QuickCalculator />;
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="text-center">
              <h2 className="text-4xl font-bold brand-font text-[#2C3E50] mb-2">Configuración</h2>
              <p className="text-[#5D7F8E]">Identidad y salud del sistema Jana.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h3 className="text-xl font-bold mb-6 text-[#2C3E50] flex items-center gap-3"><ImageIcon size={24} className="text-[#5D7F8E]" /> Logo de Marca</h3>
                <div className="relative aspect-video bg-[#F2EFED] rounded-3xl border-2 border-dashed border-[#5D7F8E]/20 overflow-hidden flex items-center justify-center group">
                  {logo ? (
                    <>
                      <img src={logo} alt="Logo" className="max-h-full p-4" />
                      <button onClick={() => {setLogo(null); localStorage.removeItem('jana_logo');}} className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-rose-500 rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3"><Camera size={40} className="text-[#5D7F8E]/40" /><span className="text-sm font-bold text-[#5D7F8E]">Subir Logo</span><input type="file" className="hidden" onChange={handleLogoUpload} /></label>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><Database size={24} className="text-[#5D7F8E]" /> Base de Datos</h3>
                <div className="p-5 bg-[#F2EFED] rounded-2xl flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDbConnected ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                    {isDbConnected ? <ShieldCheck size={24} /> : <CloudOff size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C3E50] text-sm">{isDbConnected ? 'En Línea' : 'Error de Conexión'}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{isDbConnected ? 'Supabase Conectado' : 'Revisa tu clave anon'}</p>
                  </div>
                </div>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#5D7F8E] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#4A6A78] transition-all"><RefreshCw size={16} /> Reintentar Conexión</button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex text-[#2C3E50] bg-[#F2EFED]">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-[#2C3E50]/5 transition-all duration-500 flex flex-col fixed h-full z-50`}>
        <div className="p-8 flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-[#5D7F8E] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#5D7F8E]/20 shrink-0">
            <Leaf size={24} />
          </div>
          {isSidebarOpen && (
            <div>
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
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 ${activeTab === item.id ? 'bg-[#5D7F8E] text-white shadow-lg' : 'text-slate-400 hover:bg-[#F2EFED] hover:text-[#2C3E50]'}`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-slate-300'} />
              {isSidebarOpen && <span className="text-sm tracking-wide">{item.label}</span>}
            </button>
          ))}
          <div className="pt-6 mt-6 border-t border-[#F2EFED]">
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all ${activeTab === 'settings' ? 'bg-[#2C3E50] text-white shadow-xl' : 'text-slate-400 hover:bg-[#F2EFED]'}`}><Settings size={22} />{isSidebarOpen && <span className="text-sm font-medium">Ajustes</span>}</button>
          </div>
        </nav>

        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="m-6 p-4 flex items-center justify-center bg-[#F2EFED] rounded-2xl text-[#5D7F8E] hover:bg-[#5D7F8E] hover:text-white transition-all"><Menu size={20} /></button>
      </aside>

      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-24'} p-10 min-h-screen`}>
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
