# API Test Guide - Barcode Scanning

## New Endpoints Implemented

### 1. POST /api/scan
Scan a barcode and retrieve product info.

**Request:**
```bash
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"barcode": "12345"}'
```

**Response (Success):**
```json
{
  "barcode": "12345",
  "name": "Schrauben M3",
  "stock": 10,
  "warehouse": "Werkstatt",
  "minStock": 20,
  "lastChanged": "2025-11-12T...",
  "isLowStock": true,
  "warning": "Mindestbestand unterschritten"
}
```

**Response (Not Found):**
```json
{
  "error": "Produkt nicht gefunden"
}
```

---

### 2. POST /api/adjust
Adjust stock for a product.

**Request (Add 5):**
```bash
curl -X POST http://localhost:3000/api/adjust \
  -H "Content-Type: application/json" \
  -d '{"barcode": "12345", "quantity": 5}'
```

**Request (Remove 3):**
```bash
curl -X POST http://localhost:3000/api/adjust \
  -H "Content-Type: application/json" \
  -d '{"barcode": "12345", "quantity": -3}'
```

**Response:**
```json
{
  "barcode": "12345",
  "name": "Schrauben M3",
  "stock": 15,
  "warehouse": "Werkstatt",
  "minStock": 20,
  "lastChanged": "2025-11-12T...",
  "isLowStock": true,
  "warning": "Mindestbestand unterschritten"
}
```

---

## Manual Test Flow

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

### Step 2: Test Scan Endpoint
```bash
# Test with existing product
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"barcode": "12345"}'

# Test with non-existing product
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"barcode": "99999999"}'
```

### Step 3: Test Adjust Endpoint
```bash
# Add 5 to stock
curl -X POST http://localhost:3000/api/adjust \
  -H "Content-Type: application/json" \
  -d '{"barcode": "12345", "quantity": 5}'

# Remove 3 from stock
curl -X POST http://localhost:3000/api/adjust \
  -H "Content-Type: application/json" \
  -d '{"barcode": "12345", "quantity": -3}'
```

### Step 4: Start Frontend
```bash
cd frontend
npm run dev
```

### Step 5: Test UI
1. Open http://localhost:5173
2. Type `12345` in barcode field
3. Click "Scannen" button
4. **Expected**: Product "Schrauben M3" appears with stock and warning
5. Click "Add 5" button
6. **Expected**: Stock increases by 5
7. Click "Remove 3" button
8. **Expected**: Stock decreases by 3

---

## Error Handling

### Network Error
If backend is not running:
- Alert: "Verbindungsfehler. Ist der Server gestartet?"

### Product Not Found
If barcode doesn't exist:
- Alert: "Produkt nicht gefunden"

### Stock Adjustment Error
If stock adjustment fails:
- Alert: "Fehler beim Aktualisieren des Bestands"

---

## Key Features Verified

✅ POST /api/scan endpoint works
✅ POST /api/adjust endpoint works
✅ Error handling for 404
✅ Low stock warning included in response
✅ Frontend shows scanned product
✅ "Add 5" button updates stock
✅ "Remove 3" button updates stock
✅ Real API calls (no mocks in production)

