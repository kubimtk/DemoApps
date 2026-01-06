/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import './i18n/config';
import { API_URL } from './config';

// Debug: Log API URL beim Start
console.log('🔧 API_URL:', API_URL);

// ============================================================================
// MOCK DATA - Basierend auf BDD Szenarien aus inventory.feature
// ============================================================================

// Mock-Modus: Aktiviert auf Vercel
const isMockMode = typeof window !== 'undefined' && window.location.hostname.includes('vercel');

console.log('🎭 Mock Mode:', isMockMode ? 'ACTIVE (Vercel)' : 'DISABLED (using real API)');

// Initial Mock-Daten (BDD-konform)
// Note: Product names remain in German as they are product identifiers, not UI text
function getInitialMockData() {
  return [
    {
      barcode: '12345',
      name: 'Schrauben M3',
      stock: 10,
      warehouse: 'Werkstatt',
      minStock: 20,
      lastChanged: new Date().toISOString(),
      isLowStock: true,
      warning: 'low_stock' // Translation key
    },
    {
      barcode: '99999',
      name: 'Muttern M5',
      stock: 15,
      warehouse: 'Werkstatt',
      minStock: 20,
      lastChanged: new Date().toISOString(),
      isLowStock: true,
      warning: 'low_stock' // Translation key
    }
  ];
}

const INITIAL_MOCK_DATA = getInitialMockData();

// Mock Store mit localStorage-Persistierung
const STORAGE_KEY = 'inventory-mock-store';

function initMockStore() {
  if (!isMockMode) return { products: [] };
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('🎭 Mock Store: Loaded from localStorage', parsed.products.length, 'products');
      return parsed;
    }
  } catch (error) {
    console.warn('🎭 Mock Store: Failed to load from localStorage', error);
  }
  
  console.log('🎭 Mock Store: Initialized with default data');
  return { products: [...INITIAL_MOCK_DATA] };
}

function saveMockStore(store: typeof mockStore) {
  if (!isMockMode) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    console.log('🎭 Mock Store: Saved to localStorage');
  } catch (error) {
    console.warn('🎭 Mock Store: Failed to save to localStorage', error);
  }
}

function resetMockStore() {
  if (!isMockMode) return;
  
  localStorage.removeItem(STORAGE_KEY);
  mockStore.products = [...INITIAL_MOCK_DATA];
  console.log('🎭 Mock Store: Reset to initial data');
}

// Mock Store initialisieren
const mockStore = initMockStore();

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
      products = products.filter((p: any) => p.warehouse === warehouse);
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

    const product = mockStore.products.find((p: any) => p.barcode === barcode);

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

    const product = mockStore.products.find((p: any) => p.barcode === barcode);

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

    // Persistiere Änderungen in localStorage
    saveMockStore(mockStore);

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
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [warehouseFilter, setWarehouseFilter] = useState('Alle');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('inventory-language', lng);
  };

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
        alert(errorData.error || t('scanner.productNotFound'));
      }
    } catch (error) {
      console.error('Failed to scan barcode:', error);
      setScannedProduct(null);
      alert(t('scanner.connectionError'));
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
        alert(errorData.error || t('product.negativeStockError'));
      } else {
        alert(t('product.updateError'));
      }
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert(t('scanner.connectionError'));
    }
  };

  const handleResetMockData = () => {
    if (isMockMode && confirm(t('app.resetConfirm'))) {
      resetMockStore();
      loadProducts();
      setScannedProduct(null);
      alert(t('app.resetSuccess'));
    }
  };

  const warehouses = ['Alle', 'Werkstatt', 'Lager'];

  return (
    <div className="app">
      <div className="header">
        <h1>{t('app.title')}</h1>
        <div className="language-switcher">
          <button 
            className={i18n.language === 'de' ? 'active' : ''}
            onClick={() => changeLanguage('de')}
          >
            🇩🇪 DE
          </button>
          <button 
            className={i18n.language === 'en' ? 'active' : ''}
            onClick={() => changeLanguage('en')}
          >
            🇬🇧 EN
          </button>
        </div>
      </div>
      {isMockMode && (
        <div style={{ padding: '10px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            🎭 <strong>{t('app.mockMode')}</strong> - {t('app.mockModeDescription')}
            <button 
              onClick={handleResetMockData}
              style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
            >
              🔄 {t('app.resetData')}
            </button>
          </p>
        </div>
      )}

      <div className="scan-section">
        <h2>{t('scanner.title')}</h2>
        <form onSubmit={scanBarcode}>
          <input
            type="text"
            placeholder={t('scanner.inputPlaceholder')}
            value={scannedBarcode}
            onChange={(e) => setScannedBarcode(e.target.value)}
            className="barcode-input"
          />
          <button type="submit">{t('scanner.scanButton')}</button>
        </form>

        {scannedProduct && (
          <div className={`scanned-product ${scannedProduct.isLowStock ? 'low-stock' : ''}`}>
            <h3>{scannedProduct.name}</h3>
            <p>{t('product.barcode')}: {scannedProduct.barcode}</p>
            <p>{t('product.warehouse')}: {scannedProduct.warehouse}</p>
            <p className="stock">{t('product.currentStock')}: {scannedProduct.stock}</p>
            {scannedProduct.warning && (
              <p className="warning">{t('product.lowStockWarning')}</p>
            )}
            {scannedProduct.stock < 3 && (
              <p className="error-message">⚠️ {t('product.removeError')}</p>
            )}
            <div className="action-buttons">
              <button className="add-btn" onClick={() => adjustStock(scannedProduct.barcode, 5)}>
                {t('actions.add5')}
              </button>
              <button 
                className="remove-btn" 
                onClick={() => adjustStock(scannedProduct.barcode, -3)}
                disabled={scannedProduct.stock < 3}
              >
                {t('actions.remove3')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="filter-section">
        <label>
          {t('filter.label')}:
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
            {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </label>
      </div>

      <div className="products-section">
        <h2>{t('overview.title')}</h2>
        <div className="products-grid">
          {products.map((product) => (
            <div 
              key={product.barcode} 
              className={`product-card ${product.isLowStock ? 'low-stock' : ''}`}
            >
              <h3>{product.name}</h3>
              <p>{t('product.barcode')}: {product.barcode}</p>
              <p>{t('product.warehouse')}: {product.warehouse}</p>
              <p className="stock">{t('product.stock')}: {product.stock}</p>
              {product.warning && (
                <p className="warning">{t('product.lowStockWarning')}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

