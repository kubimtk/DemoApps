/**
 * E2E Tests für FAQ-Tool
 * Testet alle BDD-Szenarien mit echten Datenbankabfragen
 * KEINE MOCKS - nur echte DB-Operationen
 */

const request = require('supertest');
const { app } = require('../src/app');
const { initDatabase, getDatabase, closeDatabase, clearDatabase } = require('../src/database');

// Test-Suite Setup
beforeAll(async () => {
  await initDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

/**
 * Helper Funktionen für wiederkehrende Aktionen
 */

// Login als Admin und hole Session-Cookie
async function loginAsAdmin() {
  const response = await request(app)
    .post('/login')
    .send({ username: 'admin' });
  
  const cookie = response.headers['set-cookie'];
  return cookie;
}

// Erstelle FAQ über API und verifiziere in DB
async function createFaqViaApi(cookie, faqData) {
  const response = await request(app)
    .post('/admin/faq')
    .set('Cookie', cookie)
    .send(faqData);
  
  return response;
}

// Hole FAQ direkt aus DB zur Verifikation
function getFaqFromDb(id) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get('SELECT * FROM faqs WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Zähle FAQs in DB
function countFaqsInDb(kategorie = null) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    const query = kategorie 
      ? 'SELECT COUNT(*) as count FROM faqs WHERE kategorie = ?'
      : 'SELECT COUNT(*) as count FROM faqs';
    const params = kategorie ? [kategorie] : [];
    
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
}

// Hole alle FAQs aus DB
function getAllFaqsFromDb() {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all('SELECT * FROM faqs ORDER BY hilfreich_punkte DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Szenario 1: Admin erstellt FAQ
 * Verifiziert: Business Outcome = FAQ ist in Datenbank sichtbar
 */
describe('Szenario: Admin erstellt FAQ', () => {
  test('Given ich bin als Admin eingeloggt, When ich eine FAQ mit Titel "Versandkosten", Kategorie "Logistik", Inhalt "Ab 50€ gratis" anlege, Then sehe ich "FAQ erfolgreich erstellt" And die FAQ ist in der Datenbank sichtbar', async () => {
    // Given: Als Admin einloggen
    const adminCookie = await loginAsAdmin();
    expect(adminCookie).toBeDefined();
    
    // When: FAQ erstellen
    const response = await createFaqViaApi(adminCookie, {
      titel: 'Versandkosten',
      kategorie: 'Logistik',
      inhalt: 'Ab 50€ gratis'
    });
    
    // Then: Erfolgsmeldung prüfen
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('FAQ erfolgreich erstellt');
    
    // And: FAQ ist in Datenbank sichtbar (BUSINESS OUTCOME)
    const faqId = response.body.faq.id;
    const faqInDb = await getFaqFromDb(faqId);
    
    expect(faqInDb).toBeDefined();
    expect(faqInDb.titel).toBe('Versandkosten');
    expect(faqInDb.kategorie).toBe('Logistik');
    expect(faqInDb.inhalt).toBe('Ab 50€ gratis');
  });
});

/**
 * Szenario 2: User sucht nach Stichwort
 * Verifiziert: Business Outcome = FAQ wird in Suchergebnissen gefunden
 */
describe('Szenario: User sucht nach Stichwort', () => {
  test('Given es gibt eine FAQ "Versandkosten" in Kategorie "Logistik", When ich als User nach "Versand" suche, Then sehe ich die FAQ "Versandkosten" in den Ergebnissen', async () => {
    // Given: FAQ erstellen
    const adminCookie = await loginAsAdmin();
    const createResponse = await createFaqViaApi(adminCookie, {
      titel: 'Versandkosten',
      kategorie: 'Logistik',
      inhalt: 'Ab 50€ gratis'
    });
    
    expect(createResponse.status).toBe(200);
    
    // When: Als User nach "Versand" suchen
    const searchResponse = await request(app)
      .get('/faqs?suche=Versand');
    
    // Then: FAQ in Ergebnissen (BUSINESS OUTCOME)
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.length).toBe(1);
    expect(searchResponse.body[0].titel).toBe('Versandkosten');
    
    // Verifiziere auch in DB
    const faqsInDb = await getAllFaqsFromDb();
    const foundInDb = faqsInDb.some(f => f.titel === 'Versandkosten');
    expect(foundInDb).toBe(true);
  });
});

/**
 * Szenario 3: User filtert nach Kategorie
 * Verifiziert: Business Outcome = Genau die richtige Anzahl FAQs wird angezeigt
 */
describe('Szenario: User filtert nach Kategorie', () => {
  test('Given es gibt 5 FAQs in Kategorie "Logistik" und 3 in "Rechnung", When ich als User Kategorie "Logistik" filter, Then sehe ich genau 5 FAQs', async () => {
    // Given: 5 FAQs in "Logistik" und 3 in "Rechnung" erstellen
    const adminCookie = await loginAsAdmin();
    
    // Erstelle 5 Logistik FAQs
    for (let i = 1; i <= 5; i++) {
      await createFaqViaApi(adminCookie, {
        titel: `Logistik FAQ ${i}`,
        kategorie: 'Logistik',
        inhalt: `Inhalt ${i}`
      });
    }
    
    // Erstelle 3 Rechnung FAQs
    for (let i = 1; i <= 3; i++) {
      await createFaqViaApi(adminCookie, {
        titel: `Rechnung FAQ ${i}`,
        kategorie: 'Rechnung',
        inhalt: `Inhalt ${i}`
      });
    }
    
    // Verifiziere Anzahl in DB
    const logistikCountDb = await countFaqsInDb('Logistik');
    const rechnungCountDb = await countFaqsInDb('Rechnung');
    expect(logistikCountDb).toBe(5);
    expect(rechnungCountDb).toBe(3);
    
    // When: Nach Kategorie "Logistik" filtern
    const filterResponse = await request(app)
      .get('/faqs?kategorie=Logistik');
    
    // Then: Genau 5 FAQs (BUSINESS OUTCOME)
    expect(filterResponse.status).toBe(200);
    expect(filterResponse.body.length).toBe(5);
    expect(filterResponse.body.every(faq => faq.kategorie === 'Logistik')).toBe(true);
  });
});

/**
 * Szenario 4: Admin editiert FAQ
 * Verifiziert: Business Outcome = User sehen den neuen Inhalt sofort
 */
describe('Szenario: Admin editiert FAQ', () => {
  test('Given es gibt eine FAQ "Versandkosten" mit Inhalt "Ab 100€", When ich als Admin den Inhalt zu "Ab 50€ gratis" ändere, Then sehe ich "FAQ aktualisiert" And User sehen den neuen Inhalt sofort', async () => {
    // Given: FAQ mit altem Inhalt erstellen
    const adminCookie = await loginAsAdmin();
    const createResponse = await createFaqViaApi(adminCookie, {
      titel: 'Versandkosten',
      kategorie: 'Logistik',
      inhalt: 'Ab 100€'
    });
    
    const faqId = createResponse.body.faq.id;
    
    // When: Inhalt ändern
    const updateResponse = await request(app)
      .put(`/admin/faq/${faqId}`)
      .set('Cookie', adminCookie)
      .send({ inhalt: 'Ab 50€ gratis' });
    
    // Then: Erfolgsmeldung
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toBe('FAQ aktualisiert');
    
    // And: User sehen neuen Inhalt (BUSINESS OUTCOME)
    const userViewResponse = await request(app)
      .get(`/faq/${faqId}`);
    
    expect(userViewResponse.status).toBe(200);
    expect(userViewResponse.body.inhalt).toBe('Ab 50€ gratis');
    
    // Verifiziere auch in DB
    const faqInDb = await getFaqFromDb(faqId);
    expect(faqInDb.inhalt).toBe('Ab 50€ gratis');
  });
});

/**
 * Szenario 5: Admin löscht FAQ
 * Verifiziert: Business Outcome = User finden die FAQ nicht mehr
 */
describe('Szenario: Admin löscht FAQ', () => {
  test('Given es gibt eine FAQ "Versandkosten", When ich als Admin die FAQ lösche, Then sehe ich "FAQ gelöscht" And User finden die FAQ nicht mehr', async () => {
    // Given: FAQ erstellen
    const adminCookie = await loginAsAdmin();
    const createResponse = await createFaqViaApi(adminCookie, {
      titel: 'Versandkosten',
      kategorie: 'Logistik',
      inhalt: 'Ab 50€ gratis'
    });
    
    const faqId = createResponse.body.faq.id;
    
    // Verifiziere dass FAQ existiert
    let faqInDb = await getFaqFromDb(faqId);
    expect(faqInDb).toBeDefined();
    
    // When: FAQ löschen
    const deleteResponse = await request(app)
      .delete(`/admin/faq/${faqId}`)
      .set('Cookie', adminCookie);
    
    // Then: Erfolgsmeldung
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('FAQ gelöscht');
    
    // And: User finden FAQ nicht mehr (BUSINESS OUTCOME)
    const userViewResponse = await request(app)
      .get(`/faq/${faqId}`);
    
    expect(userViewResponse.status).toBe(404);
    
    // Verifiziere in DB
    faqInDb = await getFaqFromDb(faqId);
    expect(faqInDb).toBeUndefined();
  });
});

/**
 * Szenario 6: User markiert FAQ als hilfreich
 * Verifiziert: Business Outcome = Hilfreich-Punkte werden korrekt erhöht
 */
describe('Szenario: User markiert FAQ als hilfreich', () => {
  test('Given es gibt eine FAQ "Versandkosten" mit Hilfreich-Punkten 0, When ich als User "Hilfreich?" klicke, Then steht "1 Kunde fand diese FAQ hilfreich"', async () => {
    // Given: FAQ mit 0 Punkten erstellen
    const adminCookie = await loginAsAdmin();
    const createResponse = await createFaqViaApi(adminCookie, {
      titel: 'Versandkosten',
      kategorie: 'Logistik',
      inhalt: 'Ab 50€ gratis'
    });
    
    const faqId = createResponse.body.faq.id;
    
    // Verifiziere 0 Punkte in DB
    let faqInDb = await getFaqFromDb(faqId);
    expect(faqInDb.hilfreich_punkte).toBe(0);
    
    // When: Als hilfreich markieren
    const hilfreichResponse = await request(app)
      .post(`/faq/${faqId}/hilfreich`);
    
    // Then: Richtige Nachricht (BUSINESS OUTCOME)
    expect(hilfreichResponse.status).toBe(200);
    expect(hilfreichResponse.body.message).toBe('1 Kunde fand diese FAQ hilfreich');
    expect(hilfreichResponse.body.hilfreich_punkte).toBe(1);
    
    // Verifiziere in DB
    faqInDb = await getFaqFromDb(faqId);
    expect(faqInDb.hilfreich_punkte).toBe(1);
  });
  
  test('Mehrere User können FAQ als hilfreich markieren', async () => {
    // Given: FAQ erstellen
    const adminCookie = await loginAsAdmin();
    const createResponse = await createFaqViaApi(adminCookie, {
      titel: 'Versandkosten',
      kategorie: 'Logistik',
      inhalt: 'Ab 50€ gratis'
    });
    
    const faqId = createResponse.body.faq.id;
    
    // When: 3x als hilfreich markieren
    for (let i = 0; i < 3; i++) {
      await request(app).post(`/faq/${faqId}/hilfreich`);
    }
    
    // Then: 3 Punkte in DB
    const faqInDb = await getFaqFromDb(faqId);
    expect(faqInDb.hilfreich_punkte).toBe(3);
  });
});

/**
 * Szenario 7: User sieht beliebte FAQs
 * Verifiziert: Business Outcome = FAQs sind korrekt nach Beliebtheit sortiert
 */
describe('Szenario: User sieht beliebte FAQs', () => {
  test('Given die FAQ "Rückgabe" hat 10 Hilfreich-Punkte, "Versand" hat 5, When ich als User die FAQ-Seite öffne, Then sehe ich "Rückgabe" vor "Versand" in "Beliebte FAQs"', async () => {
    // Given: Zwei FAQs mit unterschiedlichen Punkten erstellen
    const adminCookie = await loginAsAdmin();
    
    // Erstelle "Versand" FAQ mit 5 Punkten
    const versandResponse = await createFaqViaApi(adminCookie, {
      titel: 'Versand',
      kategorie: 'Logistik',
      inhalt: 'Versand Info'
    });
    const versandId = versandResponse.body.faq.id;
    
    // Erstelle "Rückgabe" FAQ mit 10 Punkten
    const rueckgabeResponse = await createFaqViaApi(adminCookie, {
      titel: 'Rückgabe',
      kategorie: 'Service',
      inhalt: 'Rückgabe Info'
    });
    const rueckgabeId = rueckgabeResponse.body.faq.id;
    
    // Setze Punkte direkt in DB
    const db = getDatabase();
    await new Promise((resolve) => {
      db.run('UPDATE faqs SET hilfreich_punkte = 5 WHERE id = ?', [versandId], resolve);
    });
    await new Promise((resolve) => {
      db.run('UPDATE faqs SET hilfreich_punkte = 10 WHERE id = ?', [rueckgabeId], resolve);
    });
    
    // When: Beliebte FAQs abrufen
    const popularResponse = await request(app)
      .get('/faqs/popular');
    
    // Then: "Rückgabe" kommt vor "Versand" (BUSINESS OUTCOME)
    expect(popularResponse.status).toBe(200);
    expect(popularResponse.body.length).toBe(2);
    expect(popularResponse.body[0].titel).toBe('Rückgabe');
    expect(popularResponse.body[0].hilfreich_punkte).toBe(10);
    expect(popularResponse.body[1].titel).toBe('Versand');
    expect(popularResponse.body[1].hilfreich_punkte).toBe(5);
    
    // Verifiziere Reihenfolge in DB
    const faqsInDb = await getAllFaqsFromDb();
    expect(faqsInDb[0].titel).toBe('Rückgabe');
    expect(faqsInDb[1].titel).toBe('Versand');
  });
});

/**
 * Szenario 8: FAQ-Tags in Suche
 * Verifiziert: Business Outcome = Suche findet FAQs auch über Tags
 */
describe('Szenario: FAQ-Tags in Suche', () => {
  test('Given eine FAQ hat Tags "Paket, Lieferung", When ich als User nach "Paket" suche, Then findet die Suche die FAQ', async () => {
    // Given: FAQ mit Tags erstellen
    const adminCookie = await loginAsAdmin();
    const createResponse = await createFaqViaApi(adminCookie, {
      titel: 'Versandinfo',
      kategorie: 'Logistik',
      inhalt: 'Informationen zum Versand',
      tags: 'Paket, Lieferung'
    });
    
    expect(createResponse.status).toBe(200);
    
    // Verifiziere Tags in DB
    const faqInDb = await getFaqFromDb(createResponse.body.faq.id);
    expect(faqInDb.tags).toBe('Paket, Lieferung');
    
    // When: Nach "Paket" suchen
    const searchResponse = await request(app)
      .get('/faqs?suche=Paket');
    
    // Then: FAQ wird gefunden (BUSINESS OUTCOME)
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.length).toBe(1);
    expect(searchResponse.body[0].titel).toBe('Versandinfo');
    expect(searchResponse.body[0].tags).toContain('Paket');
  });
  
  test('Suche findet FAQ über zweiten Tag', async () => {
    // Given: FAQ mit Tags
    const adminCookie = await loginAsAdmin();
    await createFaqViaApi(adminCookie, {
      titel: 'Versandinfo',
      kategorie: 'Logistik',
      inhalt: 'Informationen zum Versand',
      tags: 'Paket, Lieferung'
    });
    
    // When: Nach "Lieferung" suchen
    const searchResponse = await request(app)
      .get('/faqs?suche=Lieferung');
    
    // Then: FAQ wird gefunden
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.length).toBe(1);
    expect(searchResponse.body[0].tags).toContain('Lieferung');
  });
});

/**
 * Szenario 9: Admin exportiert CSV
 * Verifiziert: Business Outcome = CSV enthält alle FAQs mit korrekten Daten
 */
describe('Szenario: Admin exportiert CSV', () => {
  test('Given es gibt 3 FAQs, When ich als Admin auf "CSV Export" klicke, Then lade ich eine Datei mit 3 FAQs herunter', async () => {
    // Given: 3 FAQs erstellen
    const adminCookie = await loginAsAdmin();
    
    for (let i = 1; i <= 3; i++) {
      await createFaqViaApi(adminCookie, {
        titel: `FAQ ${i}`,
        kategorie: 'Test',
        inhalt: `Inhalt ${i}`
      });
    }
    
    // Verifiziere 3 FAQs in DB
    const count = await countFaqsInDb();
    expect(count).toBe(3);
    
    // When: CSV Export
    const exportResponse = await request(app)
      .get('/admin/export/csv')
      .set('Cookie', adminCookie);
    
    // Then: CSV mit 3 FAQs (BUSINESS OUTCOME)
    expect(exportResponse.status).toBe(200);
    expect(exportResponse.headers['content-type']).toContain('text/csv');
    expect(exportResponse.headers['content-disposition']).toContain('faqs.csv');
    
    // Verifiziere CSV Inhalt
    const csvContent = exportResponse.text;
    const lines = csvContent.split('\n').filter(l => l.trim());
    
    // Header + 3 Datenzeilen
    expect(lines.length).toBeGreaterThanOrEqual(4);
    expect(csvContent).toContain('FAQ 1');
    expect(csvContent).toContain('FAQ 2');
    expect(csvContent).toContain('FAQ 3');
  });
  
  test('CSV Export ohne Admin-Berechtigung wird abgelehnt', async () => {
    const response = await request(app)
      .get('/admin/export/csv');
    
    expect(response.status).toBe(403);
  });
});

/**
 * Szenario 10: Mobile Accordion
 * Verifiziert: Business Outcome = HTML enthält korrekte Accordion-Struktur
 */
describe('Szenario: Mobile Accordion', () => {
  test('Given ich bin auf einem 375px Screen, When ich die FAQ-Seite öffne, Then sehe ich FAQ-Titel als klickbare Accordion-Elemente', async () => {
    // Given: FAQ erstellen
    const adminCookie = await loginAsAdmin();
    await createFaqViaApi(adminCookie, {
      titel: 'Test FAQ',
      kategorie: 'Test',
      inhalt: 'Test Inhalt'
    });
    
    // When: Hauptseite laden
    const response = await request(app)
      .get('/')
      .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15');
    
    // Then: Accordion-Struktur vorhanden (BUSINESS OUTCOME)
    expect(response.status).toBe(200);
    expect(response.text).toContain('faq-item');
    expect(response.text).toContain('faq-header');
    expect(response.text).toContain('faq-content');
    expect(response.text).toContain('onclick="toggleFaq(this)"');
    
    // Verifiziere dass Mobile CSS vorhanden ist
    expect(response.text).toContain('@media (max-width: 375px)');
  });
});

/**
 * Zusätzliche Tests für vollständige Coverage
 */

describe('Zusätzliche Edge Cases', () => {
  test('FAQ ohne Tags wird korrekt gespeichert', async () => {
    const adminCookie = await loginAsAdmin();
    const response = await createFaqViaApi(adminCookie, {
      titel: 'FAQ ohne Tags',
      kategorie: 'Test',
      inhalt: 'Inhalt'
    });
    
    expect(response.status).toBe(200);
    const faqInDb = await getFaqFromDb(response.body.faq.id);
    expect(faqInDb.tags).toBe('');
  });
  
  test('FAQ Update ohne Änderungen schlägt fehl', async () => {
    const adminCookie = await loginAsAdmin();
    const createResponse = await createFaqViaApi(adminCookie, {
      titel: 'Test',
      kategorie: 'Test',
      inhalt: 'Test'
    });
    
    const updateResponse = await request(app)
      .put(`/admin/faq/${createResponse.body.faq.id}`)
      .set('Cookie', adminCookie)
      .send({});
    
    expect(updateResponse.status).toBe(400);
  });
  
  test('Löschen einer nicht existierenden FAQ gibt 404', async () => {
    const adminCookie = await loginAsAdmin();
    const response = await request(app)
      .delete('/admin/faq/99999')
      .set('Cookie', adminCookie);
    
    expect(response.status).toBe(404);
  });
  
  test('FAQ erstellen ohne erforderliche Felder schlägt fehl', async () => {
    const adminCookie = await loginAsAdmin();
    const response = await request(app)
      .post('/admin/faq')
      .set('Cookie', adminCookie)
      .send({ titel: 'Nur Titel' });
    
    expect(response.status).toBe(400);
  });
  
  test('Suche ohne Ergebnisse gibt leeres Array', async () => {
    const response = await request(app)
      .get('/faqs?suche=NichtExistent');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  
  test('Alle FAQs abrufen funktioniert ohne Filter', async () => {
    const adminCookie = await loginAsAdmin();
    await createFaqViaApi(adminCookie, {
      titel: 'FAQ 1',
      kategorie: 'Test1',
      inhalt: 'Inhalt 1'
    });
    await createFaqViaApi(adminCookie, {
      titel: 'FAQ 2',
      kategorie: 'Test2',
      inhalt: 'Inhalt 2'
    });
    
    const response = await request(app).get('/faqs');
    
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

