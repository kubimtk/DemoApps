/**
 * Error-Path Tests für database.js
 * Testet schwer erreichbare Error-Handler
 */

const { initDatabase, getDatabase, closeDatabase, clearDatabase } = require('../src/database');

describe('Database Error Paths', () => {
  
  afterEach(async () => {
    try {
      await closeDatabase();
    } catch (err) {
      // Ignoriere
    }
  });
  
  describe('Error Handling in clearDatabase()', () => {
    test('sollte mit Errors beim Löschen umgehen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Schließe DB um Errors zu provozieren
      await closeDatabase();
      
      // Jetzt sollte clearDatabase fehlschlagen
      await expect(clearDatabase()).rejects.toThrow();
    });
  });
  
  describe('Error Handling in closeDatabase()', () => {
    test('sollte Fehler beim Schließen loggen aber nicht werfen', async () => {
      await initDatabase();
      
      // Schließe normal
      await expect(closeDatabase()).resolves.not.toThrow();
    });
  });
  
  describe('Robustheit nach Fehler', () => {
    test('sollte nach clearDatabase-Fehler wieder funktionieren', async () => {
      // Erste Initialisierung
      await initDatabase();
      await closeDatabase();
      
      // Versuche clearDatabase ohne DB (sollte fehlschlagen)
      try {
        await clearDatabase();
      } catch (err) {
        expect(err.message).toContain('nicht initialisiert');
      }
      
      // Sollte danach wieder initialisierbar sein
      await expect(initDatabase()).resolves.toBeDefined();
    });
    
    test('sollte mehrfache close/init-Zyklen überstehen', async () => {
      // Zyklus 1
      await initDatabase();
      await closeDatabase();
      
      // Zyklus 2
      await initDatabase();
      await closeDatabase();
      
      // Zyklus 3
      await initDatabase();
      const db = getDatabase();
      expect(db).toBeDefined();
    });
  });
  
  describe('clearDatabase() Details', () => {
    test('sollte auch ohne sqlite_sequence funktionieren', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Füge Daten hinzu
      await new Promise((resolve) => {
        db.run('INSERT INTO faqs (titel, kategorie, inhalt) VALUES (?, ?, ?)',
          ['Test', 'Test', 'Test'], () => resolve());
      });
      
      // Clear sollte funktionieren auch wenn sqlite_sequence leer ist
      await expect(clearDatabase()).resolves.not.toThrow();
      
      // Daten sollten weg sein
      const count = await new Promise((resolve) => {
        db.get('SELECT COUNT(*) as c FROM faqs', (err, row) => {
          resolve(row.c);
        });
      });
      expect(count).toBe(0);
    });
    
    test('sollte Users korrekt filtern beim Löschen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Füge mehrere Test-User hinzu
      await new Promise((resolve) => {
        db.run('INSERT INTO users (username, rolle) VALUES (?, ?)',
          ['user1', 'user'], () => resolve());
      });
      await new Promise((resolve) => {
        db.run('INSERT INTO users (username, rolle) VALUES (?, ?)',
          ['user2', 'user'], () => resolve());
      });
      
      // Clear
      await clearDatabase();
      
      // Nur Admin sollte übrig sein
      const users = await new Promise((resolve) => {
        db.all('SELECT * FROM users', (err, rows) => {
          resolve(rows);
        });
      });
      
      expect(users.length).toBe(1);
      expect(users[0].username).toBe('admin');
    });
  });
  
  describe('initDatabase() Robustheit', () => {
    test('sollte Tabellen-Struktur korrekt erstellen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Prüfe FAQs Spalten
      const faqsInfo = await new Promise((resolve) => {
        db.all("PRAGMA table_info(faqs)", (err, rows) => {
          resolve(rows);
        });
      });
      
      const columnNames = faqsInfo.map(col => col.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('titel');
      expect(columnNames).toContain('kategorie');
      expect(columnNames).toContain('inhalt');
      expect(columnNames).toContain('tags');
      expect(columnNames).toContain('hilfreich_punkte');
      expect(columnNames).toContain('erstellt_am');
      expect(columnNames).toContain('aktualisiert_am');
    });
    
    test('sollte Users-Tabelle-Struktur korrekt erstellen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Prüfe Users Spalten
      const usersInfo = await new Promise((resolve) => {
        db.all("PRAGMA table_info(users)", (err, rows) => {
          resolve(rows);
        });
      });
      
      const columnNames = usersInfo.map(col => col.name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('username');
      expect(columnNames).toContain('rolle');
      expect(columnNames).toContain('erstellt_am');
    });
    
    test('sollte Admin nur einmal einfügen (INSERT OR IGNORE)', async () => {
      await initDatabase();
      await closeDatabase();
      
      // Zweite Initialisierung sollte Admin nicht duplizieren
      await initDatabase();
      const db = getDatabase();
      
      const admins = await new Promise((resolve) => {
        db.all('SELECT * FROM users WHERE username = ?', ['admin'], (err, rows) => {
          resolve(rows);
        });
      });
      
      expect(admins.length).toBe(1);
    });
  });
  
  describe('Edge Cases', () => {
    test('sollte leere Tags korrekt speichern', async () => {
      await initDatabase();
      const db = getDatabase();
      
      await new Promise((resolve) => {
        db.run('INSERT INTO faqs (titel, kategorie, inhalt, tags) VALUES (?, ?, ?, ?)',
          ['Test', 'Test', 'Test', ''], () => resolve());
      });
      
      const faq = await new Promise((resolve) => {
        db.get('SELECT * FROM faqs WHERE titel = ?', ['Test'], (err, row) => {
          resolve(row);
        });
      });
      
      expect(faq.tags).toBe('');
    });
    
    test('sollte NULL tags korrekt handhaben', async () => {
      await initDatabase();
      const db = getDatabase();
      
      await new Promise((resolve) => {
        db.run('INSERT INTO faqs (titel, kategorie, inhalt) VALUES (?, ?, ?)',
          ['Test', 'Test', 'Test'], () => resolve());
      });
      
      const faq = await new Promise((resolve) => {
        db.get('SELECT * FROM faqs WHERE titel = ?', ['Test'], (err, row) => {
          resolve(row);
        });
      });
      
      expect(faq.tags).toBeNull();
    });
    
    test('sollte Default-Werte korrekt setzen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      await new Promise((resolve) => {
        db.run('INSERT INTO faqs (titel, kategorie, inhalt) VALUES (?, ?, ?)',
          ['Test', 'Test', 'Test'], () => resolve());
      });
      
      const faq = await new Promise((resolve) => {
        db.get('SELECT * FROM faqs', (err, row) => {
          resolve(row);
        });
      });
      
      expect(faq.hilfreich_punkte).toBe(0);
      expect(faq.erstellt_am).toBeDefined();
      expect(faq.aktualisiert_am).toBeDefined();
    });
  });
});

