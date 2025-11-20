# Quick Start Guide

## Run Application

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2  
cd frontend && npm run dev

# Open: http://localhost:5173
```

## Run Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Initial Data (Pre-loaded)

| Barcode | Product | Stock | Warehouse | Warning? |
|---------|---------|-------|-----------|----------|
| 12345 | Schrauben M3 | 10 | Werkstatt | 🔴 YES |
| 99999 | Muttern M5 | 15 | Werkstatt | 🔴 YES |

Both show warning because stock < 20

## Test the App

1. **Scan Product**: Enter `12345` → Click "Scannen"
2. **Add Stock**: Click "Add 5" → Stock becomes 15
3. **Remove Stock**: Click "Remove 3" → Stock becomes 12
4. **Check Warning**: Look for RED border + warning text
5. **Filter**: Use dropdown to filter by warehouse

## Key Features

✅ Barcode scanner (not manual form)
✅ "Add 5" button (hardcoded)
✅ "Remove 3" button (hardcoded)
✅ RED warning when stock < 20
✅ Products pre-loaded at startup

## Test Status

- Backend: 5/5 tests passing ✅
- Frontend: 4/4 tests passing ✅
- Total: 9/9 tests passing ✅

