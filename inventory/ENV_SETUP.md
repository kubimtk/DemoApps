# Environment Variable Setup

## Problem gelöst ✅

Das Problem war: Die API_URL hatte kein `/api` am Ende!

### Vorher (FALSCH):
```typescript
const API_URL = 'http://localhost:3000'  // ❌ Fehlt /api
```

Resultat: Aufruf von `http://localhost:3000/products` → 404 Error

### Nachher (RICHTIG):
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

Resultat: Aufruf von `http://localhost:3000/api/products` → ✅ Funktioniert

---

## Environment Dateien erstellt

### 1. `.env` (Development - wird ignoriert von Git)
```
VITE_API_URL=http://localhost:3000/api
```

### 2. `.env.development` (Development default)
```
VITE_API_URL=http://localhost:3000/api
```

### 3. `.env.example` (Template für andere)
```
# Backend API URL (with /api path)
VITE_API_URL=http://localhost:3000/api

# For production:
# VITE_API_URL=https://your-backend.com/api
```

---

## Wichtig: Frontend NEU starten!

Vite lädt Environment Variables nur beim Start. Du MUSST den Frontend-Server neu starten:

```bash
# Stoppe alten Frontend-Prozess
pkill -f "vite"

# Oder: Drücke Ctrl+C im Frontend-Terminal

# Starte Frontend neu
cd /Users/kubi/Cursorfiles/DemoApps/Inventory/frontend
npm run dev
```

---

## Debug Logs

Ich habe Debug-Logs in `App.tsx` hinzugefügt:

```typescript
console.log('🔧 API_URL:', API_URL);
console.log('🔧 ENV VITE_API_URL:', import.meta.env.VITE_API_URL);
```

Nach dem Neustart solltest du in der Browser-Konsole (F12) sehen:

```
🔧 API_URL: http://localhost:3000/api
🔧 ENV VITE_API_URL: http://localhost:3000/api
```

---

## Wie man Environment Variables in Vite verwendet

### ✅ RICHTIG:
```typescript
// In React-Komponenten:
const API_URL = import.meta.env.VITE_API_URL;

// Mit Fallback:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### ❌ FALSCH:
```typescript
// Das funktioniert NICHT in Vite:
const API_URL = process.env.VITE_API_URL;  // ❌ Das ist für Node.js

// In Browser-Console funktioniert import.meta.env auch nicht:
console.log(import.meta.env.VITE_API_URL)  // ❌ Nur in Modulen
```

---

## Vite Environment Variable Rules

1. **Prefix**: Muss mit `VITE_` beginnen
2. **Restart**: Server muss neu gestartet werden nach .env Änderungen
3. **Module-only**: `import.meta.env` funktioniert nur in ES-Modulen
4. **Build time**: Wird beim Build ersetzt (nicht zur Laufzeit)

---

## Production Setup

Für Production, erstelle `.env.production`:

```bash
# .env.production
VITE_API_URL=https://api.deine-domain.com/api
```

Build dann mit:
```bash
npm run build
```

Die `VITE_API_URL` wird hardcoded ins Build eingebettet.

---

## Überprüfung

Nach Frontend-Neustart:

1. **Browser-Konsole (F12)** öffnen
2. **Erwartete Ausgabe:**
   ```
   🔧 API_URL: http://localhost:3000/api
   🔧 ENV VITE_API_URL: http://localhost:3000/api
   ```

3. **Keine 404 Fehler mehr** bei:
   - `/api/products`
   - `/api/scan`
   - `/api/adjust`

---

## Troubleshooting

### Problem: Immer noch 404 Errors

**Lösung:**
```bash
# 1. Stoppe Frontend komplett
pkill -f "vite"

# 2. Lösche Cache (optional)
rm -rf node_modules/.vite

# 3. Starte neu
npm run dev
```

### Problem: ENV Variable ist undefined

**Check:**
```bash
# Ist .env Datei vorhanden?
cat frontend/.env

# Hat Variable VITE_ Prefix?
# ✅ VITE_API_URL
# ❌ API_URL (ohne VITE_)
```

### Problem: Browser-Console zeigt falsche URL

**Check in App.tsx:**
```typescript
// Zeile 4 sollte sein:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
//                                                                     ^^^^^ /api muss da sein!
```

---

## Fertig! ✅

Nach Frontend-Neustart sollte alles funktionieren!

