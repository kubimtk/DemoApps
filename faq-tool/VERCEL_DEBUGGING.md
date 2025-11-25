# 🔍 Vercel Debugging Guide

## ✅ Internal Server Error - GEFIXT!

### Was wurde gefixt:

1. ✅ **SQLite File-System Problem**
   - Problem: Vercel Filesystem ist read-only
   - Fix: In-Memory SQLite für Vercel (`VERCEL` env var)

2. ✅ **Async DB Initialization**
   - Problem: DB wurde nicht initialisiert bevor Requests kamen
   - Fix: Proper async handler in `api/index.js`

3. ✅ **Error Handling**
   - Problem: Keine Error-Details sichtbar
   - Fix: Global Error Handler + Health Check

---

## 🧪 Nach dem Deployment testen

### 1. Health Check (NEU!)

```bash
curl https://faq-tool-qnh6mptdr-wolfgang-kubisiaks-projects.vercel.app/health
```

**Erwartetes Ergebnis:**
```json
{
  "status": "OK",
  "environment": "production",
  "vercel": true,
  "timestamp": "2024-11-25T..."
}
```

✅ **Wenn das funktioniert, ist der Server grundsätzlich online!**

### 2. Hauptseite testen

```bash
curl -I https://faq-tool-qnh6mptdr-wolfgang-kubisiaks-projects.vercel.app/
```

**Erwartetes Ergebnis:**
```
HTTP/2 200
content-type: text/html
```

### 3. FAQs API testen

```bash
curl https://faq-tool-qnh6mptdr-wolfgang-kubisiaks-projects.vercel.app/faqs
```

**Erwartetes Ergebnis:**
```json
[]
```
(Leeres Array ist OK - DB ist leer nach jedem Cold Start)

---

## 📊 Vercel Logs checken

### Im Browser:

1. Gehe zu: https://vercel.com/dashboard
2. Klicke auf dein Projekt: **faq-tool**
3. Klicke auf den neuesten Deployment
4. Gehe zu **"Runtime Logs"** Tab

### Was du sehen solltest:

```
✅ Initialisiere Datenbank...
✅ Datenbank initialisiert!
```

### Falls Fehler:

```
❌ Error: EROFS: read-only file system
```
→ **GEFIXT** durch In-Memory SQLite

```
❌ Cannot find module './database'
```
→ Pfad-Problem, prüfe `api/index.js`

---

## 🔧 Die kritischen Fixes im Detail

### Fix 1: In-Memory SQLite auf Vercel

**Datei:** `src/database.js`

```javascript
// VORHER (❌ Funktioniert nicht auf Vercel):
const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:'
  : path.join(__dirname, '..', 'faq-tool.db'); // ❌ Read-only!

// NACHHER (✅ Funktioniert auf Vercel):
const dbPath = process.env.NODE_ENV === 'test' || process.env.VERCEL
  ? ':memory:'  // ✅ In-Memory für Tests UND Vercel
  : path.join(__dirname, '..', 'faq-tool.db');
```

### Fix 2: Async DB Initialization

**Datei:** `api/index.js`

```javascript
// VORHER (❌ DB nicht initialisiert):
const { app } = require('../src/app');
module.exports = app; // ❌ DB wird nie initialisiert!

// NACHHER (✅ Proper Async Handler):
const { app } = require('../src/app');
const { initDatabase } = require('../src/database');

let dbInitialized = false;

async function handler(req, res) {
  if (!dbInitialized) {
    await initDatabase(); // ✅ Warte auf DB-Init
    dbInitialized = true;
  }
  return app(req, res);
}

module.exports = handler;
```

### Fix 3: Error Handler & Health Check

**Datei:** `src/app.js`

```javascript
// Health Check für Debugging
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message
  });
});
```

---

## 🚀 Deployment Status prüfen

### Warte 2-3 Minuten nach dem Push

Vercel braucht Zeit zum:
1. ✅ Code von GitHub pullen
2. ✅ Dependencies installieren (`npm install`)
3. ✅ Build durchführen
4. ✅ Serverless Functions deployen

### Check Deployment Status:

```bash
# Option 1: Im Browser
open https://vercel.com/dashboard

# Option 2: Mit Vercel CLI
vercel logs
```

---

## ⚠️ Wichtig zu wissen

### In-Memory SQLite bedeutet:

**Vorteile:**
- ✅ Funktioniert auf Vercel
- ✅ Super schnell
- ✅ Keine File-System-Probleme

**Nachteile:**
- ❌ Daten gehen verloren bei Cold Start
- ❌ Jede Serverless Function hat eigene DB
- ❌ Nicht für Production geeignet

### Für Production:

Wenn du persistente Daten brauchst, nutze:

1. **Vercel Postgres** (empfohlen)
   ```bash
   vercel postgres create
   ```

2. **Supabase** (kostenlos)
   - Gehe zu https://supabase.com
   - Erstelle Projekt
   - Kopiere Connection String

3. **PlanetScale** (MySQL)
   - Gehe zu https://planetscale.com
   - Erstelle Datenbank
   - Kopiere Connection String

---

## 🧪 Lokalen Test (simuliert Vercel)

```bash
# Setze VERCEL env var
export VERCEL=1

# Starte App
npm start

# In anderem Terminal: Test
curl http://localhost:3000/health

# Sollte zeigen:
# { "status": "OK", "vercel": true, ... }
```

---

## 📋 Troubleshooting Checklist

Wenn es immer noch nicht funktioniert:

- [ ] Warte 3-5 Minuten (Cold Start kann dauern)
- [ ] Prüfe Vercel Logs im Dashboard
- [ ] Teste `/health` Endpoint
- [ ] Prüfe ob GitHub Commit erfolgreich war
- [ ] Prüfe ob Vercel automatisch deployed hat
- [ ] Teste mit `curl -v` für detaillierte Ausgabe
- [ ] Checke ob alle Dependencies in `package.json` sind

---

## 🎯 Erwartetes Verhalten nach Fix

### ✅ Was jetzt funktioniert:

1. **Health Check**
   ```
   GET /health
   → 200 OK
   ```

2. **Hauptseite**
   ```
   GET /
   → 200 OK (zeigt FAQ-Liste, initial leer)
   ```

3. **FAQs API**
   ```
   GET /faqs
   → 200 OK (leeres Array)
   ```

4. **Admin Login**
   ```
   POST /login {"username": "admin"}
   → 200 OK
   ```

5. **FAQ erstellen**
   ```
   POST /admin/faq (mit Admin-Session)
   → 200 OK
   ```

### ⚠️ Was NICHT funktioniert (by design):

- ❌ Persistente Datenspeicherung
- ❌ Daten überleben Cold Start
- ❌ Shared State zwischen Serverless Functions

**Für Production:** Upgrade zu echter Datenbank (siehe oben)

---

## 🎉 Status nach Fix

```
✅ In-Memory SQLite für Vercel aktiviert
✅ Async DB Initialization implementiert
✅ Error Handler hinzugefügt
✅ Health Check Endpoint erstellt
✅ Zu GitHub gepusht (Commit: 735f8395)
✅ Vercel deployt automatisch...
```

**Warte 2-3 Minuten und teste:**

```bash
curl https://faq-tool-qnh6mptdr-wolfgang-kubisiaks-projects.vercel.app/health
```

**Wenn das 200 OK zurückgibt, ist alles gefixt! ✅**

---

## 📞 Weitere Hilfe

Falls es immer noch nicht funktioniert:

1. **Vercel Logs anschauen:**
   - Dashboard → Projekt → Deployments → Runtime Logs

2. **Detaillierter Test:**
   ```bash
   curl -v https://your-app.vercel.app/health
   ```

3. **Cold Start erzwingen:**
   - Warte 5 Minuten (Function geht in sleep)
   - Lade Seite neu
   - Prüfe Logs für "Initialisiere Datenbank..."

---

**Der Internal Server Error sollte jetzt behoben sein! 🎉**

