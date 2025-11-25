const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Datenbank-Modul für FAQ-Tool
 * Verwaltet SQLite-Verbindung und Datenbankoperationen
 */

// Bestimme Datenbankpfad basierend auf Umgebung
const dbPath = process.env.NODE_ENV === 'test' || process.env.VERCEL
  ? ':memory:'  // In-Memory DB für Tests und Vercel
  : path.join(__dirname, '..', 'faq-tool.db');

let db;

/**
 * Initialisiert die Datenbank und erstellt Tabellen
 * @returns {Promise<sqlite3.Database>}
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    // Wenn bereits initialisiert, gib existierende DB zurück
    if (db) {
      resolve(db);
      return;
    }
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Fehler beim Öffnen der Datenbank:', err);
        reject(err);
        return;
      }
      
      // Erstelle FAQs Tabelle mit allen erforderlichen Feldern
      db.run(`
        CREATE TABLE IF NOT EXISTS faqs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          titel TEXT NOT NULL,
          kategorie TEXT NOT NULL,
          inhalt TEXT NOT NULL,
          tags TEXT,
          hilfreich_punkte INTEGER DEFAULT 0,
          erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP,
          aktualisiert_am DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Erstelle Benutzer Tabelle für Admin-Authentifizierung
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            rolle TEXT NOT NULL,
            erstellt_am DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          // Füge Test-Admin hinzu (nur wenn noch nicht vorhanden)
          db.run(`
            INSERT OR IGNORE INTO users (username, rolle) 
            VALUES ('admin', 'admin')
          `, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(db);
            }
          });
        });
      });
    });
  });
}

/**
 * Gibt die aktuelle Datenbankverbindung zurück
 * @returns {sqlite3.Database}
 */
function getDatabase() {
  if (!db) {
    throw new Error('Datenbank wurde noch nicht initialisiert. Rufe zuerst initDatabase() auf.');
  }
  return db;
}

/**
 * Schließt die Datenbankverbindung
 * @returns {Promise<void>}
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Fehler beim Schließen der Datenbank:', err);
          reject(err);
        } else {
          db = null; // Setze db auf null nach dem Schließen
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

/**
 * Löscht alle Daten aus den Tabellen (nur für Tests)
 * @returns {Promise<void>}
 */
function clearDatabase() {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Datenbank ist nicht initialisiert'));
      return;
    }
    
    // Lösche FAQs
    db.run('DELETE FROM faqs', (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Lösche Users (außer Admin)
      db.run('DELETE FROM users WHERE username != "admin"', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Reset Auto-Increment für beide Tabellen
        db.run('DELETE FROM sqlite_sequence WHERE name IN ("faqs", "users")', (err) => {
          if (err) {
            // Ignoriere Fehler wenn sqlite_sequence nicht existiert
            resolve();
          } else {
            resolve();
          }
        });
      });
    });
  });
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  clearDatabase
};

