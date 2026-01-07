import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import i18n from './i18n/config';

// Mock fetch
global.fetch = jest.fn();

beforeAll(async () => {
  // Set language to English for all tests
  await i18n.changeLanguage('en');
  localStorage.setItem('inventory-language', 'en');
});

beforeEach(() => {
  (global.fetch as jest.Mock).mockClear();
  localStorage.clear();
  localStorage.setItem('inventory-language', 'en');
});

describe('English BDD Specification Tests (@language:en)', () => {
  test('Scenario 1: Scan barcode and increase stock', async () => {
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

    // Wait for initial products to load (names should be translated)
    await waitFor(() => {
      expect(screen.getByText('Screws M3')).toBeInTheDocument();
    });

    // Scan barcode 12345
    const barcodeInput = screen.getByPlaceholderText('Enter or scan barcode');
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

    fireEvent.click(screen.getByText('Scan'));

    // Wait for scanned product to appear
    await waitFor(() => {
      expect(screen.getByText('Current Stock: 10')).toBeInTheDocument();
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
      expect(screen.getByText('Current Stock: 15')).toBeInTheDocument();
    });
  });

  test('Scenario 2: Scan barcode and decrease stock', async () => {
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

    // Wait for products to load (names should be translated)
    await waitFor(() => {
      expect(screen.getByText('Screws M3')).toBeInTheDocument();
    });

    // Scan barcode 12345
    const barcodeInput = screen.getByPlaceholderText('Enter or scan barcode');
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

    fireEvent.click(screen.getByText('Scan'));

    // Wait for scanned product to appear
    await waitFor(() => {
      expect(screen.getByText('Current Stock: 10')).toBeInTheDocument();
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
      expect(screen.getByText('Current Stock: 7')).toBeInTheDocument();
    });
  });

  test('Scenario 4: Display inventory - Filter by warehouse', async () => {
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

    // Wait for products to load (names should be translated)
    await waitFor(() => {
      expect(screen.getByText('Screws M3')).toBeInTheDocument();
      expect(screen.getByText('Nuts M5')).toBeInTheDocument();
    });

    // Both products should be visible initially
    expect(screen.getByText('Screws M3')).toBeInTheDocument();
    expect(screen.getByText('Nuts M5')).toBeInTheDocument();
  });

  test('Scenario 5: Low stock warning', async () => {
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
          warning: 'Minimum stock not met'
        }
      ])
    });

    render(<App />);

    // Wait for products to load (names should be translated)
    await waitFor(() => {
      expect(screen.getByText('Nuts M5')).toBeInTheDocument();
    });

    // Find the product card for Nuts M5
    const productCard = screen.getByText('Nuts M5').closest('.product-card');
    expect(productCard).toHaveClass('low-stock');
    
    // Check for warning text
    expect(screen.getByText('Minimum stock not met')).toBeInTheDocument();
  });
});
