# 🚀 Vercel Deployment Guide

## ✅ Deployment-Konfiguration

### Dateien für Vercel

1. **`vercel.json`** - Vercel-Konfiguration
2. **`api/index.js`** - Serverless Function Entry Point
3. **`.vercelignore`** - Dateien die nicht deployed werden

---

## 📦 Deployment-Struktur

```
faq-tool/
├── api/
│   └── index.js          # Vercel Serverless Function
├── src/
│   ├── app.js            # Express App
│   ├── database.js       # SQLite Layer
│   └── views/            # EJS Templates
├── vercel.json           # Vercel Config
└── .vercelignore         # Ignore Rules
```

---

## 🔧 Konfiguration

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### `api/index.js`

```javascript
// Vercel Serverless Function
const { app } = require('../src/app');
module.exports = app;
```

---

## 🚀 Deployment-Schritte

### Option 1: Vercel CLI (empfohlen)

```bash
# 1. Vercel CLI installieren (falls noch nicht vorhanden)
npm i -g vercel

# 2. Login
vercel login

# 3. Im Projektordner deployen
cd /path/to/faq-tool
vercel

# 4. Production Deployment
vercel --prod
```

### Option 2: GitHub Integration

1. **Repository auf GitHub pushen**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push
   ```

2. **Auf Vercel verbinden**
   - Gehe zu https://vercel.com/new
   - Importiere dein GitHub Repository
   - Vercel erkennt automatisch die Konfiguration
   - Klicke "Deploy"

---

## ⚠️ Wichtige Hinweise

### SQLite auf Vercel

**Problem:** Vercel ist serverless/ephemeral. Die SQLite-Datenbank wird bei jedem Cold Start neu erstellt und verliert Daten.

**Für Demo:** Funktioniert, aber Daten gehen verloren
**Für Production:** Verwende eine persistente Datenbank:

- ✅ **Vercel Postgres** (empfohlen)
- ✅ **Supabase** (PostgreSQL)
- ✅ **PlanetScale** (MySQL)
- ✅ **MongoDB Atlas**

### Environment Variables

Wenn du eine externe Datenbank verwendest:

```bash
# Auf Vercel Dashboard:
# Settings → Environment Variables

DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
```

---

## 🔍 Troubleshooting

### Problem: "Cannot find module"

**Lösung:** Stelle sicher, dass alle Dependencies in `package.json` sind:

```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Problem: Routes funktionieren nicht

**Lösung:** Überprüfe `vercel.json` Routes:

```json
"routes": [
  {
    "src": "/(.*)",
    "dest": "api/index.js"
  }
]
```

### Problem: Views werden nicht gefunden

**Lösung:** EJS Views müssen relativ zu src/ sein. In `app.js`:

```javascript
app.set('views', path.join(__dirname, 'views'));
```

### Problem: 404 für statische Dateien

**Lösung:** Füge Static-Files Route hinzu:

```javascript
app.use(express.static(path.join(__dirname, 'public')));
```

---

## ✅ Deployment-Checklist

Vor dem Deployment:

- ✅ `vercel.json` konfiguriert
- ✅ `api/index.js` erstellt
- ✅ `.vercelignore` vorhanden
- ✅ Tests laufen lokal: `npm test`
- ✅ App startet lokal: `npm start`
- ✅ Alle Änderungen committed
- ✅ Zu GitHub gepusht

---

## 🌐 Nach dem Deployment

### Deine App ist live!

**URL:** https://faq-tool-xxx.vercel.app

### Testing

```bash
# Hauptseite
curl https://your-app.vercel.app/

# FAQs API
curl https://your-app.vercel.app/faqs

# Health Check
curl https://your-app.vercel.app/
```

### Monitoring

- **Dashboard:** https://vercel.com/dashboard
- **Logs:** https://vercel.com/your-project/deployments
- **Analytics:** Automatisch aktiviert

---

## 🔄 Updates deployen

### Automatisch (mit GitHub)

```bash
git add .
git commit -m "Update feature"
git push
# Vercel deployed automatisch!
```

### Manuell (mit CLI)

```bash
vercel --prod
```

---

## 📊 Performance-Tipps

### 1. Cold Start reduzieren

```javascript
// In app.js: Datenbank warm halten
setInterval(() => {
  // Dummy Query um Connection warm zu halten
}, 5 * 60 * 1000); // Alle 5 Minuten
```

### 2. Caching aktivieren

```javascript
// In app.js: Cache Headers setzen
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300');
  next();
});
```

### 3. Compression aktivieren

```bash
npm install compression
```

```javascript
const compression = require('compression');
app.use(compression());
```

---

## 🎯 Production-Ready Upgrade

### Von SQLite zu Vercel Postgres

1. **Erstelle Vercel Postgres Datenbank**
   ```bash
   vercel postgres create
   ```

2. **Installiere PostgreSQL Client**
   ```bash
   npm install pg
   ```

3. **Passe database.js an**
   ```javascript
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   ```

4. **Migriere Schema**
   ```sql
   CREATE TABLE faqs (
     id SERIAL PRIMARY KEY,
     titel TEXT NOT NULL,
     kategorie TEXT NOT NULL,
     inhalt TEXT NOT NULL,
     tags TEXT,
     hilfreich_punkte INTEGER DEFAULT 0,
     erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

---

## 🎉 Status

✅ **Vercel-Konfiguration erstellt**  
✅ **Serverless Function konfiguriert**  
✅ **Tests funktionieren weiterhin**  
✅ **Bereit für Deployment**

---

## 📚 Weitere Ressourcen

- **Vercel Docs:** https://vercel.com/docs
- **Express on Vercel:** https://vercel.com/guides/using-express-with-vercel
- **Vercel Postgres:** https://vercel.com/docs/storage/vercel-postgres

---

**Viel Erfolg mit dem Deployment! 🚀**

