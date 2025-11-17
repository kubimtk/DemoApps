# 🚀 Vercel Deployment (mit Mock-Backend)

## ✅ Was du jetzt tun musst:

### 1️⃣ Frontend neu auf Vercel deployen:

```bash
cd frontend
vercel --prod
```

**Das war's!** Vercel wird automatisch:
- `npm run build` ausführen
- Die neue Version mit Mock-Modus deployen
- Mock aktiviert sich automatisch (hostname enthält 'vercel')

---

## 🎭 Wie funktioniert der Mock?

### Automatische Erkennung:
```typescript
const isMockMode = window.location.hostname.includes('vercel');
```

- **Auf Vercel**: Mock aktiv → Kein Backend nötig! ✅
- **Lokal (localhost)**: Mock inaktiv → Nutzt `localhost:3000/api`

---

## 🧪 Nach dem Deployment testen:

### 1. Öffne deine Vercel-URL:
```
https://deine-app.vercel.app
```

### 2. Prüfe Browser Console (F12):
```
🎭 Mock Mode: ACTIVE (Vercel)
🔧 API_URL: http://localhost:3000/api
🔧 ENV VITE_API_URL: http://localhost:3000/api
```

### 3. Teste die BDD-Szenarien:

#### ✅ Szenario 1: Barcode scannen + Add 5
1. Barcode eingeben: `12345`
2. "Scannen" klicken
3. Produkt erscheint: "Schrauben M3", Stock 10
4. "Add 5" klicken
5. Stock wird zu 15 ✅

#### ✅ Szenario 2: Remove 3
1. Barcode: `12345` scannen
2. "Remove 3" klicken
3. Stock wird zu 7 ✅

#### ✅ Szenario 3: Low Stock Warning
1. Barcode: `99999` scannen
2. Produkt: "Muttern M5", Stock 15
3. ROT markiert ✅
4. Warnung: "Mindestbestand unterschritten" ✅

---

## 🔧 Environment Variables auf Vercel

Du brauchst **KEINE** Environment Variables zu setzen! Der Mock-Modus übersteuert alles.

Falls du trotzdem was setzen willst:
```
VITE_API_URL=http://localhost:3000/api
```
(Wird aber ignoriert, da Mock Vorrang hat)

---

## 📝 Vercel CLI Commands:

### Neu deployen (Production):
```bash
cd frontend
vercel --prod
```

### Preview Deployment (Test):
```bash
cd frontend
vercel
```

### Deployment löschen:
```bash
vercel remove inventory-frontend
```

### Status prüfen:
```bash
vercel ls
```

---

## 🐛 Troubleshooting

### Problem: Mock aktiviert sich nicht
**Lösung**: Prüfe Browser Console:
```javascript
console.log(window.location.hostname);
// Muss 'vercel' enthalten!
```

### Problem: API Fehler 404
**Lösung**: Mock-Endpoints prüfen in `App.tsx`:
- GET `/products`
- POST `/scan`
- POST `/adjust`

### Problem: Stock Updates funktionieren nicht
**Lösung**: Prüfe Mock Console Logs:
```
🎭 Mock API Call: .../scan POST
🎭 Mock: Stock adjusted { barcode: "12345", oldStock: 10, newStock: 15, quantity: 5 }
```

---

## ✅ Deployment Checklist

- [x] Git Push erfolgreich
- [ ] `vercel --prod` ausgeführt
- [ ] Browser Console zeigt "Mock Mode: ACTIVE"
- [ ] Barcode 12345 scanbar
- [ ] Add 5 funktioniert
- [ ] Remove 3 funktioniert
- [ ] Low Stock Warning angezeigt
- [ ] Warehouse Filter funktioniert

---

## 🎉 Vorteile des Mock-Modus

1. **Kein Backend nötig** - Standalone App auf Vercel
2. **Schneller** - Keine API-Calls über Netzwerk
3. **Zuverlässig** - Funktioniert immer (kein Server-Downtime)
4. **BDD-konform** - Alle Szenarien aus `inventory.feature` abgedeckt
5. **Kostenlos** - Keine Backend-Hosting-Kosten

---

## 📊 Deployment-Übersicht

```
┌─────────────────────────────────────────┐
│  Vercel (Production)                    │
│  https://deine-app.vercel.app           │
│                                         │
│  🎭 Mock Mode: ACTIVE                   │
│  ✅ Kein Backend nötig                  │
│  ✅ BDD Szenarien funktionieren         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Localhost (Development)                │
│  http://localhost:5173                  │
│                                         │
│  🎭 Mock Mode: DISABLED                 │
│  ✅ Nutzt Backend: localhost:3000/api   │
│  ✅ Echte SQLite-Datenbank              │
└─────────────────────────────────────────┘
```

---

## 🚀 Jetzt deployen!

```bash
cd /Users/kubi/Cursorfiles/DemoApps/Inventory/frontend
vercel --prod
```

**Fertig!** 🎉

