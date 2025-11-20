const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const { initDatabase, getDatabase } = require('./database');
const { stringify } = require('csv-stringify/sync');

const app = express();

/**
 * Middleware-Konfiguration
 * Express, Body-Parser, Session, und EJS Template Engine
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'faq-tool-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// EJS Template Engine für Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Middleware: Prüft ob User als Admin eingeloggt ist
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.rolle === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin-Berechtigung erforderlich' });
  }
}

/**
 * Authentifizierung
 */

// POST /login - Login als Admin oder User
app.post('/login', (req, res) => {
  const { username } = req.body;
  const db = getDatabase();
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Datenbankfehler' });
    }
    
    if (user) {
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.rolle = user.rolle;
      res.json({ success: true, rolle: user.rolle });
    } else {
      // Erstelle neuen User mit Rolle 'user'
      db.run('INSERT INTO users (username, rolle) VALUES (?, ?)', 
        [username, 'user'], 
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Datenbankfehler' });
          }
          req.session.userId = this.lastID;
          req.session.username = username;
          req.session.rolle = 'user';
          res.json({ success: true, rolle: 'user' });
        }
      );
    }
  });
});

// GET /logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

/**
 * Admin CRUD Operationen für FAQs
 */

// POST /admin/faq - Erstellt neue FAQ (Admin only)
app.post('/admin/faq', requireAdmin, (req, res) => {
  const { titel, kategorie, inhalt, tags } = req.body;
  const db = getDatabase();
  
  // Validierung
  if (!titel || !kategorie || !inhalt) {
    return res.status(400).json({ error: 'Titel, Kategorie und Inhalt sind erforderlich' });
  }
  
  // Tags als Komma-separierter String speichern
  const tagsString = tags || '';
  
  db.run(
    'INSERT INTO faqs (titel, kategorie, inhalt, tags) VALUES (?, ?, ?, ?)',
    [titel, kategorie, inhalt, tagsString],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Datenbankfehler' });
      }
      
      // Lade die erstellte FAQ aus der Datenbank
      db.get('SELECT * FROM faqs WHERE id = ?', [this.lastID], (err, faq) => {
        if (err) {
          return res.status(500).json({ error: 'Datenbankfehler' });
        }
        res.json({ 
          message: 'FAQ erfolgreich erstellt',
          faq: faq
        });
      });
    }
  );
});

// PUT /admin/faq/:id - Aktualisiert bestehende FAQ (Admin only)
app.put('/admin/faq/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { titel, kategorie, inhalt, tags } = req.body;
  const db = getDatabase();
  
  // Build dynamic update query
  const updates = [];
  const values = [];
  
  if (titel !== undefined) {
    updates.push('titel = ?');
    values.push(titel);
  }
  if (kategorie !== undefined) {
    updates.push('kategorie = ?');
    values.push(kategorie);
  }
  if (inhalt !== undefined) {
    updates.push('inhalt = ?');
    values.push(inhalt);
  }
  if (tags !== undefined) {
    updates.push('tags = ?');
    values.push(tags);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'Keine Felder zum Aktualisieren angegeben' });
  }
  
  updates.push('aktualisiert_am = CURRENT_TIMESTAMP');
  values.push(id);
  
  const query = `UPDATE faqs SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Datenbankfehler' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'FAQ nicht gefunden' });
    }
    
    // Lade aktualisierte FAQ aus Datenbank
    db.get('SELECT * FROM faqs WHERE id = ?', [id], (err, faq) => {
      if (err) {
        return res.status(500).json({ error: 'Datenbankfehler' });
      }
      res.json({ 
        message: 'FAQ aktualisiert',
        faq: faq
      });
    });
  });
});

// DELETE /admin/faq/:id - Löscht FAQ (Admin only)
app.delete('/admin/faq/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.run('DELETE FROM faqs WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Datenbankfehler' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'FAQ nicht gefunden' });
    }
    
    res.json({ message: 'FAQ gelöscht' });
  });
});

/**
 * User Operationen
 */

// GET /faqs - Alle FAQs mit optionalem Filter und Suche
app.get('/faqs', (req, res) => {
  const { kategorie, suche } = req.query;
  const db = getDatabase();
  
  let query = 'SELECT * FROM faqs';
  const params = [];
  const conditions = [];
  
  // Filter nach Kategorie
  if (kategorie) {
    conditions.push('kategorie = ?');
    params.push(kategorie);
  }
  
  // Suche in Titel, Inhalt und Tags
  if (suche) {
    conditions.push('(titel LIKE ? OR inhalt LIKE ? OR tags LIKE ?)');
    const searchPattern = `%${suche}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY hilfreich_punkte DESC, erstellt_am DESC';
  
  db.all(query, params, (err, faqs) => {
    if (err) {
      return res.status(500).json({ error: 'Datenbankfehler' });
    }
    res.json(faqs);
  });
});

// GET /faq/:id - Einzelne FAQ Details
app.get('/faq/:id', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  db.get('SELECT * FROM faqs WHERE id = ?', [id], (err, faq) => {
    if (err) {
      return res.status(500).json({ error: 'Datenbankfehler' });
    }
    
    if (!faq) {
      return res.status(404).json({ error: 'FAQ nicht gefunden' });
    }
    
    res.json(faq);
  });
});

// POST /faq/:id/hilfreich - Markiert FAQ als hilfreich
app.post('/faq/:id/hilfreich', (req, res) => {
  const { id } = req.params;
  const db = getDatabase();
  
  // Erhöhe hilfreich_punkte um 1
  db.run(
    'UPDATE faqs SET hilfreich_punkte = hilfreich_punkte + 1 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Datenbankfehler' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'FAQ nicht gefunden' });
      }
      
      // Lade aktualisierte FAQ
      db.get('SELECT * FROM faqs WHERE id = ?', [id], (err, faq) => {
        if (err) {
          return res.status(500).json({ error: 'Datenbankfehler' });
        }
        
        const anzahl = faq.hilfreich_punkte;
        const message = `${anzahl} Kunde${anzahl !== 1 ? 'n' : ''} fand${anzahl === 1 ? '' : 'en'} diese FAQ hilfreich`;
        
        res.json({ 
          message: message,
          hilfreich_punkte: faq.hilfreich_punkte
        });
      });
    }
  );
});

// GET /faqs/popular - Beliebte FAQs (sortiert nach hilfreich_punkte)
app.get('/faqs/popular', (req, res) => {
  const db = getDatabase();
  
  db.all(
    'SELECT * FROM faqs ORDER BY hilfreich_punkte DESC, erstellt_am DESC',
    [],
    (err, faqs) => {
      if (err) {
        return res.status(500).json({ error: 'Datenbankfehler' });
      }
      res.json(faqs);
    }
  );
});

/**
 * CSV Export
 */

// GET /admin/export/csv - Exportiert alle FAQs als CSV (Admin only)
app.get('/admin/export/csv', requireAdmin, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM faqs ORDER BY id ASC', [], (err, faqs) => {
    if (err) {
      return res.status(500).json({ error: 'Datenbankfehler' });
    }
    
    // Erstelle CSV mit csv-stringify
    const csv = stringify(faqs, {
      header: true,
      columns: ['id', 'titel', 'kategorie', 'inhalt', 'tags', 'hilfreich_punkte', 'erstellt_am', 'aktualisiert_am']
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=faqs.csv');
    res.send(csv);
  });
});

/**
 * Views (EJS Templates)
 */

// GET / - Hauptseite mit FAQs
app.get('/', (req, res) => {
  const db = getDatabase();
  
  // Lade alle FAQs sortiert nach Beliebtheit
  db.all(
    'SELECT * FROM faqs ORDER BY hilfreich_punkte DESC, erstellt_am DESC',
    [],
    (err, faqs) => {
      if (err) {
        return res.status(500).send('Datenbankfehler');
      }
      
      // Lade alle Kategorien (unique)
      db.all(
        'SELECT DISTINCT kategorie FROM faqs ORDER BY kategorie',
        [],
        (err, kategorien) => {
          if (err) {
            return res.status(500).send('Datenbankfehler');
          }
          
          res.render('index', {
            faqs: faqs,
            kategorien: kategorien.map(k => k.kategorie),
            session: req.session
          });
        }
      );
    }
  );
});

// GET /admin - Admin Dashboard
app.get('/admin', requireAdmin, (req, res) => {
  const db = getDatabase();
  
  db.all('SELECT * FROM faqs ORDER BY erstellt_am DESC', [], (err, faqs) => {
    if (err) {
      return res.status(500).send('Datenbankfehler');
    }
    
    res.render('admin', {
      faqs: faqs,
      session: req.session
    });
  });
});

// Initialisiere Datenbank beim Start
let server;

async function startServer(port = 3000) {
  try {
    await initDatabase();
    server = app.listen(port, () => {
      console.log(`FAQ-Tool läuft auf Port ${port}`);
    });
    return server;
  } catch (err) {
    console.error('Fehler beim Starten des Servers:', err);
    throw err;
  }
}

// Für Tests exportieren
module.exports = { app, startServer };

// Starte Server nur wenn direkt ausgeführt
if (require.main === module) {
  startServer();
}

