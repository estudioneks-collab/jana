
import React, { useState } from 'react';
import { Client } from '../types';
// Fix: Added 'Users' to the imported icons from 'lucide-react'
import { Search, Plus, Trash2, Edit2, User, Phone, Instagram, MapPin, Mail, X, Save, Users } from 'lucide-react';
import { db, getSupabase } from '../lib/supabase';

interface Props {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const Clients: React.FC<Props> = ({ clients, setClients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<Client, 'id' | 'dateAdded'>>({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    address: ''
  });

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás segura de eliminar este cliente?')) {
      try {
        if (getSupabase()) await db.remove('clients', id);
        setClients(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert("Error al eliminar cliente.");
      }
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingId(client.id);
      setFormData({
        name: client.name,
        email: client.email || '',
        phone: client.phone || '',
        instagram: client.instagram || '',
        address: client.address || ''
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', instagram: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const id = editingId || Date.now().toString();
    const clientData: Client = {
      ...formData,
      id,
      dateAdded: editingId ? (clients.find(c => c.id === editingId)?.dateAdded || '') : new Date().toISOString().split('T')[0]
    };

    try {
      if (getSupabase()) {
        await db.upsert('clients', clientData);
      }
      
      if (editingId) {
        setClients(prev => prev.map(c => c.id === editingId ? clientData : c));
      } else {
        setClients(prev => [clientData, ...prev]);
      }
      closeModal();
    } catch (err) {
      alert("Error al guardar cliente en Supabase.");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.instagram && c.instagram.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold brand-font text-slate-900">Agenda de Clientes</h2>
          <p className="text-slate-500 text-sm">Organiza los contactos para tus presupuestos y ventas.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-2xl transition-all shadow-lg font-bold text-sm"
        >
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o Instagram..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-rose-500 text-sm outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(client => (
          <div key={client.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                <User size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-rose-600 transition-colors">{client.name}</h3>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">Desde {client.dateAdded}</p>
                
                <div className="mt-4 space-y-2.5">
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-300" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                  )}
                  {client.instagram && (
                    <div className="flex items-center gap-2 text-sm text-rose-600 font-medium">
                      <Instagram size={14} className="text-rose-300" />
                      <span className="truncate">@{client.instagram.replace('@', '')}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-300" />
                      <span className="truncate text-xs">{client.email}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="truncate italic text-xs">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => openModal(client)}
                className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-colors shadow-sm"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(client.id)}
                className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors shadow-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-100">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron clientes.</p>
        </div>
      )}

      {/* Modal de Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-bold brand-font text-slate-900">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-600 bg-slate-50 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    placeholder="Ej: María José"
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all font-medium"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Instagram</label>
                  <div className="relative">
                    <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
                    <input 
                      placeholder="@jana.disenos"
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                      value={formData.instagram}
                      onChange={e => setFormData({...formData, instagram: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      placeholder="+54..."
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Dirección / Localidad</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    placeholder="Calle 123, Ciudad"
                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none transition-all text-sm"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-[2] px-4 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-xl shadow-rose-200 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  {editingId ? 'Actualizar' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
