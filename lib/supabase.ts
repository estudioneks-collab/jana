
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  key: string;
}

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const saved = localStorage.getItem('jana_supabase_config');
  return saved ? JSON.parse(saved) : null;
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  localStorage.setItem('jana_supabase_config', JSON.stringify(config));
  supabaseInstance = createClient(config.url, config.key);
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('jana_supabase_config');
  supabaseInstance = null;
};

export const getSupabase = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  const config = getSupabaseConfig();
  if (config) {
    supabaseInstance = createClient(config.url, config.key);
    return supabaseInstance;
  }
  return null;
};

// Helpers de base de datos
export const db = {
  async fetch<T>(table: string): Promise<T[]> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no configurado');
    const { data, error } = await client.from(table).select('*');
    if (error) throw error;
    return data as T[];
  },

  async upsert<T extends { id: string }>(table: string, item: T): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no configurado');
    const { error } = await client.from(table).upsert(item);
    if (error) throw error;
  },

  async remove(table: string, id: string): Promise<void> {
    const client = getSupabase();
    if (!client) throw new Error('Supabase no configurado');
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) throw error;
  }
};
