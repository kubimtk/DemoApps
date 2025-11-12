import express from 'express';
import cors from 'cors';
import initSqlJs from 'sql.js';

const app = express();
app.use(cors());
app.use(express.json());

let db;
let SQL;

export async function initDb() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  db = new SQL.Database();
  
  db.run(`
    CREATE TABLE products (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      warehouse TEXT,
      minStock INTEGER DEFAULT 20,
      lastChanged TEXT
    )
  `);

  db.run(`
    CREATE TABLE logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT,
      quantity INTEGER,
      timestamp TEXT,
      FOREIGN KEY (barcode) REFERENCES products(barcode)
    )
  `);

  // Seed initial data as per BDD spec
  const now = new Date().toISOString();
  db.run(
    'INSERT INTO products (barcode, name, stock, warehouse, minStock, lastChanged) VALUES (?, ?, ?, ?, ?, ?)',
    ['12345', 'Schrauben M3', 10, 'Werkstatt', 20, now]
  );
  db.run(
    'INSERT INTO products (barcode, name, stock, warehouse, minStock, lastChanged) VALUES (?, ?, ?, ?, ?, ?)',
    ['99999', 'Muttern M5', 15, 'Werkstatt', 20, now]
  );

  return db;
}

export function clearDb(database) {
  const dbToUse = database || db;
  dbToUse.run('DELETE FROM logs');
  dbToUse.run('DELETE FROM products');
  
  // Re-seed initial data after clearing
  const now = new Date().toISOString();
  dbToUse.run(
    'INSERT INTO products (barcode, name, stock, warehouse, minStock, lastChanged) VALUES (?, ?, ?, ?, ?, ?)',
    ['12345', 'Schrauben M3', 10, 'Werkstatt', 20, now]
  );
  dbToUse.run(
    'INSERT INTO products (barcode, name, stock, warehouse, minStock, lastChanged) VALUES (?, ?, ?, ?, ?, ?)',
    ['99999', 'Muttern M5', 15, 'Werkstatt', 20, now]
  );
}

// Create product
app.post('/api/products', (req, res) => {
  const { barcode, name, stock = 0, warehouse, minStock = 20 } = req.body;
  const lastChanged = new Date().toISOString();

  db.run(
    'INSERT INTO products (barcode, name, stock, warehouse, minStock, lastChanged) VALUES (?, ?, ?, ?, ?, ?)',
    [barcode, name, stock, warehouse, minStock, lastChanged]
  );

  const result = db.exec('SELECT * FROM products WHERE barcode = ?', [barcode]);
  const product = sqlResultToObject(result)[0];
  res.status(201).json(product);
});

// Helper function to convert sql.js result to objects
function sqlResultToObject(result) {
  if (!result || !result.length || !result[0].values.length) {
    return [];
  }
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj;
  });
}

// Scan barcode endpoint
app.post('/api/scan', (req, res) => {
  const { barcode } = req.body;
  
  if (!barcode) {
    return res.status(400).json({ error: 'Barcode required' });
  }

  const result = db.exec('SELECT * FROM products WHERE barcode = ?', [barcode]);
  const products = sqlResultToObject(result);
  
  if (!products.length) {
    return res.status(404).json({ error: 'Produkt nicht gefunden' });
  }

  // Add low stock flags
  const product = products[0];
  res.json({
    ...product,
    isLowStock: product.stock < product.minStock,
    warning: product.stock < product.minStock ? 'Mindestbestand unterschritten' : null
  });
});

// Get product by barcode
app.get('/api/products/:barcode', (req, res) => {
  const { barcode } = req.params;
  const result = db.exec('SELECT * FROM products WHERE barcode = ?', [barcode]);
  const products = sqlResultToObject(result);
  
  if (!products.length) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(products[0]);
});

// Get all products with optional warehouse filter
app.get('/api/products', (req, res) => {
  const { warehouse } = req.query;
  
  let result;
  if (warehouse) {
    result = db.exec('SELECT * FROM products WHERE warehouse = ?', [warehouse]);
  } else {
    result = db.exec('SELECT * FROM products');
  }

  let products = sqlResultToObject(result);

  // Add isLowStock and warning flags
  products = products.map(product => ({
    ...product,
    isLowStock: product.stock < product.minStock,
    warning: product.stock < product.minStock ? 'Mindestbestand unterschritten' : null
  }));

  res.json(products);
});

// Adjust stock (add or remove)
app.post('/api/adjust', (req, res) => {
  const { barcode, quantity } = req.body;
  
  if (!barcode || quantity === undefined) {
    return res.status(400).json({ error: 'Barcode and quantity required' });
  }

  const lastChanged = new Date().toISOString();

  // Update stock
  db.run(
    'UPDATE products SET stock = stock + ?, lastChanged = ? WHERE barcode = ?',
    [quantity, lastChanged, barcode]
  );

  // Log the change
  db.run(
    'INSERT INTO logs (barcode, quantity, timestamp) VALUES (?, ?, ?)',
    [barcode, quantity, lastChanged]
  );

  const result = db.exec('SELECT * FROM products WHERE barcode = ?', [barcode]);
  const product = sqlResultToObject(result)[0];
  
  // Add low stock flags
  res.json({
    ...product,
    isLowStock: product.stock < product.minStock,
    warning: product.stock < product.minStock ? 'Mindestbestand unterschritten' : null
  });
});

// Keep old endpoint for backward compatibility
app.post('/api/products/:barcode/adjust', (req, res) => {
  const { barcode } = req.params;
  const { quantity } = req.body;
  const lastChanged = new Date().toISOString();

  // Update stock
  db.run(
    'UPDATE products SET stock = stock + ?, lastChanged = ? WHERE barcode = ?',
    [quantity, lastChanged, barcode]
  );

  // Log the change
  db.run(
    'INSERT INTO logs (barcode, quantity, timestamp) VALUES (?, ?, ?)',
    [barcode, quantity, lastChanged]
  );

  const result = db.exec('SELECT * FROM products WHERE barcode = ?', [barcode]);
  const product = sqlResultToObject(result)[0];
  res.json(product);
});

// Get logs for a product
app.get('/api/products/:barcode/logs', (req, res) => {
  const { barcode } = req.params;
  const result = db.exec('SELECT * FROM logs WHERE barcode = ? ORDER BY timestamp DESC', [barcode]);
  const logs = sqlResultToObject(result);
  res.json(logs);
});

const PORT = 3000;

if (process.env.NODE_ENV !== 'test') {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export { app };

