/**
 * Zusätzliche Tests für Test Coverage >80%
 * Deckt Error Cases und View Rendering ab
 */

const request = require('supertest');
const { app } = require('../src/app');
const { initDatabase, getDatabase, closeDatabase, clearDatabase } = require('../src/database');

beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

// Helper: Login als Admin
async function loginAsAdmin() {
  const response = await request(app)
    .post('/login')
    .send({ username: 'admin' });
  return response.headers['set-cookie'];
}

// Helper: Erstelle FAQ
async function createFaq(cookie, data) {
  return await request(app)
    .post('/admin/faq')
    .set('Cookie', cookie)
    .send(data);
}

/**
 * Tests für View Rendering
 */
describe('View Rendering Tests', () => {
  test('GET / rendert Hauptseite mit EJS', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('FAQ-Tool');
    expect(response.text).toContain('Beliebte FAQs');
  });
  
  test('GET / zeigt FAQs in View an', async () => {
    const adminCookie = await loginAsAdmin();
    await createFaq(adminCookie, {
      titel: 'Test FAQ',
      kategorie: 'Test',
      inhalt: 'Test Inhalt'
    });
    
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('Test FAQ');
    expect(response.text).toContain('Test Inhalt');
  });
  
  test('GET /admin rendert Admin Dashboard', async () => {
    const adminCookie = await loginAsAdmin();
    
    const response = await request(app)
      .get('/admin')
      .set('Cookie', adminCookie);
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('Admin Dashboard');
  });
  
  test('GET /admin ohne Admin-Berechtigung gibt 403', async () => {
    const response = await request(app).get('/admin');
    
    expect(response.status).toBe(403);
  });
});

/**
 * Tests für Login/Logout
 */
describe('Authentifizierung Tests', () => {
  test('POST /login erstellt neuen User wenn nicht vorhanden', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'newuser' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.rolle).toBe('user');
  });
  
  test('POST /login für existierenden Admin funktioniert', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'admin' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.rolle).toBe('admin');
  });
  
  test('GET /logout zerstört Session und redirected', async () => {
    const adminCookie = await loginAsAdmin();
    
    const response = await request(app)
      .get('/logout')
      .set('Cookie', adminCookie);
    
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/');
  });
});

/**
 * Tests für Error Handling in Admin Endpoints
 */
describe('Admin Endpoint Error Handling', () => {
  test('POST /admin/faq ohne Admin-Cookie gibt 403', async () => {
    const response = await request(app)
      .post('/admin/faq')
      .send({
        titel: 'Test',
        kategorie: 'Test',
        inhalt: 'Test'
      });
    
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('Admin-Berechtigung erforderlich');
  });
  
  test('PUT /admin/faq/:id ohne Admin-Cookie gibt 403', async () => {
    const response = await request(app)
      .put('/admin/faq/1')
      .send({ inhalt: 'Test' });
    
    expect(response.status).toBe(403);
  });
  
  test('DELETE /admin/faq/:id ohne Admin-Cookie gibt 403', async () => {
    const response = await request(app)
      .delete('/admin/faq/1');
    
    expect(response.status).toBe(403);
  });
  
  test('PUT /admin/faq/:id mit nicht existierender ID gibt 404', async () => {
    const adminCookie = await loginAsAdmin();
    
    const response = await request(app)
      .put('/admin/faq/99999')
      .set('Cookie', adminCookie)
      .send({ inhalt: 'Neuer Inhalt' });
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('FAQ nicht gefunden');
  });
  
  test('POST /admin/faq ohne Titel gibt 400', async () => {
    const adminCookie = await loginAsAdmin();
    
    const response = await request(app)
      .post('/admin/faq')
      .set('Cookie', adminCookie)
      .send({ kategorie: 'Test', inhalt: 'Test' });
    
    expect(response.status).toBe(400);
  });
  
  test('POST /admin/faq ohne Kategorie gibt 400', async () => {
    const adminCookie = await loginAsAdmin();
    
    const response = await request(app)
      .post('/admin/faq')
      .set('Cookie', adminCookie)
      .send({ titel: 'Test', inhalt: 'Test' });
    
    expect(response.status).toBe(400);
  });
  
  test('POST /admin/faq ohne Inhalt gibt 400', async () => {
    const adminCookie = await loginAsAdmin();
    
    const response = await request(app)
      .post('/admin/faq')
      .set('Cookie', adminCookie)
      .send({ titel: 'Test', kategorie: 'Test' });
    
    expect(response.status).toBe(400);
  });
});

/**
 * Tests für User Endpoints Error Handling
 */
describe('User Endpoint Error Handling', () => {
  test('GET /faq/:id mit nicht existierender ID gibt 404', async () => {
    const response = await request(app).get('/faq/99999');
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('FAQ nicht gefunden');
  });
  
  test('POST /faq/:id/hilfreich mit nicht existierender ID gibt 404', async () => {
    const response = await request(app).post('/faq/99999/hilfreich');
    
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('FAQ nicht gefunden');
  });
});

/**
 * Tests für komplexe Suche und Filter
 */
describe('Erweiterte Suche und Filter Tests', () => {
  test('GET /faqs mit Kategorie und Suche kombiniert', async () => {
    const adminCookie = await loginAsAdmin();
    
    await createFaq(adminCookie, {
      titel: 'Versand Info',
      kategorie: 'Logistik',
      inhalt: 'Versandkosten Info'
    });
    
    await createFaq(adminCookie, {
      titel: 'Rechnung Info',
      kategorie: 'Rechnung',
      inhalt: 'Rechnungsinfo'
    });
    
    const response = await request(app)
      .get('/faqs?kategorie=Logistik&suche=Versand');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].titel).toBe('Versand Info');
  });
  
  test('GET /faqs findet FAQs über Inhalt-Suche', async () => {
    const adminCookie = await loginAsAdmin();
    
    await createFaq(adminCookie, {
      titel: 'Test',
      kategorie: 'Test',
      inhalt: 'Spezifischer Suchbegriff hier'
    });
    
    const response = await request(app)
      .get('/faqs?suche=Spezifischer');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });
  
  test('GET /faqs/popular funktioniert ohne FAQs', async () => {
    const response = await request(app).get('/faqs/popular');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

/**
 * Tests für FAQ Update mit verschiedenen Feldern
 */
describe('FAQ Update Tests', () => {
  test('PUT /admin/faq/:id kann nur Titel ändern', async () => {
    const adminCookie = await loginAsAdmin();
    
    const createResponse = await createFaq(adminCookie, {
      titel: 'Alter Titel',
      kategorie: 'Test',
      inhalt: 'Test'
    });
    
    const faqId = createResponse.body.faq.id;
    
    const updateResponse = await request(app)
      .put(`/admin/faq/${faqId}`)
      .set('Cookie', adminCookie)
      .send({ titel: 'Neuer Titel' });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.faq.titel).toBe('Neuer Titel');
    expect(updateResponse.body.faq.kategorie).toBe('Test');
  });
  
  test('PUT /admin/faq/:id kann nur Kategorie ändern', async () => {
    const adminCookie = await loginAsAdmin();
    
    const createResponse = await createFaq(adminCookie, {
      titel: 'Test',
      kategorie: 'Alte Kategorie',
      inhalt: 'Test'
    });
    
    const faqId = createResponse.body.faq.id;
    
    const updateResponse = await request(app)
      .put(`/admin/faq/${faqId}`)
      .set('Cookie', adminCookie)
      .send({ kategorie: 'Neue Kategorie' });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.faq.kategorie).toBe('Neue Kategorie');
  });
  
  test('PUT /admin/faq/:id kann Tags ändern', async () => {
    const adminCookie = await loginAsAdmin();
    
    const createResponse = await createFaq(adminCookie, {
      titel: 'Test',
      kategorie: 'Test',
      inhalt: 'Test',
      tags: 'alt'
    });
    
    const faqId = createResponse.body.faq.id;
    
    const updateResponse = await request(app)
      .put(`/admin/faq/${faqId}`)
      .set('Cookie', adminCookie)
      .send({ tags: 'neu, geändert' });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.faq.tags).toBe('neu, geändert');
  });
  
  test('PUT /admin/faq/:id kann mehrere Felder gleichzeitig ändern', async () => {
    const adminCookie = await loginAsAdmin();
    
    const createResponse = await createFaq(adminCookie, {
      titel: 'Alt',
      kategorie: 'Alt',
      inhalt: 'Alt'
    });
    
    const faqId = createResponse.body.faq.id;
    
    const updateResponse = await request(app)
      .put(`/admin/faq/${faqId}`)
      .set('Cookie', adminCookie)
      .send({
        titel: 'Neu',
        kategorie: 'Neu',
        inhalt: 'Neu',
        tags: 'neu'
      });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.faq.titel).toBe('Neu');
    expect(updateResponse.body.faq.kategorie).toBe('Neu');
    expect(updateResponse.body.faq.inhalt).toBe('Neu');
    expect(updateResponse.body.faq.tags).toBe('neu');
  });
});

/**
 * Tests für CSV Export Details
 */
describe('CSV Export Details', () => {
  test('CSV Export enthält alle Spalten', async () => {
    const adminCookie = await loginAsAdmin();
    
    await createFaq(adminCookie, {
      titel: 'Test FAQ',
      kategorie: 'Test',
      inhalt: 'Test Inhalt',
      tags: 'test, tags'
    });
    
    const response = await request(app)
      .get('/admin/export/csv')
      .set('Cookie', adminCookie);
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('id');
    expect(response.text).toContain('titel');
    expect(response.text).toContain('kategorie');
    expect(response.text).toContain('inhalt');
    expect(response.text).toContain('tags');
    expect(response.text).toContain('hilfreich_punkte');
  });
  
  test('CSV Export mit leerer Datenbank funktioniert', async () => {
    const adminCookie = await loginAsAdmin();
    
    const response = await request(app)
      .get('/admin/export/csv')
      .set('Cookie', adminCookie);
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
  });
});

/**
 * Tests für Hilfreich-Funktion Details
 */
describe('Hilfreich-Funktion Details', () => {
  test('Hilfreich-Nachricht für Plural (2+ Kunden)', async () => {
    const adminCookie = await loginAsAdmin();
    
    const createResponse = await createFaq(adminCookie, {
      titel: 'Test',
      kategorie: 'Test',
      inhalt: 'Test'
    });
    
    const faqId = createResponse.body.faq.id;
    
    // Markiere 2x als hilfreich
    await request(app).post(`/faq/${faqId}/hilfreich`);
    const response = await request(app).post(`/faq/${faqId}/hilfreich`);
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('2 Kunden fanden diese FAQ hilfreich');
  });
});

/**
 * Integration Test: Kompletter User Flow
 */
describe('Kompletter E2E User Flow', () => {
  test('Admin erstellt FAQ, User findet sie, markiert als hilfreich, Admin exportiert', async () => {
    // 1. Admin login
    const adminCookie = await loginAsAdmin();
    
    // 2. Admin erstellt FAQ
    const createResponse = await createFaq(adminCookie, {
      titel: 'Integration Test FAQ',
      kategorie: 'Test',
      inhalt: 'Dies ist ein Integrations-Test',
      tags: 'integration, test'
    });
    
    expect(createResponse.status).toBe(200);
    const faqId = createResponse.body.faq.id;
    
    // 3. User sucht nach FAQ
    const searchResponse = await request(app)
      .get('/faqs?suche=Integration');
    
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.length).toBe(1);
    
    // 4. User öffnet FAQ Details
    const detailResponse = await request(app)
      .get(`/faq/${faqId}`);
    
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.titel).toBe('Integration Test FAQ');
    
    // 5. User markiert als hilfreich
    const hilfreichResponse = await request(app)
      .post(`/faq/${faqId}/hilfreich`);
    
    expect(hilfreichResponse.status).toBe(200);
    expect(hilfreichResponse.body.hilfreich_punkte).toBe(1);
    
    // 6. FAQ erscheint in beliebten FAQs
    const popularResponse = await request(app)
      .get('/faqs/popular');
    
    expect(popularResponse.status).toBe(200);
    expect(popularResponse.body[0].id).toBe(faqId);
    
    // 7. Admin exportiert CSV
    const exportResponse = await request(app)
      .get('/admin/export/csv')
      .set('Cookie', adminCookie);
    
    expect(exportResponse.status).toBe(200);
    expect(exportResponse.text).toContain('Integration Test FAQ');
  });
});

