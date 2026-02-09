
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
  Leaf,
  ShieldCheck,
  Camera,
  Trash2,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import BudgetBuilder from './components/BudgetBuilder';
import Accounting from './components/Accounting';
import QuickCalculator from './components/QuickCalculator';
import Catalogue from './components/Catalogue';
import Clients from './components/Clients';
import { Material, Transaction, Product, Client, Budget } from './types';
import { getSupabase, db } from './lib/supabase';

const App: React.FC = () => {
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
    loadAllData();
  }, []);

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

      // Quitamos los .catch() individuales para que el try/catch principal capture si falta alguna tabla
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
      setDbErrorMessage(err.message || "Error desconocido al conectar con la base de datos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    const result = await db.testConnection();
    alert(result.message);
    if (result.success) loadAllData();
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

  const removeLogo = () => {
    setLogo(null);
    localStorage.removeItem('jana_logo');
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
          <p className="text-[#2C3E50]/60 font-medium text-lg">Sincronizando Jana Diseños...</p>
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
        return <BudgetBuilder 
          products={products} 
          clients={clients} 
          budgets={budgets}
          setBudgets={setBudgets}
          setTransactions={setTransactions} 
          logo={logo}
        />;
      case 'accounting':
        return <Accounting transactions={transactions} setTransactions={setTransactions} />;
      case 'calculator':
        return <QuickCalculator />;
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="text-center">
              <h2 className="text-4xl font-bold brand-font text-[#2C3E50] mb-2">Ajustes de Jana</h2>
              <p className="text-[#5D7F8E]">Configura la identidad visual y revisa el sistema.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-[#2C3E50]/5">
                <h3 className="text-xl font-bold mb-6 text-[#2C3E50] flex items-center gap-3">
                  <ImageIcon size={24} className="text-[#5D7F8E]" />
                  Identidad Visual
                </h3>
                <div className="space-y-6">
                  <div className="relative aspect-video bg-[#F2EFED] rounded-3xl border-2 border-dashed border-[#5D7F8E]/20 overflow-hidden flex items-center justify-center group">
                    {logo ? (
                      <>
                        <img src={logo} alt="Logo Jana" className="max-h-full max-w-full object-contain p-4" />
                        <button 
                          onClick={removeLogo}
                          className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-rose-500 rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-3 p-10 text-center">
                        <Camera size={40} className="text-[#5D7F8E]/40" />
                        <span className="text-sm font-bold text-[#5D7F8E]">Subir Logo de la Marca</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold leading-relaxed">
                    Este logo se utilizará en el encabezado de la aplicación y en los presupuestos PDF generados.
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-[#2C3E50]/5 space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3">
                  <Database size={24} className="text-[#5D7F8E]" />
                  Estado del Sistema
                </h3>
                
                <div className="flex items-center gap-4 p-5 bg-[#F2EFED] rounded-2xl">
                  {isDbConnected ? (
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                      <ShieldCheck size={24} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-rose-50 text-rose-300 rounded-xl flex items-center justify-center">
                      <CloudOff size={24} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[#2C3E50] text-sm">{isDbConnected ? 'Conexión Protegida' : 'Servidor Desconectado'}</h4>
                    <p className="text-[10px] text-[#2C3E50]/60 uppercase tracking-widest font-bold">{isDbConnected ? 'Nube Activa' : 'Revisa las tablas'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleTestConnection}
                    className="w-full py-3 bg-[#5D7F8E] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#4A6A78] transition-all"
                  >
                    <RefreshCw size={16} />
                    Probar Conexión Ahora
                  </button>
                  {dbErrorMessage && (
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase leading-relaxed">
                      Error detectado: {dbErrorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold pt-10 border-t border-[#F2EFED]">
              Jana Diseños - Software de Gestión Exclusivo
            </p>
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
          {logo ? (
            <img src={logo} alt="Jana" className="w-12 h-12 object-contain rounded-xl shadow-md" />
          ) : (
            <div className="w-12 h-12 bg-[#5D7F8E] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#5D7F8E]/20 shrink-0">
              <Leaf size={24} />
            </div>
          )}
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
              <Settings size={22} />
              {isSidebarOpen && <span className="text-sm font-medium">Configuración</span>}
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
