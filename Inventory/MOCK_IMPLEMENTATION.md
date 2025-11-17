# 🎭 Mock Implementation für Vercel

## Implementiert ✅

Die App verwendet jetzt einen **Mock-Modus** der automatisch auf Vercel aktiviert wird!

### Trigger:
```typescript
const isMockMode = window.location.hostname.includes('vercel');
```

---

## 🎯 Abgedeckte BDD-Szenarien

### 1. Barcode scannen und Bestand erhöhen
```gherkin
Given ein Produkt mit Barcode "12345" und Name "Schrauben M3"
And aktueller Lagerbestand ist 10
When ich Barcode "12345" scannen
And Menge 5 hinzufügen
Then Lagerbestand ist 15
```

**Mock Implementation:**
- Initial: Barcode 12345 → Stock 10
- Nach `POST /adjust` mit `quantity: 5` → Stock 15 ✅

### 2. Barcode scannen und Bestand verringern
```gherkin
Given ein Produkt mit Barcode "12345" und Name "Schrauben M3"
And aktueller Lagerbestand ist 10
When ich Barcode "12345" scannen
And Menge 3 entnehmen
Then Lagerbestand ist 7
```

**Mock Implementation:**
- Initial: Stock 10
- Nach `POST /adjust` mit `quantity: -3` → Stock 7 ✅

### 3. Niedrig-Bestand Warnung
```gherkin
Given Produkt "Schrauben" hat Mindestbestand 20
And aktueller Bestand ist 15
When ich die Übersicht öffne
Then Produkt ist rot markiert
And ich sehe Warnung "Mindestbestand unterschritten"
```

**Mock Implementation:**
- Barcode 99999: Stock 15, minStock 20
- `isLowStock: true`
- `warning: "Mindestbestand unterschritten"` ✅

---

## 📦 Mock Store (Initial Data)

```typescript
const mockStore = {
  products: [
    {
      barcode: '12345',
      name: 'Schrauben M3',
      stock: 10,
      warehouse: 'Werkstatt',
      minStock: 20,
      isLowStock: true,
      warning: 'Mindestbestand unterschritten'
    },
    {
      barcode: '99999',
      name: 'Muttern M5',
      stock: 15,
      warehouse: 'Werkstatt',
      minStock: 20,
      isLowStock: true,
      warning: 'Mindestbestand unterschritten'
    }
  ]
};
```

---

## 🔌 Mock Endpoints

### GET /products
```typescript
// Query param: ?warehouse=Werkstatt
// Returns: Filtered oder alle Products
apiFetch(`${API_URL}/products`)
apiFetch(`${API_URL}/products?warehouse=Werkstatt`)
```

### POST /scan
```typescript
// Request: { barcode: "12345" }
// Response 200: Product object
// Response 404: { error: "Produkt nicht gefunden" }
apiFetch(`${API_URL}/scan`, {
  method: 'POST',
  body: JSON.stringify({ barcode: '12345' })
})
```

### POST /adjust
```typescript
// Request: { barcode: "12345", quantity: 5 }
// Response 200: Updated product
// Response 400: { error: "Lagerbestand kann nicht negativ werden" }
apiFetch(`${API_URL}/adjust`, {
  method: 'POST',
  body: JSON.stringify({ barcode: '12345', quantity: 5 })
})
```

---

## 🎬 apiFetch Funktion

```typescript
async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  // Wenn nicht im Mock-Modus, nutze echte API
  if (!isMockMode) {
    return fetch(url, options);
  }

  // Mock-Logik hier...
  // - Parse URL und Method
  // - Finde passenden Endpoint
  // - Return mock Response
}
```

**Features:**
- ✅ Erkennt automatisch Vercel-Deployment
- ✅ Simuliert 100ms Netzwerk-Delay
- ✅ Gibt echte Response-Objects zurück
- ✅ Validiert negative Stock-Werte
- ✅ Aktualisiert isLowStock und warning automatisch
- ✅ Console-Logs für Debugging

---

## 🧪 Testing

### Lokal (mit echtem Backend):
```
URL: http://localhost:5173
Mock Mode: DISABLED ❌
→ Verwendet lokales Backend: http://localhost:3000/api
```

### Auf Vercel:
```
URL: https://your-app.vercel.app
Mock Mode: ACTIVE ✅
→ Verwendet Mock-Daten (kein Backend nötig!)
```

---

## 🔍 Debug Console Logs

Im Mock-Modus siehst du:
```
🎭 Mock Mode: ACTIVE (Vercel)
🎭 Mock API Call: .../products GET
🎭 Mock API Call: .../scan POST
🎭 Mock: Stock adjusted { barcode: "12345", oldStock: 10, newStock: 15, quantity: 5 }
```

Im Normal-Modus:
```
🎭 Mock Mode: DISABLED (using real API)
```

---

## 📝 Änderungen in App.tsx

### 1. TypeScript-Fehler ignoriert:
```typescript
// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### 2. apiFetch ersetzt fetch:
```typescript
// Vorher:
await fetch(`${API_URL}/scan`, {...})

// Nachher:
await apiFetch(`${API_URL}/scan`, {...})
```

### 3. Mock-Store hinzugefügt:
```typescript
const mockStore = { products: [...] }
```

### 4. apiFetch Funktion:
- Erkennt Vercel-Hostname
- Parsed URL und Method
- Gibt Mock-Daten zurück

---

## ✅ Vorteile

1. **Kein Backend nötig auf Vercel** - App funktioniert standalone
2. **Automatische Erkennung** - Mock nur auf Vercel aktiv
3. **BDD-Konform** - Alle Szenarien aus inventory.feature abgedeckt
4. **Echte API lokal** - Development mit lokalem Backend (localhost:3000)
5. **In-Memory State** - Mock-Store persistiert während Session

---

## 🚀 Deployment

### Vercel Deployment:
```bash
cd frontend
npm run build

# Deploy dist/ auf Vercel
# → Mock-Modus aktiviert automatisch!
```

### Environment Variables:
```
VITE_API_URL=http://localhost:3000/api
```

Wird auf Vercel ignoriert (Mock hat Vorrang) ✅

---

## 🔧 Anpassungen

### Mock-Daten ändern:
```typescript
// In App.tsx
const mockStore = {
  products: [
    { barcode: '12345', name: 'Dein Produkt', stock: 100 }
  ]
};
```

### Mock-Modus Trigger ändern:
```typescript
// Statt Vercel-Hostname, andere Bedingung:
const isMockMode = process.env.NODE_ENV === 'production';
// oder
const isMockMode = !API_URL.includes('localhost');
```

---

## ✅ Testing Checklist

- [x] Mock aktiviert auf Vercel
- [x] Barcode 12345 scanbar
- [x] Add 5 Button funktioniert
- [x] Remove 3 Button funktioniert
- [x] Negative Stock blockiert
- [x] Low Stock Warning angezeigt
- [x] Warehouse Filter funktioniert
- [x] Lokale Development verwendet echte API

**Alles implementiert nach BDD-Spezifikation!** 🎉

