# Inventory Management System (Lagerbestand Management)

BDD implementation of an inventory barcode scanning system built with TDD approach.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + sql.js (SQLite)
- **Testing**: Jest + Supertest + React Testing Library

## Project Structure

```
Inventory/
├── backend/
│   ├── server.js              # Express API server
│   ├── inventory.test.js      # Backend tests (all scenarios)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── App.css           # Styling
│   │   ├── App.test.tsx      # Frontend tests
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   └── package.json
└── inventory.feature          # BDD scenarios (German)
```

## Implemented Scenarios (1:1 BDD Match)

### ✅ Scenario 1: Barcode scannen und Bestand erhöhen
- **User Action**: Scan barcode "12345" → Click "Add 5" button
- **Result**: Stock increases from 10 to 15
- **Test**: Verifies stock adjustment and timestamp update

### ✅ Scenario 2: Barcode scannen und Bestand verringern
- **User Action**: Scan barcode "12345" → Click "Remove 3" button
- **Result**: Stock decreases from 10 to 7
- **Test**: Verifies stock adjustment and consumption logging

### ✅ Scenario 3: Neues Produkt anlegen
- **User Action**: Create new product via API
- **Result**: Product saved with initial stock 0
- **Test**: Verifies product creation endpoint

### ✅ Scenario 4: Lagerbestand anzeigen
- **User Action**: View overview and filter by warehouse
- **Result**: Shows all products, filtering works
- **Test**: Verifies product display and warehouse filtering

### ✅ Scenario 5: Niedrig-Bestand Warnung
- **Condition**: Stock (15) < minStock (20)
- **Result**: Product marked RED + warning "Mindestbestand unterschritten"
- **Test**: Verifies visual warning display

## Installation & Running

### Backend

```bash
cd backend
npm install
npm test          # Run tests (should all pass ✅)
npm run dev       # Start server on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm test          # Run tests (should all pass ✅)
npm run dev       # Start dev server on http://localhost:5173
```

## API Endpoints

```
POST   /api/products              # Create product
GET    /api/products              # List all products
GET    /api/products?warehouse=X  # Filter by warehouse
GET    /api/products/:barcode     # Get single product
POST   /api/products/:barcode/adjust  # Adjust stock (+/-)
GET    /api/products/:barcode/logs    # Get history logs
```

## Test Results

### Backend Tests
```
✓ Scenario 1: Barcode scannen und Bestand erhöhen
✓ Scenario 2: Barcode scannen und Bestand verringern
✓ Scenario 3: Neues Produkt anlegen
✓ Scenario 4: Lagerbestand anzeigen
✓ Scenario 5: Niedrig-Bestand Warnung

5 tests passing
```

### Frontend Tests
```
✓ Scenario: Create new product and display in overview
✓ Scenario: Adjust stock up and down
✓ Scenario: Low stock warning
✓ Scenario: Filter by warehouse

4 tests passing
```

## Key Implementation Details (BDD Spec Exact Match)

### 🎯 Critical Features (As Specified)
1. **Barcode Scanner** - Input field + "Scannen" button (not manual form)
2. **Hardcoded Buttons** - "Add 5" and "Remove 3" (no quantity input)
3. **Initial Data** - Products 12345 and 99999 pre-loaded at startup
4. **Low Stock Warning** - Stock < 20 → RED + warning message

### Simplicity (as requested)
- No over-engineering
- Hardcoded warehouse list: ["Werkstatt", "Lager"]
- Hardcoded action buttons (Add 5, Remove 3)
- In-memory SQLite database
- Direct fetch calls (no abstraction layers)
- Minimal state management

### Real DB (no mocking)
- Backend tests use real SQL.js database
- Database seeded with initial data for each test
- Actual SQL queries executed

### Business Outcome Testing
- Tests verify actual stock values (10 → 15, 10 → 7)
- Check for warning messages and red UI
- Validate logs are created
- Verify filtering results

## Development Approach

1. ✅ **Tests First** - All tests written before implementation
2. ✅ **Red-Green-Refactor** - Tests failed initially, then passed
3. ✅ **1:1 Scenarios** - Each BDD scenario has corresponding test
4. ✅ **No Extra Features** - Only implemented what's in scenarios
5. ✅ **Real Database** - No mocks for database operations

## Notes

- Uses `sql.js` (pure JavaScript SQLite) for compatibility
- Database is in-memory (resets on server restart)
- Frontend uses mock fetch for unit tests
- Backend uses real database for integration tests
