
-- 1. Tabla de Materiales
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('perlas', 'cadenas', 'dijes', 'otros')),
  unit TEXT,
  "costPerUnit" NUMERIC DEFAULT 0,
  stock NUMERIC DEFAULT 0
);

-- 2. Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  instagram TEXT,
  address TEXT,
  "dateAdded" TEXT
);

-- 3. Tabla de Productos (Y Reparación de columnas)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Bijouterie',
  description TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  "totalCost" NUMERIC DEFAULT 0,
  "suggestedPrice" NUMERIC DEFAULT 0,
  "imageUrl" TEXT,
  "dateCreated" TEXT
);

-- Forzar adición de columnas si la tabla ya existía sin ellas
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Bijouterie';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. Tabla de Transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT,
  type TEXT CHECK (type IN ('ingreso', 'egreso')),
  category TEXT,
  description TEXT,
  amount NUMERIC DEFAULT 0
);

-- 5. Tabla de Presupuestos
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  date TEXT,
  "clientId" TEXT REFERENCES clients(id) ON DELETE SET NULL,
  items JSONB DEFAULT '[]'::jsonb,
  "utilityPercentage" NUMERIC DEFAULT 0,
  "discountAmount" NUMERIC DEFAULT 0,
  "discountDesc" TEXT,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'emitido'))
);

-- 6. Tabla de Configuración de Marca
CREATE TABLE IF NOT EXISTS brand_settings (
  id TEXT PRIMARY KEY,
  logo TEXT,
  banner TEXT,
  whatsapp TEXT
);

-- Habilitar RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- Recrear políticas
DROP POLICY IF EXISTS "Allow all" ON materials;
DROP POLICY IF EXISTS "Allow all" ON clients;
DROP POLICY IF EXISTS "Allow all" ON products;
DROP POLICY IF EXISTS "Allow all" ON transactions;
DROP POLICY IF EXISTS "Allow all" ON budgets;
DROP POLICY IF EXISTS "Allow all" ON brand_settings;

CREATE POLICY "Allow all" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON brand_settings FOR ALL USING (true) WITH CHECK (true);

-- Limpiar cache de PostgREST
NOTIFY pgrst, 'reload schema';
