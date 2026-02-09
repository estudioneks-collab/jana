
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfhmqebitcbtpwvlfrlv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmaG1xZWJpdGNidHB3dmxmcmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjUxMjIsImV4cCI6MjA4NjI0MTEyMn0.Setauc9Qjx86XEszlst0OmyZ5_gYHjI0tc1rlv12yXM';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  
  if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('tu-proyecto')) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseInstance;
  }
  return null;
};

export const db = {
  async fetch<T>(table: string): Promise<T[]> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no configurado.');
    const { data, error } = await client.from(table).select('*');
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }
    return data as T[];
  },

  async upsert<T extends { id: string }>(table: string, item: T): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no configurado.');
    
    // Log para depuración
    console.debug(`Intentando upsert en ${table}:`, item);
    
    const { error } = await client.from(table).upsert(item);
    if (error) {
      console.error(`Error en upsert ${table}:`, error);
      throw error;
    }
  },

  async remove(table: string, id: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no configurado.');
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) throw error;
  },

  async testConnection() {
    const client = getSupabase();
    if (!client) return { success: false, message: 'URL o Key no válidas.' };
    
    try {
      // Intentamos leer una tabla básica
      const { error } = await client.from('materials').select('id').limit(1);
      if (error) return { success: false, message: `Error de base de datos: ${error.message}. ¿Creaste las tablas con el archivo database.sql?` };
      return { success: true, message: 'Conexión exitosa. Las tablas están listas.' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
};
