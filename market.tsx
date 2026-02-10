
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { ShoppingBag, Search, X, MessageCircle, ChevronRight, Leaf, Instagram, Heart, Star, Filter } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Credenciales sincronizadas
const SUPABASE_URL = 'https://xfhmqebitcbtpwvlfrlv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaG1xZWJpdGNidHB3dmxmcmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjUxMjIsImV4cCI6MjA4NjI0MTEyMn0.Setauc9Qjx86XEszlst0OmyZ5_gYHjI0tc1rlv12yXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WHATSAPP_NUMBER = '5491100000000'; // Asegúrate de cambiar este número

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  suggestedPrice: number;
  imageUrl?: string;
}

const MarketApp: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('jana_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('jana_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || 'Bijouterie'));
    return ['Todas', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = activeCategory === 'Todas' || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? {...item, quantity: item.quantity + 1} : item);
      }
      return [...prev, {product, quantity: 1}];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.product.suggestedPrice * item.quantity), 0);

  const handleWhatsAppOrder = () => {
    let message = `¡Hola Jana Diseños! Me gustaría realizar el siguiente pedido:\n\n`;
    cart.forEach(item => {
      message += `• ${item.product.name} x${item.quantity} - $${item.product.suggestedPrice * item.quantity}\n`;
    });
    message += `\n*Total estimado: $${total}*\n\n¿Cómo podemos coordinar el pago y la entrega?`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2EFED]">
      <div className="w-16 h-16 border-4 border-[#5D7F8E]/20 border-t-[#5D7F8E] rounded-full animate-spin mb-4"></div>
      <p className="brand-font text-2xl text-[#2C3E50] italic">Preparando la colección...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#2C3E50]/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#5D7F8E] rounded-xl flex items-center justify-center text-white shadow-lg">
              <Leaf size={20} />
            </div>
            <div>
              <h1 className="brand-font text-2xl leading-none text-[#2C3E50]">Jana</h1>
              <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#5D7F8E]">Colección Online</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative items-center">
              <Search className="absolute left-3 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Buscar pieza..."
                className="pl-10 pr-4 py-2 bg-[#F2EFED] rounded-full text-xs outline-none focus:ring-2 focus:ring-[#5D7F8E] w-48 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#2C3E50] hover:text-[#5D7F8E] transition-colors">
              <ShoppingBag size={24} />
              {cart.length > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-[#5D7F8E] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <section className="bg-[#2C3E50] text-white py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl fade-up">
            <h2 className="brand-font text-6xl md:text-8xl italic mb-6">Joyas con Alma</h2>
            <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-lg mb-10">Piezas artesanales diseñadas para resaltar tu esencia natural.</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
           <Leaf size={500} className="absolute -right-20 -top-20" />
        </div>
      </section>

      <nav className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#2C3E50] text-white shadow-lg' : 'bg-white text-slate-400'}`}>{cat}</button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {filteredProducts.map((p, idx) => (
          <div key={p.id} className="group fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="aspect-[4/5] bg-white rounded-[2.5rem] overflow-hidden relative shadow-sm border border-white hover:shadow-2xl transition-all duration-500">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" /> : <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200"><Star size={48} /></div>}
              <div className="absolute top-6 left-6"><span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-bold uppercase tracking-widest text-[#5D7F8E]">{p.category}</span></div>
              <button onClick={() => addToCart(p)} className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md py-4 rounded-2xl flex items-center justify-center gap-3 text-[#2C3E50] font-bold text-xs uppercase tracking-widest translate-y-20 group-hover:translate-y-0 transition-all duration-500 hover:bg-[#5D7F8E] hover:text-white"><ShoppingBag size={18} /> Añadir al Carrito</button>
            </div>
            <div className="mt-6 px-4">
              <h3 className="brand-font text-2xl text-[#2C3E50] mb-1">{p.name}</h3>
              <p className="text-xl font-black text-[#5D7F8E]">${p.suggestedPrice}</p>
            </div>
          </div>
        ))}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#2C3E50]/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b flex items-center justify-between">
              <div className="flex items-center gap-3"><ShoppingBag size={24} className="text-[#5D7F8E]" /><h3 className="text-xl font-bold text-[#2C3E50] brand-font italic">Tu Selección</h3></div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center"><div className="w-20 h-20 bg-[#F2EFED] text-[#5D7F8E] rounded-full flex items-center justify-center mb-6"><ShoppingBag size={32} /></div><p className="text-[#2C3E50] font-bold text-lg">Tu carrito está vacío</p></div> : cart.map(item => (
                <div key={item.product.id} className="flex gap-4 group">
                  <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0">{item.product.imageUrl && <img src={item.product.imageUrl} className="w-full h-full object-cover" />}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#2C3E50] text-sm">{item.product.name}</h4>
                    <div className="flex items-center justify-between mt-3"><p className="font-black text-[#5D7F8E]">${item.product.suggestedPrice}</p><div className="flex items-center gap-3"><span className="text-xs font-bold bg-[#F2EFED] px-3 py-1 rounded-lg">x{item.quantity}</span><button onClick={() => removeFromCart(item.product.id)} className="text-rose-300"><X size={16} /></button></div></div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-8 border-t bg-[#F2EFED]/30">
                <div className="flex justify-between items-end mb-8"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Total</span><span className="text-4xl font-black text-[#2C3E50]">${total}</span></div>
                <button onClick={handleWhatsAppOrder} className="w-full bg-[#25D366] text-white py-5 rounded-[1.5rem] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"><MessageCircle size={20} /> Enviar pedido por WhatsApp</button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-[#2C3E50]/5 pt-20 pb-10 mt-20 text-center">
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2024 Jana Diseños - Arte en Bijouterie</p>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<MarketApp />);
