# 📦 Inventory Management System

A modern, bilingual inventory management system built with **BDD principles**.

---

## ✨ Features

- 🌍 **Bilingual Support** - German 🇩🇪 and English 🇬🇧
- 📱 **Barcode Scanning** - Quick product lookup
- ➕ **Hardcoded Actions** - Add 5 / Remove 3 buttons
- ⚠️ **Low Stock Warnings** - Visual alerts for inventory below minimum
- 💾 **Mock Mode** - Works on Vercel with localStorage persistence
- 🎯 **BDD-Driven** - 5/5 scenarios passing

---

## 🌍 Language Support

Switch between German and English seamlessly:
- 🇩🇪 **German** (Deutsch)
- 🇬🇧 **English**

Language preference is saved and persists across sessions.

See [I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md) for details.

---

## 🚀 Quick Start

### **Backend**
```bash
cd backend
npm install
npm start  # Runs on http://localhost:3000
```

### **Frontend**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

---

## 📋 BDD Specifications

All scenarios implemented and tested:

1. ✅ Scan barcode and increase stock
2. ✅ Scan barcode and decrease stock
3. ✅ Create new product
4. ✅ Display inventory overview
5. ✅ Low stock warning

See [inventory.feature](./inventory.feature) (German) or [english.inventory.feature](./english.inventory.feature) (English)

---

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## 📚 Documentation

- [I18N Implementation](./I18N_IMPLEMENTATION.md) - Internationalization details
- [Mock Implementation](./TECHNICAL_SPEC_MOCK.md) - Frontend mock backend
- [Manual Testing Guide](./MANUAL_TEST.md) - Step-by-step testing
- [API Testing](./API_TEST.md) - Backend API endpoints

---

## 🎯 Test Products

Initial data includes:

| Barcode | Product | Stock | Min Stock | Status |
|---------|---------|-------|-----------|--------|
| 12345   | Schrauben M3 | 10 | 20 | ⚠️ Low |
| 99999   | Muttern M5 | 15 | 20 | ⚠️ Low |

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- i18next (internationalization)
- React Testing Library

**Backend:**
- Node.js + Express
- sql.js (SQLite in memory)
- Jest + Supertest

---

## 📦 Deployment

**Frontend:** Vercel (with mock mode)  
**Backend:** Can be deployed to any Node.js hosting

Mock mode automatically activates on Vercel domains.

---

## ⚠️ Note: Barcode Scanning

This demo uses **manual barcode input** (text field).  
Real camera integration (Quagga2) available for production.

---

## 📄 License

Demo Application - Educational Purposes
