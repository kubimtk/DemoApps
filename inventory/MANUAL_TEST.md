# Manual Test Guide (BDD Spec Verification)

## Setup
```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend
cd frontend && npm run dev

# Visit: http://localhost:5173
```

## Test Scenarios (Follow Exactly)

### ✅ Scenario 1: Barcode scannen und Bestand erhöhen

**Steps:**
1. Open app in browser
2. In "Barcode scannen" section, type: `12345`
3. Click "Scannen" button
4. **Expected**: Product "Schrauben M3" appears with "Aktueller Bestand: 10"
5. **Expected**: Product shows RED (low stock warning)
6. Click "Add 5" button
7. **Expected**: Stock updates to "Aktueller Bestand: 15"
8. **Expected**: Overview section updates to show stock 15

---

### ✅ Scenario 2: Barcode scannen und Bestand verringern

**Steps:**
1. In "Barcode scannen" section, type: `12345`
2. Click "Scannen" button
3. **Expected**: Product "Schrauben M3" appears with current stock
4. Click "Remove 3" button
5. **Expected**: Stock decreases by 3
6. **Expected**: Overview section reflects the change

---

### ✅ Scenario 5: Niedrig-Bestand Warnung

**Steps:**
1. Look at "Lagerbestand Übersicht" section
2. **Expected**: Product "Muttern M5" (barcode 99999) is visible
3. **Expected**: Shows "Bestand: 15"
4. **Expected**: Product card has RED border (low-stock class)
5. **Expected**: Shows warning text "Mindestbestand unterschritten"

**Why?** Stock (15) < minStock (20) → triggers warning

---

### ✅ Scenario 4: Lagerbestand anzeigen (Filter)

**Steps:**
1. Look at "Lagerbestand Übersicht" section
2. **Expected**: See products 12345 and 99999 (both in Werkstatt)
3. Change "Lager filtern" dropdown to "Werkstatt"
4. **Expected**: Only Werkstatt products visible
5. Change filter to "Lager"
6. **Expected**: No products shown (none in Lager from seeding)

---

## Initial Data Verification

At startup, the database contains:

| Barcode | Name | Stock | Warehouse | minStock | Warning? |
|---------|------|-------|-----------|----------|----------|
| 12345 | Schrauben M3 | 10 | Werkstatt | 20 | ✅ RED |
| 99999 | Muttern M5 | 15 | Werkstatt | 20 | ✅ RED |

Both products show warning because stock < 20.

---

## UI Features to Verify

### Barcode Scanner Section
- ✅ Large input field with placeholder "Barcode eingeben oder scannen"
- ✅ Blue "Scannen" button
- ✅ After scanning: Product details appear in green bordered box
- ✅ Two large buttons: "Add 5" (green) and "Remove 3" (yellow)

### Overview Section
- ✅ Product cards show: Name, Barcode, Lager, Bestand
- ✅ Low stock products have RED border
- ✅ Warning text appears on low stock items
- ✅ Dropdown filter for warehouse selection

---

## What NOT to Expect

❌ No manual quantity input fields
❌ No product creation form in UI
❌ No generic +/- buttons (only "Add 5" and "Remove 3")
❌ No editable fields in overview section

## Success Criteria

✅ All hardcoded buttons work correctly
✅ Barcode scanner loads product info
✅ Red warnings appear when stock < 20
✅ Overview filters by warehouse
✅ Initial data (12345, 99999) present at startup

