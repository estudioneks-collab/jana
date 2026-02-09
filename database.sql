
-- 1. Tabla de Materiales (Insumos)
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

-- 3. Tabla de Productos (Catálogo de diseños terminados)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB DEFAULT '[]'::jsonb, -- Lista de materiales {materialId, quantity, subtotal}
  "totalCost" NUMERIC DEFAULT 0,
  "suggestedPrice" NUMERIC DEFAULT 0,
  "imageUrl" TEXT,
  "dateCreated" TEXT
);

-- 4. Tabla de Transacciones (Contabilidad)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT,
  type TEXT CHECK (type IN ('ingreso', 'egreso')),
  category TEXT,
  description TEXT,
  amount NUMERIC DEFAULT 0
);

-- 5. Tabla de Presupuestos (Historial de ventas)
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  date TEXT,
  "clientId" TEXT REFERENCES clients(id) ON DELETE SET NULL,
  items JSONB DEFAULT '[]'::jsonb, -- Lista de productos {productId, quantity, unitCost, subtotal}
  "utilityPercentage" NUMERIC DEFAULT 0,
  "discountAmount" NUMERIC DEFAULT 0,
  "discountDesc" TEXT,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'confirmado'
);

-- Habilitar RLS para todas las tablas
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso para permitir todo con la Anon Key (ideal para desarrollo/uso personal)
CREATE POLICY "Allow all" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON budgets FOR ALL USING (true) WITH CHECK (true);
