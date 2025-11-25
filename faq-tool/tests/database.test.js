/**
 * Unit Tests für database.js
 * Testet Error-Handling und Edge Cases
 */

const { initDatabase, getDatabase, closeDatabase, clearDatabase } = require('../src/database');

describe('Database Unit Tests', () => {
  
  afterEach(async () => {
    // Cleanup nach jedem Test
    try {
      await closeDatabase();
    } catch (err) {
      // Ignoriere Fehler wenn DB schon geschlossen
    }
  });
  
  describe('initDatabase()', () => {
    test('sollte Datenbank erfolgreich initialisieren', async () => {
      const db = await initDatabase();
      expect(db).toBeDefined();
    });
    
    test('sollte existierende DB zurückgeben wenn bereits initialisiert', async () => {
      const db1 = await initDatabase();
      const db2 = await initDatabase(); // Zweiter Aufruf
      
      expect(db1).toBe(db2); // Sollte dieselbe Instanz sein
    });
  });
  
  describe('getDatabase()', () => {
    test('sollte DB zurückgeben wenn initialisiert', async () => {
      await initDatabase();
      const db = getDatabase();
      expect(db).toBeDefined();
    });
    
    test('sollte Fehler werfen wenn DB nicht initialisiert', async () => {
      // Stelle sicher dass keine DB existiert
      try {
        await closeDatabase();
      } catch (err) {
        // Ignoriere
      }
      
      expect(() => {
        getDatabase();
      }).toThrow('Datenbank wurde noch nicht initialisiert');
    });
  });
  
  describe('closeDatabase()', () => {
    test('sollte DB erfolgreich schließen', async () => {
      await initDatabase();
      await closeDatabase();
      
      // Nach Schließen sollte getDatabase() fehlschlagen
      expect(() => {
        getDatabase();
      }).toThrow();
    });
    
    test('sollte nicht fehlschlagen wenn DB bereits geschlossen', async () => {
      await initDatabase();
      await closeDatabase();
      
      // Zweites Schließen sollte funktionieren
      await expect(closeDatabase()).resolves.not.toThrow();
    });
    
    test('sollte nicht fehlschlagen wenn DB nie initialisiert', async () => {
      await expect(closeDatabase()).resolves.not.toThrow();
    });
  });
  
  describe('clearDatabase()', () => {
    test('sollte alle FAQs löschen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Füge Test-FAQ hinzu
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO faqs (titel, kategorie, inhalt) VALUES (?, ?, ?)',
          ['Test', 'Test', 'Test'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      // Prüfe dass FAQ existiert
      const countBefore = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM faqs', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
      expect(countBefore).toBe(1);
      
      // Clear database
      await clearDatabase();
      
      // Prüfe dass FAQ gelöscht wurde
      const countAfter = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM faqs', (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        });
      });
      expect(countAfter).toBe(0);
    });
    
    test('sollte Admin-User behalten beim Löschen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Füge Test-User hinzu
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, rolle) VALUES (?, ?)',
          ['testuser', 'user'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      // Clear database
      await clearDatabase();
      
      // Prüfe dass Admin noch existiert
      const admin = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      expect(admin).toBeDefined();
      expect(admin.username).toBe('admin');
      
      // Prüfe dass Test-User gelöscht wurde
      const testUser = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', ['testuser'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      expect(testUser).toBeUndefined();
    });
    
    test('sollte Fehler werfen wenn DB nicht initialisiert', async () => {
      try {
        await closeDatabase();
      } catch (err) {
        // Ignoriere
      }
      
      await expect(clearDatabase()).rejects.toThrow('Datenbank ist nicht initialisiert');
    });
  });
  
  describe('Error Handling', () => {
    test('sollte Auto-Increment nach clearDatabase() zurücksetzen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Füge FAQ hinzu
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO faqs (titel, kategorie, inhalt) VALUES (?, ?, ?)',
          ['Test1', 'Test', 'Test'],
          (err) => err ? reject(err) : resolve()
        );
      });
      
      // Clear und füge neue FAQ hinzu
      await clearDatabase();
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO faqs (titel, kategorie, inhalt) VALUES (?, ?, ?)',
          ['Test2', 'Test', 'Test'],
          function(err) {
            if (err) reject(err);
            else {
              // ID sollte 1 sein (reset durch clearDatabase)
              expect(this.lastID).toBe(1);
              resolve();
            }
          }
        );
      });
    });
  });
  
  describe('Database Integration', () => {
    test('sollte FAQs Tabelle erstellen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Prüfe dass Tabelle existiert
      const table = await new Promise((resolve, reject) => {
        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='faqs'",
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      expect(table).toBeDefined();
      expect(table.name).toBe('faqs');
    });
    
    test('sollte Users Tabelle erstellen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Prüfe dass Tabelle existiert
      const table = await new Promise((resolve, reject) => {
        db.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      expect(table).toBeDefined();
      expect(table.name).toBe('users');
    });
    
    test('sollte Admin-User automatisch erstellen', async () => {
      await initDatabase();
      const db = getDatabase();
      
      // Prüfe dass Admin existiert
      const admin = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      expect(admin).toBeDefined();
      expect(admin.username).toBe('admin');
      expect(admin.rolle).toBe('admin');
    });
  });
});

