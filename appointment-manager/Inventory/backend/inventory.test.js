import request from 'supertest';
import { app, initDb, clearDb } from './server.js';

let db;

beforeAll(async () => {
  db = await initDb();
});

beforeEach(() => {
  clearDb(db);
});

afterAll(() => {
  db.close();
});

describe('Scenario 1: Barcode scannen und Bestand erhöhen', () => {
  test('should increase stock by 5 when scanning barcode 12345', async () => {
    // Given: ein Produkt mit Barcode "12345" und Name "Schrauben M3" (seeded at startup with stock 10)
    // Product already exists from initDb seeding

    // When: ich Barcode "12345" scannen und Menge 5 hinzufügen
    const response = await request(app)
      .post('/api/products/12345/adjust')
      .send({ quantity: 5 });

    // Then: Lagerbestand ist 15
    expect(response.status).toBe(200);
    expect(response.body.stock).toBe(15);
    expect(response.body.name).toBe('Schrauben M3');
    
    // And: letzte Änderung ist heute
    const today = new Date().toISOString().split('T')[0];
    const lastChange = new Date(response.body.lastChanged).toISOString().split('T')[0];
    expect(lastChange).toBe(today);
  });
});

describe('Scenario 2: Barcode scannen und Bestand verringern', () => {
  test('should decrease stock by 3 and log consumption', async () => {
    // Given: ein Produkt mit Barcode "12345" und aktueller Lagerbestand ist 10 (from seeding)
    // Product already exists from initDb seeding

    // When: ich Barcode "12345" scannen und Menge 3 entnehmen
    const response = await request(app)
      .post('/api/products/12345/adjust')
      .send({ quantity: -3 });

    // Then: Lagerbestand ist 7
    expect(response.status).toBe(200);
    expect(response.body.stock).toBe(7);
    expect(response.body.name).toBe('Schrauben M3');
    
    // And: Verbrauch wird protokolliert
    const logsResponse = await request(app).get('/api/products/12345/logs');
    expect(logsResponse.body.length).toBeGreaterThan(0);
    expect(logsResponse.body[0].quantity).toBe(-3);
  });
});

describe('Scenario 3: Neues Produkt anlegen', () => {
  test('should create new product with initial stock 0', async () => {
    // Given: kein Produkt mit Barcode "77777" existiert
    const checkResponse = await request(app).get('/api/products/77777');
    expect(checkResponse.status).toBe(404);

    // When: ich ein neues Produkt anlege
    const response = await request(app)
      .post('/api/products')
      .send({ barcode: '77777', name: 'Muttern M8', warehouse: 'Lager' });

    // Then: Produkt ist gespeichert
    expect(response.status).toBe(201);
    expect(response.body.barcode).toBe('77777');
    expect(response.body.name).toBe('Muttern M8');
    expect(response.body.warehouse).toBe('Lager');
    
    // And: Lagerbestand ist 0
    expect(response.body.stock).toBe(0);
  });
});

describe('Scenario 4: Lagerbestand anzeigen', () => {
  test('should display all products and filter by warehouse', async () => {
    // Given: Produkte in der Datenbank (2 from seeding + 1 new)
    // Products 12345 and 99999 already exist from seeding
    await request(app)
      .post('/api/products')
      .send({ barcode: '333', name: 'Product 3', stock: 30, warehouse: 'Lager' });

    // When: ich die Übersicht aufrufe
    const response = await request(app).get('/api/products');

    // Then: ich sehe alle Produkte mit Barcode, Name, Bestand
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    expect(response.body[0]).toHaveProperty('barcode');
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('stock');

    // And: ich kann nach Lager filtern
    const filteredResponse = await request(app).get('/api/products?warehouse=Werkstatt');
    expect(filteredResponse.status).toBe(200);
    expect(filteredResponse.body.length).toBe(2); // 12345 and 99999 are both in Werkstatt
    expect(filteredResponse.body.every(p => p.warehouse === 'Werkstatt')).toBe(true);
  });
});

describe('Scenario 5: Niedrig-Bestand Warnung', () => {
  test('should mark product as low stock when below minimum of 20', async () => {
    // Given: Produkt "99999" (Muttern M5) hat Mindestbestand 20 und aktueller Bestand ist 15 (from seeding)
    // Seeded product 99999 has stock 15 and minStock 20

    // When: ich die Übersicht öffne
    const response = await request(app).get('/api/products');

    // Then: Produkt ist rot markiert (isLowStock flag)
    expect(response.status).toBe(200);
    const product = response.body.find(p => p.barcode === '99999');
    expect(product).toBeDefined();
    expect(product.stock).toBe(15);
    expect(product.minStock).toBe(20);
    expect(product.isLowStock).toBe(true);
    
    // And: ich sehe Warnung "Mindestbestand unterschritten"
    expect(product.warning).toBe('Mindestbestand unterschritten');
  });
});

