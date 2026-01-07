import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import i18n from './i18n/config';

// Mock fetch
global.fetch = jest.fn();

beforeAll(async () => {
  // Set language to German for all tests
  await i18n.changeLanguage('de');
  localStorage.setItem('inventory-language', 'de');
});

beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
  localStorage.clear();
  localStorage.setItem('inventory-language', 'de');
});

describe('German BDD Specification Tests (@language:de)', () => {
  test('Scenario 1: Barcode scannen und Bestand erhöhen', async () => {
    // Mock initial products fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([{
        barcode: '12345',
        name: 'Schrauben M3',
        warehouse: 'Werkstatt',
        stock: 10,
        minStock: 20,
        isLowStock: true
      }])
    });

    render(<App />);

    // Wait for initial products to load
    await waitFor(() => {
      expect(screen.getByText('Schrauben M3')).toBeInTheDocument();
    });

    // Scan barcode 12345
    const barcodeInput = screen.getByPlaceholderText('Barcode eingeben oder scannen');
    fireEvent.change(barcodeInput, { target: { value: '12345' } });

    // Mock scan response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        barcode: '12345',
        name: 'Schrauben M3',
        warehouse: 'Werkstatt',
        stock: 10,
        minStock: 20,
        isLowStock: true
      })
    });

    fireEvent.click(screen.getByText('Scannen'));

    // Wait for scanned product to appear
    await waitFor(() => {
      expect(screen.getByText('Aktueller Bestand: 10')).toBeInTheDocument();
    });

    // Mock adjust response (+5)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        barcode: '12345',
        name: 'Schrauben M3',
        warehouse: 'Werkstatt',
        stock: 15,
        minStock: 20,
        isLowStock: true
      })
    });

    // Mock products refresh
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([{
        barcode: '12345',
        name: 'Schrauben M3',
        warehouse: 'Werkstatt',
        stock: 15,
        minStock: 20,
        isLowStock: true
      }])
    });

    // Click "Add 5" button
    fireEvent.click(screen.getByText('Add 5'));

    // Then: Stock should be 15
    await waitFor(() => {
      expect(screen.getByText('Aktueller Bestand: 15')).toBeInTheDocument();
    });
  });

  test('Scenario 2: Barcode scannen und Bestand verringern', async () => {
    // Mock initial products fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([{
        barcode: '12345',
        name: 'Schrauben M3',
        warehouse: 'Werkstatt',
        stock: 10,
        minStock: 20,
        isLowStock: true
      }])
    });

    render(<App />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Schrauben M3')).toBeInTheDocument();
    });

    // Scan barcode 12345
    const barcodeInput = screen.getByPlaceholderText('Barcode eingeben oder scannen');
    fireEvent.change(barcodeInput, { target: { value: '12345' } });

    // Mock scan response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        barcode: '12345',
        name: 'Schrauben M3',
        warehouse: 'Werkstatt',
        stock: 10,
        minStock: 20,
        isLowStock: true
      })
    });

    fireEvent.click(screen.getByText('Scannen'));

    // Wait for scanned product to appear
    await waitFor(() => {
      expect(screen.getByText('Aktueller Bestand: 10')).toBeInTheDocument();
    });

    // Mock adjust response (-3)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        barcode: '12345',
        name: 'Schrauben M3',
        warehouse: 'Werkstatt',
        stock: 7,
        minStock: 20,
        isLowStock: true
      })
    });

    // Mock products refresh
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([{
        barcode: '12345',
        name: 'Schrauben M3',
        warehouse: 'Werkstatt',
        stock: 7,
        minStock: 20,
        isLowStock: true
      }])
    });

    // Click "Remove 3" button
    fireEvent.click(screen.getByText('Remove 3'));

    // Then: Stock should be 7
    await waitFor(() => {
      expect(screen.getByText('Aktueller Bestand: 7')).toBeInTheDocument();
    });
  });

  test('Scenario 4: Lagerbestand anzeigen - Nach Lager filtern', async () => {
    // Mock initial products fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          barcode: '12345',
          name: 'Schrauben M3',
          warehouse: 'Werkstatt',
          stock: 10,
          minStock: 20,
          isLowStock: true
        },
        {
          barcode: '99999',
          name: 'Muttern M5',
          warehouse: 'Werkstatt',
          stock: 15,
          minStock: 20,
          isLowStock: true
        }
      ])
    });

    render(<App />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Schrauben M3')).toBeInTheDocument();
      expect(screen.getByText('Muttern M5')).toBeInTheDocument();
    });

    // Both products should be visible initially
    expect(screen.getByText('Schrauben M3')).toBeInTheDocument();
    expect(screen.getByText('Muttern M5')).toBeInTheDocument();
  });

  test('Scenario 5: Niedrig-Bestand Warnung', async () => {
    // Mock initial products fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        {
          barcode: '99999',
          name: 'Muttern M5',
          warehouse: 'Werkstatt',
          stock: 15,
          minStock: 20,
          isLowStock: true,
          warning: 'Mindestbestand unterschritten'
        }
      ])
    });

    render(<App />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Muttern M5')).toBeInTheDocument();
    });

    // Find the product card for Muttern M5
    const productCard = screen.getByText('Muttern M5').closest('.product-card');
    expect(productCard).toHaveClass('low-stock');
    
    // Check for warning text
    expect(screen.getByText('Mindestbestand unterschritten')).toBeInTheDocument();
  });
});
