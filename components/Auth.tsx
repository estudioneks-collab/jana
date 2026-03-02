
import React, { useState } from 'react';
import { getSupabase } from '../lib/supabase';
import { Lock, Mail, User, ArrowRight, Leaf, Loader2 } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase no está configurado correctamente.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('¡Registro exitoso! Por favor revisa tu email para confirmar tu cuenta si es necesario.');
        setIsLogin(true);
        setLoading(false);
        return;
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error durante la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EFED] p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white p-10 space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#5D7F8E] rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto mb-4">
            <Leaf size={32} />
          </div>
          <h1 className="brand-font text-4xl text-[#2C3E50]">Jana Diseños</h1>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#2C3E50]/40">Gestión Exclusiva</p>
        </div>

        <div className="space-y-6">
          <div className="flex bg-[#F2EFED] p-1.5 rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                isLogin ? 'bg-white text-[#2C3E50] shadow-sm' : 'text-[#2C3E50]/40 hover:text-[#2C3E50]'
              }`}
            >
              Ingresar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                !isLogin ? 'bg-white text-[#2C3E50] shadow-sm' : 'text-[#2C3E50]/40 hover:text-[#2C3E50]'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#2C3E50]/40 uppercase tracking-widest ml-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-6 py-4 bg-[#F2EFED] border-none rounded-2xl focus:ring-2 focus:ring-[#5D7F8E] outline-none font-semibold text-[#2C3E50] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#2C3E50]/40 uppercase tracking-widest ml-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-[#F2EFED] border-none rounded-2xl focus:ring-2 focus:ring-[#5D7F8E] outline-none font-semibold text-[#2C3E50] transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-500 text-xs font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[#2C3E50] hover:bg-[#1A2632] text-white rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-xl shadow-[#2C3E50]/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-medium italic">
          Acceso restringido para la administración de Jana Diseños.
        </p>
      </div>
    </div>
  );
};

export default Auth;
