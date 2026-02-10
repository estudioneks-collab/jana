
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
  Phone
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
  const [banner, setBanner] = useState<string | null>(localStorage.getItem('jana_banner'));
  const [whatsappNumber, setWhatsappNumber] = useState<string>(localStorage.getItem('jana_whatsapp') || '5491100000000');

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

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBanner(base64);
        localStorage.setItem('jana_banner', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ''); 
    setWhatsappNumber(val);
    localStorage.setItem('jana_whatsapp', val);
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
          <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <header className="text-center">
              <h2 className="text-4xl font-bold brand-font text-[#2C3E50] mb-2">Configuración</h2>
              <p className="text-[#5D7F8E]">Personaliza la identidad visual de Jana Diseños.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><ImageIcon size={24} className="text-[#5D7F8E]" /> Logo de Marca</h3>
                <div className="relative aspect-square bg-[#F2EFED] rounded-3xl border-2 border-dashed border-[#5D7F8E]/20 overflow-hidden flex items-center justify-center group max-w-[240px] mx-auto">
                  {logo ? (
                    <>
                      <img src={logo} alt="Logo" className="w-full h-full object-contain p-4" />
                      <button onClick={() => {setLogo(null); localStorage.removeItem('jana_logo');}} className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-rose-500 rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3"><Camera size={40} className="text-[#5D7F8E]/40" /><span className="text-sm font-bold text-[#5D7F8E]">Subir Logo</span><input type="file" className="hidden" onChange={handleLogoUpload} /></label>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><ImageIcon size={24} className="text-[#2C3E50]" /> Banner del Market</h3>
                <div className="relative aspect-video bg-[#F2EFED] rounded-3xl border-2 border-dashed border-[#2C3E50]/10 overflow-hidden flex items-center justify-center group">
                  {banner ? (
                    <>
                      <img src={banner} alt="Banner" className="w-full h-full object-cover" />
                      <button onClick={() => {setBanner(null); localStorage.removeItem('jana_banner');}} className="absolute top-4 right-4 w-10 h-10 bg-white/90 text-rose-500 rounded-xl shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18} /></button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3"><Camera size={40} className="text-[#2C3E50]/20" /><span className="text-sm font-bold text-[#2C3E50]/60">Subir Imagen de Portada</span><input type="file" className="hidden" onChange={handleBannerUpload} /></label>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">Se recomienda una imagen horizontal (paisaje).</p>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><MessageCircle size={24} className="text-[#25D366]" /> Contacto de Tienda</h3>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp para Pedidos</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#25D366]/10 p-1.5 rounded-lg text-[#25D366]">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="text"
                      className="w-full pl-14 pr-6 py-4 bg-[#F2EFED] rounded-2xl border-none focus:ring-2 focus:ring-[#25D366] font-bold text-[#2C3E50] transition-all outline-none"
                      placeholder="Ej: 5491100000000"
                      value={whatsappNumber}
                      onChange={handleWhatsappChange}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-[#2C3E50] flex items-center gap-3"><Database size={24} className="text-[#5D7F8E]" /> Base de Datos</h3>
                <div className="space-y-4">
                  <div className="p-5 bg-[#F2EFED] rounded-2xl flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDbConnected ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                      {isDbConnected ? <ShieldCheck size={24} /> : <CloudOff size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#2C3E50] text-sm">{isDbConnected ? 'En Línea' : 'Error de Conexión'}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{isDbConnected ? 'Supabase Conectado' : 'Revisa tu clave anon'}</p>
                    </div>
                  </div>
                  <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#5D7F8E] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#4A6A78] transition-all"><RefreshCw size={16} /> Reintentar</button>
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
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-[#2C3E50]/5 transition-all duration-500 flex flex-col fixed h-full z-50`}>
        <div className="p-10 flex flex-col items-center justify-center mb-6 h-48">
          {logo ? (
            <div className={`transition-all duration-500 flex items-center justify-center ${isSidebarOpen ? 'h-32 w-full' : 'h-12 w-12'}`}>
              <img 
                src={logo} 
                alt="Jana Diseños" 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#5D7F8E] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#5D7F8E]/10 mb-2">
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
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] transition-all duration-400 ${
                activeTab === item.id 
                  ? 'bg-[#5D7F8E] text-white shadow-xl shadow-[#5D7F8E]/20' 
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
                  ? 'bg-[#2C3E50] text-white shadow-xl' 
                  : 'text-[#2C3E50]/30 hover:bg-[#F2EFED]'
              }`}
            >
              <Settings size={22} className={activeTab === 'settings' ? 'text-white' : 'text-[#2C3E50]/20'} />
              {isSidebarOpen && <span className="text-sm font-bold tracking-wide">Ajustes</span>}
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
