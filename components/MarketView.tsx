
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Search, X, MessageCircle, Leaf, Star, Heart } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';

const SUPABASE_URL = 'https://xfhmqebitcbtpwvlfrlv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaG1xZWJpdGNidHB3dmxmcmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjUxMjIsImV4cCI6MjA4NjI0MTEyMn0.Setauc9Qjx86XEszlst0OmyZ5_gYHjI0tc1rlv12yXM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MarketView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  const whatsappNumber = localStorage.getItem('jana_whatsapp') || '5491100000000';
  const logo = localStorage.getItem('jana_logo');
  const banner = localStorage.getItem('jana_banner');

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
    const cats = new Set(products.map(p => p.category?.toUpperCase() || 'BIJOUTERIE'));
    return ['TODAS', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const pCat = p.category?.toUpperCase() || 'BIJOUTERIE';
      const matchesCat = activeCategory === 'TODAS' || pCat === activeCategory;
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
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2EFED]">
      <div className="w-16 h-16 border-4 border-[#5D7F8E]/20 border-t-[#5D7F8E] rounded-full animate-spin mb-4"></div>
      <p className="brand-font text-2xl text-[#2C3E50] italic">Cargando Jana Diseños...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2EFED] text-[#2C3E50]">
      {/* Header */}
      <header className="bg-white px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20">
          <div className="h-full flex items-center">
            {logo ? (
              <img src={logo} alt="Jana Diseños" className="h-full max-h-16 object-contain" />
            ) : (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 text-[#5D7F8E]">
                  <Leaf size={28} />
                  <h1 className="brand-font text-4xl leading-none">Jana</h1>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 ml-10">Diseños</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Buscar pieza..."
                className="pl-12 pr-6 py-2.5 bg-[#F2EFED]/60 rounded-full text-sm outline-none focus:ring-1 focus:ring-slate-200 w-64 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            </div>
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#2C3E50] hover:scale-110 transition-transform">
              <ShoppingBag size={28} strokeWidth={1.5} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-[#2C3E50] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section con Banner */}
      <section 
        className={`relative py-32 px-10 overflow-hidden ${banner ? '' : 'bg-[#2C3E50]'}`}
        style={banner ? {
          backgroundImage: `linear-gradient(rgba(44, 62, 80, 0.6), rgba(44, 62, 80, 0.6)), url(${banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 space-y-4">
          <h2 className="brand-font text-5xl md:text-8xl font-normal text-white drop-shadow-lg">Bienvenidos a Jana Diseños</h2>
          <p className="text-white/90 text-lg md:text-2xl font-light tracking-wide drop-shadow">Joyas con Alma Artesanal</p>
        </div>
        {!banner && (
          <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 pointer-events-none">
             <Leaf size={500} className="absolute -right-20 -top-20 text-white" />
          </div>
        )}
      </section>

      {/* Categorías Pills */}
      <nav className="max-w-7xl mx-auto px-6 py-12 flex justify-center gap-4 flex-wrap">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
              activeCategory === cat 
                ? 'bg-[#2C3E50] text-white border-[#2C3E50] shadow-md' 
                : 'bg-white text-slate-400 border-white hover:border-slate-100 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Grid de Productos */}
      <main className="max-w-7xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pb-20">
        {filteredProducts.map((p) => (
          <div key={p.id} className="group cursor-pointer">
            <div className="aspect-[4/5] bg-white rounded-[2rem] overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-500">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                   <Leaf size={64} strokeWidth={0.5} />
                </div>
              )}
              
              <div className="absolute top-6 left-6 w-5 h-5 bg-white/80 rounded-full shadow-inner opacity-90" />
              
              <button 
                onClick={(e) => { e.stopPropagation(); addToCart(p); }} 
                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <div className="bg-white text-[#2C3E50] p-4 rounded-full shadow-xl">
                  <ShoppingBag size={24} />
                </div>
              </button>
            </div>
            
            <div className="mt-5 text-center md:text-left px-2">
              <h3 className="brand-font text-2xl text-[#2C3E50] italic font-bold mb-1">{p.name}</h3>
              <p className="text-xl font-black text-[#5D7F8E] tracking-tight">${p.suggestedPrice}</p>
            </div>
          </div>
        ))}
      </main>

      {/* Botón WhatsApp Flotante */}
      <a 
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-10 right-10 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-[90]"
      >
        <MessageCircle size={32} fill="white" />
      </a>

      <footer className="py-12 border-t border-slate-200/50 text-center">
         <p className="text-slate-400 text-sm font-medium">Jana Diseño 2026</p>
      </footer>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b flex items-center justify-between">
              <h3 className="text-2xl font-bold brand-font italic">Tu Selección</h3>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <ShoppingBag size={64} className="mb-4 opacity-20" />
                  <p className="font-medium">Tu carrito está esperando piezas únicas</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 group">
                    <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                      {item.product.imageUrl && <img src={item.product.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#2C3E50] text-sm truncate">{item.product.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-black text-[#5D7F8E]">${item.product.suggestedPrice}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-[#F2EFED] px-3 py-1 rounded-lg">x{item.quantity}</span>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-rose-300 hover:text-rose-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-8 border-t bg-[#F2EFED]/30">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Estimado</span>
                  <span className="text-4xl font-black text-[#2C3E50] tracking-tighter">${total}</span>
                </div>
                <button 
                  onClick={handleWhatsAppOrder} 
                  className="w-full bg-[#25D366] text-white py-5 rounded-3xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-[#20ba5a] transition-all"
                >
                  <MessageCircle size={20} fill="white" /> Consultar pedido por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketView;
