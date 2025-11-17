/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import './App.css';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Debug: Log API URL beim Start
console.log('🔧 API_URL:', API_URL);
// @ts-ignore
console.log('🔧 ENV VITE_API_URL:', import.meta.env.VITE_API_URL);

// ============================================================================
// MOCK DATA - Basierend auf BDD Szenarien aus inventory.feature
// ============================================================================

// Mock-Modus: Aktiviert auf Vercel
const isMockMode = typeof window !== 'undefined' && window.location.hostname.includes('vercel');

console.log('🎭 Mock Mode:', isMockMode ? 'ACTIVE (Vercel)' : 'DISABLED (using real API)');

// In-Memory Mock Store für Vercel
const mockStore = {
  products: [
    {
      barcode: '12345',
      name: 'Schrauben M3',
      stock: 10,
      warehouse: 'Werkstatt',
      minStock: 20,
      lastChanged: new Date().toISOString(),
      isLowStock: true,
      warning: 'Mindestbestand unterschritten'
    },
    {
      barcode: '99999',
      name: 'Muttern M5',
      stock: 15,
      warehouse: 'Werkstatt',
      minStock: 20,
      lastChanged: new Date().toISOString(),
      isLowStock: true,
      warning: 'Mindestbestand unterschritten'
    }
  ]
};

// Mock API Fetch - Ersetzt fetch() auf Vercel
async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  // Wenn nicht im Mock-Modus, nutze echte API
  if (!isMockMode) {
    return fetch(url, options);
  }

  console.log('🎭 Mock API Call:', url, options?.method || 'GET');

  // Simuliere Netzwerk-Delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const urlPath = url.replace(API_URL, '');
  const method = options?.method || 'GET';

  // Mock: GET /products (mit optionalem warehouse Filter)
  if (urlPath.startsWith('/products') && method === 'GET') {
    const urlObj = new URL(url);
    const warehouse = urlObj.searchParams.get('warehouse');
    
    let products = mockStore.products;
    if (warehouse && warehouse !== 'Alle') {
      products = products.filter(p => p.warehouse === warehouse);
    }

    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Mock: POST /scan
  if (urlPath === '/scan' && method === 'POST') {
    const body = JSON.parse(options?.body as string);
    const { barcode } = body;

    const product = mockStore.products.find(p => p.barcode === barcode);

    if (product) {
      return new Response(JSON.stringify(product), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Produkt nicht gefunden' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Mock: POST /adjust
  if (urlPath === '/adjust' && method === 'POST') {
    const body = JSON.parse(options?.body as string);
    const { barcode, quantity } = body;

    const product = mockStore.products.find(p => p.barcode === barcode);

    if (!product) {
      return new Response(JSON.stringify({ error: 'Produkt nicht gefunden' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const newStock = product.stock + quantity;

    // Validation: Stock kann nicht negativ werden
    if (newStock < 0) {
      return new Response(JSON.stringify({
        error: 'Lagerbestand kann nicht negativ werden',
        currentStock: product.stock,
        requestedQuantity: quantity
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update stock
    product.stock = newStock;
    product.lastChanged = new Date().toISOString();
    product.isLowStock = product.stock < product.minStock;
    // @ts-ignore - Mock setzt warning dynamisch
    product.warning = product.isLowStock ? 'Mindestbestand unterschritten' : undefined;

    console.log('🎭 Mock: Stock adjusted', { barcode, oldStock: product.stock - quantity, newStock, quantity });

    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Fallback: Endpoint nicht gefunden
  return new Response(JSON.stringify({ error: 'Mock endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

interface Product {
  barcode: string;
  name: string;
  stock: number;
  warehouse: string;
  minStock: number;
  isLowStock?: boolean;
  warning?: string | null;
  lastChanged?: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [warehouseFilter, setWarehouseFilter] = useState('Alle');

  useEffect(() => {
    loadProducts();
  }, [warehouseFilter]);

  const loadProducts = async () => {
    try {
      const url = warehouseFilter === 'Alle' 
        ? `${API_URL}/products`
        : `${API_URL}/products?warehouse=${warehouseFilter}`;
      const response = await apiFetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const scanBarcode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scannedBarcode) return;

    try {
      const response = await apiFetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: scannedBarcode })
      });

      if (response.ok) {
        const product = await response.json();
        setScannedProduct(product);
      } else {
        const errorData = await response.json();
        setScannedProduct(null);
        alert(errorData.error || 'Produkt nicht gefunden');
      }
    } catch (error) {
      console.error('Failed to scan barcode:', error);
      setScannedProduct(null);
      alert('Verbindungsfehler. Ist der Server gestartet?');
    }
  };

  const adjustStock = async (productBarcode: string, quantity: number) => {
    try {
      const response = await apiFetch(`${API_URL}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: productBarcode, quantity })
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setScannedProduct(updatedProduct);
        loadProducts(); // Refresh overview
      } else if (response.status === 400) {
        const errorData = await response.json();
        alert(errorData.error || 'Lagerbestand kann nicht negativ werden');
      } else {
        alert('Fehler beim Aktualisieren des Bestands');
      }
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert('Verbindungsfehler. Ist der Server gestartet?');
    }
  };

  const warehouses = ['Alle', 'Werkstatt', 'Lager'];

  return (
    <div className="app">
      <h1>Lagerbestand Management</h1>

      <div className="scan-section">
        <h2>Barcode scannen</h2>
        <form onSubmit={scanBarcode}>
          <input
            type="text"
            placeholder="Barcode eingeben oder scannen"
            value={scannedBarcode}
            onChange={(e) => setScannedBarcode(e.target.value)}
            className="barcode-input"
          />
          <button type="submit">Scannen</button>
        </form>

        {scannedProduct && (
          <div className={`scanned-product ${scannedProduct.isLowStock ? 'low-stock' : ''}`}>
            <h3>{scannedProduct.name}</h3>
            <p>Barcode: {scannedProduct.barcode}</p>
            <p>Lager: {scannedProduct.warehouse}</p>
            <p className="stock">Aktueller Bestand: {scannedProduct.stock}</p>
            {scannedProduct.warning && (
              <p className="warning">{scannedProduct.warning}</p>
            )}
            {scannedProduct.stock < 3 && (
              <p className="error-message">⚠️ Entnahme nicht möglich – zu wenig auf Lager</p>
            )}
            <div className="action-buttons">
              <button className="add-btn" onClick={() => adjustStock(scannedProduct.barcode, 5)}>
                Add 5
              </button>
              <button 
                className="remove-btn" 
                onClick={() => adjustStock(scannedProduct.barcode, -3)}
                disabled={scannedProduct.stock < 3}
              >
                Remove 3
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="filter-section">
        <label>
          Lager filtern:
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </label>
      </div>

      <div className="products-section">
        <h2>Lagerbestand Übersicht</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div 
              key={product.barcode} 
              className={`product-card ${product.isLowStock ? 'low-stock' : ''}`}
            >
              <h3>{product.name}</h3>
              <p>Barcode: {product.barcode}</p>
              <p>Lager: {product.warehouse}</p>
              <p className="stock">Bestand: {product.stock}</p>
              {product.warning && (
                <p className="warning">{product.warning}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

