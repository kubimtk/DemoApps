# 🎭 Technische Spezifikation: Mock-Backend für Vercel

**Version:** 1.0  
**Datum:** 2024-11-17  
**Autor:** AI Assistant  
**Status:** Implementiert ✅

---

## 1. Überblick

### 1.1 Zweck
Diese Spezifikation beschreibt die technische Implementierung eines Mock-Backends für die Inventory Management App, das ein vollständiges Frontend-Deployment ohne separaten Backend-Server ermöglicht.

### 1.2 Scope
- **In Scope:** Mock-API-Endpoints, localStorage-Persistierung, Vercel-Deployment
- **Out of Scope:** Echtes Backend, Datenbank-Migrationen, User Authentication

### 1.3 Zielplattform
- **Production:** Vercel (Frontend-only Deployment)
- **Development:** localhost mit echtem Backend
- **Testing:** Jest mit echtem Backend

---

## 2. Architektur

### 2.1 Komponenten-Übersicht

```
┌─────────────────────────────────────────────────┐
│  React App (App.tsx)                            │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  apiFetch()                               │ │
│  │  - Routing Layer                          │ │
│  │  - Mock Detection                         │ │
│  └───────────────┬───────────────────────────┘ │
│                  │                              │
│     ┌────────────┴──────────────┐              │
│     │                            │              │
│     ▼                            ▼              │
│  Mock Mode                   Real API           │
│  (Vercel)                    (localhost)        │
│     │                            │              │
│     ▼                            ▼              │
│  localStorage              Backend Server       │
│  (Browser)                 (SQLite/Node.js)     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 2.2 Aktivierungsbedingung

```typescript
const isMockMode = typeof window !== 'undefined' 
  && window.location.hostname.includes('vercel');
```

**Aktiviert wenn:**
- ✅ Hostname enthält "vercel" (z.B. `*.vercel.app`)
- ✅ Browser-Kontext vorhanden (`window !== undefined`)

**Deaktiviert wenn:**
- ❌ localhost
- ❌ Server-Side Rendering (SSR)
- ❌ Andere Domains

---

## 3. Datenmodell

### 3.1 Product Interface

```typescript
interface Product {
  barcode: string;        // Eindeutige ID (z.B. "12345")
  name: string;           // Produktname (z.B. "Schrauben M3")
  stock: number;          // Aktueller Bestand (>= 0)
  warehouse: string;      // Lagerort (z.B. "Werkstatt")
  minStock: number;       // Mindestbestand für Warnung
  lastChanged?: string;   // ISO 8601 Timestamp
  isLowStock?: boolean;   // true wenn stock < minStock
  warning?: string | null; // Warnmeldung oder null
}
```

### 3.2 Initial-Daten

```typescript
const INITIAL_MOCK_DATA: Product[] = [
  {
    barcode: '12345',
    name: 'Schrauben M3',
    stock: 10,
    warehouse: 'Werkstatt',
    minStock: 20,
    lastChanged: new Date().toISOString(),
    isLowStock: true,
    warning: 'Mindestbestand unterschritten'
  },
  {
    barcode: '99999',
    name: 'Muttern M5',
    stock: 15,
    warehouse: 'Werkstatt',
    minStock: 20,
    lastChanged: new Date().toISOString(),
    isLowStock: true,
    warning: 'Mindestbestand unterschritten'
  }
];
```

**Rationale:**
- Stock-Werte entsprechen BDD-Szenarien (`inventory.feature`)
- `minStock: 20` erzwingt Low-Stock Warning für Demo-Zwecke
- Beide Produkte im gleichen Warehouse für Filter-Tests

---

## 4. API-Endpoints

### 4.1 GET /products

**Beschreibung:** Liefert Liste aller Produkte mit optionalem Warehouse-Filter

**Request:**
```http
GET /products?warehouse=Werkstatt
```

**Query Parameter:**
| Parameter | Typ | Optional | Beschreibung |
|-----------|-----|----------|--------------|
| warehouse | string | Ja | Filter nach Lagerort. "Alle" = kein Filter |

**Response 200:**
```json
[
  {
    "barcode": "12345",
    "name": "Schrauben M3",
    "stock": 10,
    "warehouse": "Werkstatt",
    "minStock": 20,
    "isLowStock": true,
    "warning": "Mindestbestand unterschritten",
    "lastChanged": "2024-11-17T10:30:00.000Z"
  }
]
```

**Mock-Implementierung:**
```typescript
if (urlPath.startsWith('/products') && method === 'GET') {
  const warehouse = urlObj.searchParams.get('warehouse');
  
  let products = mockStore.products;
  if (warehouse && warehouse !== 'Alle') {
    products = products.filter((p: any) => p.warehouse === warehouse);
  }

  return new Response(JSON.stringify(products), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

### 4.2 POST /scan

**Beschreibung:** Scannt Barcode und lädt Produktdaten

**Request:**
```http
POST /scan
Content-Type: application/json

{
  "barcode": "12345"
}
```

**Request Body:**
| Field | Typ | Required | Beschreibung |
|-------|-----|----------|--------------|
| barcode | string | Ja | Zu scannender Barcode |

**Response 200 (Produkt gefunden):**
```json
{
  "barcode": "12345",
  "name": "Schrauben M3",
  "stock": 10,
  "warehouse": "Werkstatt",
  "minStock": 20,
  "isLowStock": true,
  "warning": "Mindestbestand unterschritten",
  "lastChanged": "2024-11-17T10:30:00.000Z"
}
```

**Response 404 (Produkt nicht gefunden):**
```json
{
  "error": "Produkt nicht gefunden"
}
```

**Mock-Implementierung:**
```typescript
if (urlPath === '/scan' && method === 'POST') {
  const body = JSON.parse(options?.body as string);
  const { barcode } = body;

  const product = mockStore.products.find((p: any) => p.barcode === barcode);

  if (product) {
    return new Response(JSON.stringify(product), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ error: 'Produkt nicht gefunden' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

---

### 4.3 POST /adjust

**Beschreibung:** Passt Lagerbestand an (erhöhen oder verringern)

**Request:**
```http
POST /adjust
Content-Type: application/json

{
  "barcode": "12345",
  "quantity": 5
}
```

**Request Body:**
| Field | Typ | Required | Beschreibung |
|-------|-----|----------|--------------|
| barcode | string | Ja | Barcode des Produkts |
| quantity | number | Ja | Änderungsmenge (positiv = Add, negativ = Remove) |

**Response 200 (Erfolg):**
```json
{
  "barcode": "12345",
  "name": "Schrauben M3",
  "stock": 15,
  "warehouse": "Werkstatt",
  "minStock": 20,
  "isLowStock": true,
  "warning": "Mindestbestand unterschritten",
  "lastChanged": "2024-11-17T10:35:00.000Z"
}
```

**Response 400 (Negativer Stock):**
```json
{
  "error": "Lagerbestand kann nicht negativ werden",
  "currentStock": 2,
  "requestedQuantity": -3
}
```

**Response 404 (Produkt nicht gefunden):**
```json
{
  "error": "Produkt nicht gefunden"
}
```

**Mock-Implementierung:**
```typescript
if (urlPath === '/adjust' && method === 'POST') {
  const body = JSON.parse(options?.body as string);
  const { barcode, quantity } = body;

  const product = mockStore.products.find((p: any) => p.barcode === barcode);

  if (!product) {
    return new Response(JSON.stringify({ error: 'Produkt nicht gefunden' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const newStock = product.stock + quantity;

  // Validation: Stock kann nicht negativ werden
  if (newStock < 0) {
    return new Response(JSON.stringify({
      error: 'Lagerbestand kann nicht negativ werden',
      currentStock: product.stock,
      requestedQuantity: quantity
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Update stock
  product.stock = newStock;
  product.lastChanged = new Date().toISOString();
  product.isLowStock = product.stock < product.minStock;
  product.warning = product.isLowStock ? 'Mindestbestand unterschritten' : undefined;

  // Persistiere Änderungen in localStorage
  saveMockStore(mockStore);

  return new Response(JSON.stringify(product), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Business Rules:**
1. `newStock = currentStock + quantity`
2. `newStock >= 0` (sonst 400 Error)
3. `isLowStock = stock < minStock`
4. `warning` nur gesetzt wenn `isLowStock === true`
5. `lastChanged` auf aktuellen Timestamp setzen

---

## 5. Persistierung (localStorage)

### 5.1 Storage Key
```typescript
const STORAGE_KEY = 'inventory-mock-store';
```

### 5.2 Datenstruktur im localStorage
```json
{
  "products": [
    {
      "barcode": "12345",
      "name": "Schrauben M3",
      "stock": 15,
      "warehouse": "Werkstatt",
      "minStock": 20,
      "lastChanged": "2024-11-17T10:35:00.000Z",
      "isLowStock": true,
      "warning": "Mindestbestand unterschritten"
    }
  ]
}
```

### 5.3 Funktionen

#### 5.3.1 initMockStore()
**Zweck:** Initialisiert Mock-Store beim App-Start

**Ablauf:**
1. Prüfe ob Mock-Modus aktiv
2. Versuche Daten aus localStorage zu laden
3. Bei Erfolg: Verwende gespeicherte Daten
4. Bei Fehler oder keine Daten: Verwende Initial-Daten
5. Logge Ergebnis in Console

**Implementierung:**
```typescript
function initMockStore() {
  if (!isMockMode) return { products: [] };
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('🎭 Mock Store: Loaded from localStorage', 
                  parsed.products.length, 'products');
      return parsed;
    }
  } catch (error) {
    console.warn('🎭 Mock Store: Failed to load from localStorage', error);
  }
  
  console.log('🎭 Mock Store: Initialized with default data');
  return { products: [...INITIAL_MOCK_DATA] };
}
```

#### 5.3.2 saveMockStore()
**Zweck:** Speichert Mock-Store nach jeder Änderung

**Trigger:**
- Nach jedem erfolgreichen `/adjust` Call

**Implementierung:**
```typescript
function saveMockStore(store: typeof mockStore) {
  if (!isMockMode) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    console.log('🎭 Mock Store: Saved to localStorage');
  } catch (error) {
    console.warn('🎭 Mock Store: Failed to save to localStorage', error);
  }
}
```

#### 5.3.3 resetMockStore()
**Zweck:** Setzt Mock-Store auf Initial-Daten zurück

**Trigger:**
- User klickt "Daten zurücksetzen" Button

**Implementierung:**
```typescript
function resetMockStore() {
  if (!isMockMode) return;
  
  localStorage.removeItem(STORAGE_KEY);
  mockStore.products = [...INITIAL_MOCK_DATA];
  console.log('🎭 Mock Store: Reset to initial data');
}
```

### 5.4 Error Handling

**Fehlerszenarien:**

1. **localStorage deaktiviert (Inkognito-Modus)**
   - Fallback: In-Memory Store (funktioniert nur während Session)
   - Warnung in Console

2. **localStorage voll (Quota exceeded)**
   - Warnung in Console
   - App funktioniert weiter ohne Persistierung

3. **JSON Parse Error**
   - Fallback: Initial-Daten
   - Warnung in Console

---

## 6. UI-Komponenten

### 6.1 Mock-Modus Banner

**Anzeige-Bedingung:** `isMockMode === true`

**Design:**
```jsx
<div style={{
  padding: '10px',
  background: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '4px',
  marginBottom: '20px'
}}>
  <p style={{ margin: 0, fontSize: '14px' }}>
    🎭 <strong>Mock-Modus aktiv</strong> - Daten werden in localStorage gespeichert
    <button onClick={handleResetMockData} style={{...}}>
      🔄 Daten zurücksetzen
    </button>
  </p>
</div>
```

**Funktionalität:**
- Informiert User über Mock-Modus
- Bietet Reset-Button für Initial-Daten

### 6.2 Reset-Button Handler

```typescript
const handleResetMockData = () => {
  if (isMockMode && confirm('Mock-Daten auf Initial-Werte zurücksetzen?')) {
    resetMockStore();
    loadProducts();
    setScannedProduct(null);
    alert('✅ Mock-Daten wurden zurückgesetzt!');
  }
};
```

**Ablauf:**
1. Prüfe Mock-Modus
2. Zeige Bestätigungs-Dialog
3. Bei Bestätigung: Reset durchführen
4. Produktliste neu laden
5. Gescanntes Produkt zurücksetzen
6. Erfolgs-Meldung anzeigen

---

## 7. Logging & Debugging

### 7.1 Console Logs

**App-Start:**
```
🔧 API_URL: http://localhost:3000/api
🔧 ENV VITE_API_URL: http://localhost:3000/api
🎭 Mock Mode: ACTIVE (Vercel)
🎭 Mock Store: Loaded from localStorage 2 products
```

**API Calls:**
```
🎭 Mock API Call: http://localhost:3000/api/scan POST
🎭 Mock API Call: http://localhost:3000/api/adjust POST
```

**Stock Änderungen:**
```
🎭 Mock: Stock adjusted {
  barcode: "12345",
  oldStock: 10,
  newStock: 15,
  quantity: 5
}
🎭 Mock Store: Saved to localStorage
```

**Reset:**
```
🎭 Mock Store: Reset to initial data
```

### 7.2 Debug-Tools

**localStorage Inspector:**
```javascript
// Browser Console (F12):
localStorage.getItem('inventory-mock-store')

// Output:
'{"products":[{"barcode":"12345","name":"Schrauben M3",...}]}'
```

**Mock-Modus Status:**
```javascript
window.location.hostname.includes('vercel')  // true auf Vercel
```

**Manual Reset:**
```javascript
localStorage.removeItem('inventory-mock-store')
location.reload()
```

---

## 8. Testing

### 8.1 Unit Tests

**Nicht im Scope:**
- Mock-Logic wird NICHT getestet
- Jest-Tests laufen gegen echtes Backend

**Rationale:**
- Mock ist Deployment-Lösung, keine Business-Logic
- BDD-Tests decken Business-Anforderungen ab

### 8.2 Manuelle Tests

#### Test Case 1: Mock-Aktivierung
```
Schritte:
1. Deploy auf Vercel
2. Öffne URL in Browser
3. F12 → Console

Erwartung:
✅ "🎭 Mock Mode: ACTIVE (Vercel)"
✅ Banner sichtbar: "Mock-Modus aktiv"
```

#### Test Case 2: localStorage Persistierung
```
Schritte:
1. Barcode "12345" scannen
2. "Add 5" klicken (Stock: 10 → 15)
3. F5 drücken (Page Refresh)

Erwartung:
✅ Stock bleibt bei 15
✅ Console: "Loaded from localStorage"
```

#### Test Case 3: Reset-Funktionalität
```
Schritte:
1. Stock bei 15 (nach Test 2)
2. "Daten zurücksetzen" klicken
3. Bestätigen

Erwartung:
✅ Stock zurück bei 10
✅ Alert: "Mock-Daten wurden zurückgesetzt!"
```

#### Test Case 4: Negative Stock Prevention
```
Schritte:
1. Barcode "12345" scannen (Stock: 10)
2. Remove 3 × 4 = 12 (würde negative werden)

Erwartung:
✅ Nach 3x Remove 3: Stock = 1
✅ "Remove 3" Button disabled
✅ Fehler: "Entnahme nicht möglich – zu wenig auf Lager"
```

#### Test Case 5: Low Stock Warning
```
Schritte:
1. Barcode "99999" scannen (Stock: 15, minStock: 20)

Erwartung:
✅ Produkt ROT markiert
✅ Warnung: "Mindestbestand unterschritten"
```

---

## 9. Performance

### 9.1 Metriken

| Operation | Mock (Vercel) | Real API (localhost) |
|-----------|---------------|----------------------|
| GET /products | ~100ms | ~50-100ms + Network |
| POST /scan | ~100ms | ~50-100ms + Network |
| POST /adjust | ~100ms | ~50-100ms + Network |
| localStorage read | ~1-5ms | N/A |
| localStorage write | ~1-5ms | N/A |

**Simulierter Delay:**
```typescript
await new Promise(resolve => setTimeout(resolve, 100));
```

**Rationale:**
- Realistische UX (nicht instant)
- Zeigt Loading-States
- Verhindert Race-Conditions

### 9.2 Storage-Limits

**localStorage Quota:**
- Browser: ~5-10 MB pro Domain
- Aktueller Verbrauch: ~1-2 KB (2 Produkte)
- Skalierung: Bis ~1000 Produkte problemlos möglich

---

## 10. Sicherheit

### 10.1 Bedrohungsmodell

**Keine sensiblen Daten:**
- ✅ Nur Demo-Daten (Schrauben, Muttern)
- ✅ Keine User-Daten, Credentials, PII
- ✅ Öffentlich einsehbar (by design)

**localStorage-Risiken:**
- ⚠️ XSS: Nicht relevant (keine User-Input-Injection)
- ⚠️ Third-Party Scripts: Keine eingebunden
- ✅ Same-Origin Policy schützt vor Cross-Domain-Access

### 10.2 Best Practices

**Was wir NICHT tun (weil nicht nötig):**
- ❌ Encryption (Daten nicht sensitiv)
- ❌ Authentication (Public Demo)
- ❌ Rate Limiting (Mock ist lokal)

**Was wir tun:**
- ✅ Input Validation (negative Stock prevention)
- ✅ Error Handling (try-catch für localStorage)
- ✅ Type Safety (TypeScript)

---

## 11. Deployment

### 11.1 Vercel-Konfiguration

**`vercel.json`:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "public": true
}
```

### 11.2 Environment Variables

**Nicht benötigt:**
- `VITE_API_URL` wird ignoriert (Mock übersteuert)

**Optional (für Dokumentation):**
```bash
VITE_API_URL=http://localhost:3000/api
```

### 11.3 Build-Prozess

```bash
cd frontend
npm run build
vercel --prod
```

**Output:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js   (~149 KB)
│   └── index-[hash].css  (~2.5 KB)
```

---

## 12. Wartung

### 12.1 Initial-Daten ändern

**Datei:** `frontend/src/App.tsx`

```typescript
const INITIAL_MOCK_DATA = [
  {
    barcode: 'NEUE_ID',
    name: 'Neues Produkt',
    stock: 50,
    warehouse: 'Lager',
    minStock: 20,
    // ...
  }
];
```

**Deployment:**
1. Änderung committen
2. `git push`
3. `vercel --prod`
4. User müssen localStorage clearen oder Reset-Button nutzen

### 12.2 Neue Endpoints hinzufügen

**Beispiel: POST /create**

```typescript
// In apiFetch():
if (urlPath === '/create' && method === 'POST') {
  const body = JSON.parse(options?.body as string);
  const newProduct = { ...body, lastChanged: new Date().toISOString() };
  
  mockStore.products.push(newProduct);
  saveMockStore(mockStore);
  
  return new Response(JSON.stringify(newProduct), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 12.3 Mock deaktivieren

**Option 1: Hostname-Check ändern**
```typescript
const isMockMode = false; // Mock immer aus
```

**Option 2: Environment-Variable**
```typescript
// @ts-ignore
const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';
```

---

## 13. Bekannte Limitierungen

### 13.1 Technische Limits

1. **Keine Concurrent Users**
   - localStorage ist pro Browser/User
   - Keine Synchronisation zwischen Usern

2. **Kein Server-Side State**
   - Bei SSR/SSG nicht verfügbar
   - Nur Client-Side

3. **Browser-Abhängig**
   - localStorage kann deaktiviert sein
   - Inkognito-Modus: Daten gehen verloren

### 13.2 Business-Logic Limits

1. **Kein Audit-Log**
   - Nur letzter Timestamp, keine Historie

2. **Keine Benutzer-Trennung**
   - Ein Mock-Store für alle Sessions

3. **Keine Validierung komplexer Regeln**
   - Nur Basic Validation (negative Stock)

---

## 14. Zukunft / Roadmap

### 14.1 Mögliche Erweiterungen

**Phase 1 (Kurzfristig):**
- [ ] IndexedDB statt localStorage (mehr Speicher)
- [ ] Offline-Sync mit echtem Backend
- [ ] Export/Import von Mock-Daten (JSON)

**Phase 2 (Mittelfristig):**
- [ ] Mock-Admin-UI (Produkte verwalten)
- [ ] Multiple Mock-Stores (Szenarien switchen)
- [ ] Mock-Daten aus API laden (hybrid)

**Phase 3 (Langfristig):**
- [ ] Service Worker für vollständige Offline-Fähigkeit
- [ ] WebSocket-Mock für Realtime-Features
- [ ] Shared localStorage über BroadcastChannel

### 14.2 Migrationsplan (Mock → Real Backend)

**Wenn echtes Backend deployed wird:**

1. **Environment-Variable setzen:**
   ```bash
   VITE_API_URL=https://api.production.com
   ```

2. **Mock-Modus deaktivieren:**
   ```typescript
   const isMockMode = false;
   ```

3. **Re-deploy:**
   ```bash
   vercel --prod
   ```

4. **Cleanup (optional):**
   - Mock-Code entfernen
   - localStorage-Functions löschen

---

## 15. Referenzen

### 15.1 Interne Dokumente
- `inventory.feature` - BDD-Spezifikation
- `MOCK_IMPLEMENTATION.md` - Implementierungs-Übersicht
- `LOCALSTORAGE_FIX.md` - Persistierung-Details
- `VERCEL_DEPLOYMENT.md` - Deployment-Anleitung

### 15.2 Externe Ressourcen
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Response API](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- [Vercel Documentation](https://vercel.com/docs)

---

## 16. Änderungshistorie

| Version | Datum | Autor | Änderungen |
|---------|-------|-------|------------|
| 1.0 | 2024-11-17 | AI Assistant | Initial Release - Mock-Backend vollständig implementiert |

---

## 17. Genehmigung

**Status:** ✅ Implementiert und deployed

**Tested by:** User (Manual Testing auf Vercel)  
**Approved by:** User  
**Deployment:** https://inventory-91w9ap6oc-wolfgang-kubisiaks-projects.vercel.app

---

**Ende der technischen Spezifikation**

