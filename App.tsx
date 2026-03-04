
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
  ShoppingBag,
  MessageCircle,
  Phone,
  Save as SaveIcon,
  LogOut,
  Loader2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import BudgetBuilder from './components/BudgetBuilder';
import Accounting from './components/Accounting';
import QuickCalculator from './components/QuickCalculator';
import Catalogue from './components/Catalogue';
import Clients from './components/Clients';
import MarketView from './components/MarketView';
import Auth from './components/Auth';
import { Material, Transaction, Product, Client, Budget } from './types';
import { getSupabase, db } from './lib/supabase';

const App: React.FC = () => {
  const isAdminMode = window.location.pathname.startsWith('/admin');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'budgets' | 'accounting' | 'calculator' | 'catalogue' | 'clients' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  const [logo, setLogo] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('5491100000000');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsAuthChecking(false);
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthChecking(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdminMode && user) {
      loadAllData();
    }
  }, [isAdminMode, user]);

  const loadAllData = async () => {
    if (!user) return;
    setIsLoading(true);
    setDbErrorMessage(null);
    try {
      const client = getSupabase();
      if (!client) {
        setIsDbConnected(false);
        setIsLoading(false);
        return;
      }

      // Fetching individually to identify which one fails if any
      const fetchTable = async <T extends unknown>(table: string) => {
        try {
          const data = await db.fetch<T>(table);
          return data || [];
        } catch (err: any) {
          console.error(`Error fetching table ${table}:`, err);
          
          // Si es un timeout en productos, intentamos una carga "ligera" sin imágenes para que al menos vea los nombres
          if (table === 'products' && err.message?.includes('timeout')) {
            try {
              const client = getSupabase();
              if (client) {
                const { data: liteData, error: liteError } = await client
                  .from('products')
                  .select('id, name, category, description, totalCost, suggestedPrice, dateCreated, items');
                
                if (!liteError && liteData) {
                  setDbErrorMessage("La tabla de productos es muy pesada. Se cargaron los datos sin imágenes para permitirte limpiar o editar.");
                  return liteData as T[];
                }
              }
            } catch (liteErr) {
              console.error("Error en carga ligera:", liteErr);
            }
          }

          if (err.message?.includes('timeout')) {
            setDbErrorMessage(`La tabla "${table}" es muy pesada y dio error de tiempo. El resto de la app funcionará.`);
          }
          return []; 
        }
      };

      const mats = await fetchTable<Material>('materials');
      const trans = await fetchTable<Transaction>('transactions');
      const prods = await fetchTable<Product>('products');
      const clis = await fetchTable<Client>('clients');
      const buds = await fetchTable<Budget>('budgets');
      const settings = await fetchTable<{id: string, logo: string, banner: string, whatsapp: string}>('brand_settings');

      setMaterials(mats);
      setTransactions(trans);
      setProducts(prods);
      setClients(clis);
      setBudgets(buds);
      
      if (settings && settings.length > 0) {
        setLogo(settings[0].logo);
        setBanner(settings[0].banner);
        setWhatsappNumber(settings[0].whatsapp || '5491100000000');
      }

      setIsDbConnected(true);
    } catch (err: any) {
      console.error("Error cargando datos de Jana:", err);
      setIsDbConnected(false);
      setDbErrorMessage(err.message || "Error al conectar con la base de datos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const handleSaveAllSettings = async () => {
    setIsSavingSettings(true);
    try {
      await db.upsert('brand_settings', {
        id: 'primary',
        logo,
        banner,
        whatsapp: whatsappNumber
      });
      alert("¡Identidad de Jana guardada correctamente!");
    } catch (err: any) {
      alert(`Error al guardar configuración: ${err.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBanner(reader.result as string);
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

  if (!isAdminMode) {
    return <MarketView />;
  }

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2EFED]">
        <Loader2 className="animate-spin text-[#5D7F8E]" size={48} />
        <p className="mt-4 brand-font text-[#2C3E50]/60 italic">Verificando acceso...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
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

    if (!isDbConnected && dbErrorMessage) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-10 bg-white rounded-[3rem] border-2 border-dashed border-rose-200 shadow-xl">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
            <CloudOff size={40} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-[#2C3E50]">Error de Conexión</h3>
            <p className="text-slate-500 max-w-md mx-auto">{dbErrorMessage}</p>
          </div>
          <button 
            onClick={loadAllData}
            className="flex items-center gap-3 px-8 py-4 bg-[#2C3E50] text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-[#1A2632] transition-all shadow-lg"
          >
            <RefreshCw size={18} />
            Reintentar Conexión
          </button>
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
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-4xl font-bold brand-font text-[#2C3E50] mb-2">Configuración</h2>
                <p className="text-[#5D7F8E]">Gestiona tu identidad visual en la nube.</p>
              </div>
              <button 
                onClick={handleSaveAllSettings}
                disabled={isSavingSettings}
                className="bg-[#2C3E50] text-white px-8 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center gap-3 shadow-xl hover:bg-[#1A2632] transition-all disabled:opacity-50"
              >
                {isSavingSettings ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <SaveIcon size={18} />}
                Guardar Cambios
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><Database size={24} className="text-[#5D7F8E]" /> Estado de Base de Datos</h3>
                <div className="p-6 bg-[#F2EFED] rounded-3xl border border-[#5D7F8E]/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conexión Supabase</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isDbConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isDbConnected ? 'Activa' : 'Desconectada'}
                    </span>
                  </div>
                  <button 
                    onClick={async () => {
                      const res = await db.testConnection();
                      alert(res.message);
                      if (res.success) loadAllData();
                    }}
                    className="w-full py-3 bg-white text-[#5D7F8E] border border-[#5D7F8E]/20 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#5D7F8E] hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Probar Conexión
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><ImageIcon size={24} className="text-[#5D7F8E]" /> Logo Principal</h3>
                <div className="relative aspect-square bg-[#F2EFED] rounded-3xl border-2 border-dashed border-[#5D7F8E]/20 overflow-hidden flex items-center justify-center group max-w-[240px] mx-auto">
                  {logo ? (
                    <>
                      <img src={logo} alt="Logo" className="w-full h-full object-contain p-4" />
                      <button onClick={() => setLogo(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-rose-500 rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3"><Camera size={40} className="text-[#5D7F8E]/40" /><span className="text-sm font-bold text-[#5D7F8E]">Subir Logo</span><input type="file" className="hidden" onChange={handleLogoUpload} /></label>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><ImageIcon size={24} className="text-[#2C3E50]" /> Portada (Banner)</h3>
                <div className="relative aspect-video bg-[#F2EFED] rounded-3xl border-2 border-dashed border-[#2C3E50]/10 overflow-hidden flex items-center justify-center group">
                  {banner ? (
                    <>
                      <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                      <button onClick={() => setBanner(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-rose-500 rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3"><Camera size={40} className="text-[#2C3E50]/20" /><span className="text-sm font-bold text-[#2C3E50]/60">Subir Banner</span><input type="file" className="hidden" onChange={handleBannerUpload} /></label>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><MessageCircle size={24} className="text-[#25D366]" /> WhatsApp</h3>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número de Pedidos</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#25D366]">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="text"
                      className="w-full pl-14 pr-6 py-4 bg-[#F2EFED] rounded-2xl border-none focus:ring-2 focus:ring-[#25D366] font-bold text-[#2C3E50] outline-none"
                      placeholder="Ej: 5491100000000"
                      value={whatsappNumber}
                      onChange={e => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex text-[#2C3E50] bg-[#F2EFED]">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-[#2C3E50]/5 transition-all duration-500 flex flex-col fixed h-full z-50 shadow-sm`}>
        <div className="p-8 flex flex-col items-center justify-center mb-6 h-48 overflow-hidden">
          {logo ? (
            <div className={`transition-all duration-500 flex items-center justify-center overflow-hidden ${isSidebarOpen ? 'h-32 w-full px-4' : 'h-14 w-14 p-1'}`}>
              <img 
                src={logo} 
                alt="Jana Diseños" 
                className="w-full h-full object-contain" 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#5D7F8E] rounded-2xl flex items-center justify-center text-white shadow-xl mb-2">
                <Leaf size={28} />
              </div>
              {isSidebarOpen && (
                <div className="text-center">
                  <h1 className="brand-font text-3xl leading-none text-[#5D7F8E]">Jana</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#2C3E50]/40">Diseños</p>
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 px-5 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all ${
                activeTab === item.id 
                  ? 'bg-[#5D7F8E] text-white shadow-lg' 
                  : 'text-[#2C3E50]/30 hover:bg-[#F2EFED]/50 hover:text-[#2C3E50]'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-[#2C3E50]/20'} />
              {isSidebarOpen && <span className="text-sm font-bold tracking-wide">{item.label}</span>}
            </button>
          ))}
          
          <div className="pt-8 mt-8 border-t border-[#F2EFED]">
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all ${
                activeTab === 'settings' 
                  ? 'bg-[#2C3E50] text-white shadow-lg' 
                  : 'text-[#2C3E50]/30 hover:bg-[#F2EFED]'
              }`}
            >
              <Settings size={22} className={activeTab === 'settings' ? 'text-white' : 'text-[#2C3E50]/20'} />
              {isSidebarOpen && <span className="text-sm font-bold tracking-wide">Ajustes</span>}
            </button>

            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all text-rose-400 hover:bg-rose-50 hover:text-rose-600 mt-2"
            >
              <LogOut size={22} />
              {isSidebarOpen && <span className="text-sm font-bold tracking-wide">Cerrar Sesión</span>}
            </button>
          </div>
        </nav>

        <div className="p-6">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="w-full p-4 flex items-center justify-center bg-[#F2EFED] rounded-[1.2rem] text-[#5D7F8E] hover:bg-[#5D7F8E] hover:text-white transition-all shadow-inner"
          >
            <Menu size={20} />
          </button>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-24'} p-10 min-h-screen`}>
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
