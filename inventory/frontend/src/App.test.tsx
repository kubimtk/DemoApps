import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch
global.fetch = jest.fn();

beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
});

describe('Frontend Integration Tests', () => {
  test('Scenario 1: Scan barcode and Add 5 to stock', async () => {
    // Mock initial products list (with seeded data)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{
        barcode: '12345',
        name: 'Screws M3',
        warehouse: 'Workshop',
        stock: 10,
        minStock: 20,
        isLowStock: true,
        warning: 'Minimum stock not met'
      }]
    });

    render(<App />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Screws M3')).toBeInTheDocument();
    });

    // Scan barcode 12345
    const barcodeInput = screen.getByPlaceholderText('Enter or scan barcode');
    fireEvent.change(barcodeInput, { target: { value: '12345' } });

    // Mock POST /api/scan
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        barcode: '12345',
        name: 'Screws M3',
        warehouse: 'Workshop',
        stock: 10,
        minStock: 20,
        isLowStock: true,
        warning: 'Minimum stock not met'
      })
    });

    fireEvent.click(screen.getByText('Scannen'));

    // Wait for scanned product to appear
    await waitFor(() => {
      expect(screen.getByText('Aktueller Bestand: 10')).toBeInTheDocument();
    });

    // Mock POST /api/adjust (+5)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        barcode: '12345',
        name: 'Schrauben M3',
        stock: 15,
        warehouse: 'Werkstatt',
        minStock: 20,
        isLowStock: true,
        warning: 'Minimum stock not met'
      })
    });

    // Mock products list refresh
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{
        barcode: '12345',
        name: 'Screws M3',
        warehouse: 'Workshop',
        stock: 15,
        minStock: 20,
        isLowStock: true,
        warning: 'Minimum stock not met'
      }]
    });

    // Click "Add 5" button
    fireEvent.click(screen.getByText('Add 5'));

    // Then: Stock should be 15
    await waitFor(() => {
      expect(screen.getByText('Aktueller Bestand: 15')).toBeInTheDocument();
    });
  });

  test('Scenario 2: Scan barcode and Remove 3 from stock', async () => {
    const product = {
      barcode: '12345',
      name: 'Schrauben M3',
      warehouse: 'Werkstatt',
      stock: 10,
      minStock: 20,
      isLowStock: true,
      warning: 'Mindestbestand unterschritten'
    };

    // Mock initial products
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [product]
    });

    render(<App />);

    // Wait for product to load in overview
    await waitFor(() => {
      expect(screen.getByText('Screws M3')).toBeInTheDocument();
    });

    // Scan barcode
    const barcodeInput = screen.getByPlaceholderText('Enter or scan barcode');
    fireEvent.change(barcodeInput, { target: { value: '12345' } });

    // Mock POST /api/scan
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => product
    });

    fireEvent.click(screen.getByText('Scannen'));

    // Wait for scanned product
    await waitFor(() => {
      expect(screen.getByText('Aktueller Bestand: 10')).toBeInTheDocument();
    });

    // Mock POST /api/adjust (-3)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        ...product, 
        stock: 7,
        isLowStock: true,
        warning: 'Minimum stock not met'
      })
    });

    // Mock refreshed product list
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ ...product, stock: 7 }]
    });

    fireEvent.click(screen.getByText('Remove 3'));

    // Then: Stock should be 7
    await waitFor(() => {
      expect(screen.getByText('Aktueller Bestand: 7')).toBeInTheDocument();
    });
  });

  test('Scenario 5: Low stock warning displayed', async () => {
    const lowStockProduct = {
      barcode: '99999',
      name: 'Muttern M5',
      warehouse: 'Werkstatt',
      stock: 15,
      minStock: 20,
      isLowStock: true,
      warning: 'Mindestbestand unterschritten'
    };

    // Mock products with low stock (seeded data)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [lowStockProduct]
    });

    render(<App />);

    // Then: Product should be marked red and show warning in overview
    await waitFor(() => {
      expect(screen.getByText('Nuts M5')).toBeInTheDocument();
      expect(screen.getByText('Minimum stock not met')).toBeInTheDocument();
      
      // Check if product card has low-stock class
      const productCard = screen.getByText('Muttern M5').closest('.product-card');
      expect(productCard).toHaveClass('low-stock');
    });
  });

  test('Scenario 4: Filter by warehouse', async () => {
    const products = [
      {
        barcode: '12345',
        name: 'Screws M3',
        warehouse: 'Workshop',
        stock: 10,
        minStock: 20,
        isLowStock: true,
        warning: 'Minimum stock not met'
      },
      {
        barcode: '99999',
        name: 'Nuts M5',
        warehouse: 'Workshop',
        stock: 15,
        minStock: 20,
        isLowStock: true,
        warning: 'Minimum stock not met'
      },
      {
        barcode: '333',
        name: 'Storage Product',
        warehouse: 'Storage',
        stock: 25,
        minStock: 20,
        isLowStock: false,
        warning: null
      }
    ];

    // Mock initial products (all)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => products
    });

    render(<App />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Screws M3')).toBeInTheDocument();
      expect(screen.getByText('Nuts M5')).toBeInTheDocument();
      expect(screen.getByText('Storage Product')).toBeInTheDocument();
    });

    // Mock filtered products (for Werkstatt only)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [products[0], products[1]]
    });

    // Filter by Werkstatt
    const warehouseFilter = screen.getByDisplayValue('Alle');
    fireEvent.change(warehouseFilter, { target: { value: 'Werkstatt' } });

    // Then: Only Werkstatt products should be visible
    await waitFor(() => {
      expect(screen.getByText('Screws M3')).toBeInTheDocument();
      expect(screen.getByText('Nuts M5')).toBeInTheDocument();
      expect(screen.queryByText('Storage Product')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

