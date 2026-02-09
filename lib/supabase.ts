
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// CONFIGURACIÓN FIJA Y PROTEGIDA DE JANA DISEÑOS
const SUPABASE_URL = 'https://xfhmqebitcbtpwvlfrlv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaG1xZWJpdGNidHB3dmxmcmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjUxMjIsImV4cCI6MjA4NjI0MTEyMn0.Setauc9Qjx86XEszlst0OmyZ5_gYHjI0tc1rlv12yXM';

export interface SupabaseConfig {
  url: string;
  key: string;
}

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  
  if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('tu-proyecto')) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseInstance;
  }
  return null;
};

// Helpers de base de datos
export const db = {
  async fetch<T>(table: string): Promise<T[]> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no está configurado correctamente en el sistema.');
    const { data, error } = await client.from(table).select('*');
    if (error) throw error;
    return data as T[];
  },

  async upsert<T extends { id: string }>(table: string, item: T): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no está configurado correctamente en el sistema.');
    const { error } = await client.from(table).upsert(item);
    if (error) throw error;
  },

  async remove(table: string, id: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no está configurado correctamente en el sistema.');
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) throw error;
  }
};
