import { useState, useEffect } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Debug: Log API URL beim Start
console.log('🔧 API_URL:', API_URL);
console.log('🔧 ENV VITE_API_URL:', import.meta.env.VITE_API_URL);

interface Product {
  barcode: string;
  name: string;
  stock: number;
  warehouse: string;
  minStock: number;
  isLowStock?: boolean;
  warning?: string | null;
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
      const response = await fetch(url);
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
      const response = await fetch(`${API_URL}/scan`, {
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
      const response = await fetch(`${API_URL}/adjust`, {
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

