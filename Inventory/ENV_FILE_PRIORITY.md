# 📁 Vite .env File Priorität - Welche Datei ist wichtig?

## 🎯 Quick Answer

### Für Development (npm run dev):
✅ **Wichtigste Datei:** `.env.development.local`

Diese Datei hat **höchste Priorität** und überschreibt alle anderen!

```bash
frontend/.env.development.local
```

---

## 📊 Prioritäts-Reihenfolge

### Im Development-Mode (`npm run dev`):

```
┌─────────────────────────────────────────────┐
│ 1️⃣ .env.development.local  ⭐ HÖCHSTE    │
│    └─ Wird geladen, ignoriert alle anderen │
├─────────────────────────────────────────────┤
│ 2️⃣ .env.development                       │
│    └─ Wird ignoriert wenn .local existiert │
├─────────────────────────────────────────────┤
│ 3️⃣ .env.local                              │
│    └─ Niedrigere Priorität                 │
├─────────────────────────────────────────────┤
│ 4️⃣ .env                                    │
│    └─ Niedrigste Priorität                 │
└─────────────────────────────────────────────┘
```

### Im Production-Mode (`npm run build`):

```
┌─────────────────────────────────────────────┐
│ 1️⃣ .env.production.local  ⭐ HÖCHSTE     │
├─────────────────────────────────────────────┤
│ 2️⃣ .env.production                        │
├─────────────────────────────────────────────┤
│ 3️⃣ .env.local                              │
├─────────────────────────────────────────────┤
│ 4️⃣ .env                                    │
└─────────────────────────────────────────────┘
```

---

## 🗂️ Deine aktuellen Files

```
frontend/
├── .env                         ❌ Wird ignoriert
│   └─ VITE_API_URL=http://localhost:3000/api
│
├── .env.development             ❌ Wird ignoriert
│   └─ VITE_API_URL=http://localhost:3000/api
│
├── .env.local                   ❌ Wird ignoriert
│   └─ VITE_API_URL=http://localhost:3000/api
│
├── .env.development.local       ✅ AKTIV!
│   └─ VITE_API_URL=http://localhost:3000/api
│
└── .env.example                 📄 Nur Dokumentation
    └─ Wird NIE geladen
```

---

## 🎯 Was du editieren solltest

### Für Development mit lokalem Backend:
```bash
# Editiere DIESE Datei:
frontend/.env.development.local

# Inhalt:
VITE_API_URL=http://localhost:3000/api
```

### Für lokales Backend:
```bash
# Option 1: Lösche .env.development.local
rm frontend/.env.development.local

# Dann wird .env.development verwendet (localhost)
```

### Für Production Build:
```bash
# Erstelle diese Datei:
frontend/.env.production

# Inhalt:
VITE_API_URL=https://deine-production-api.com/api
```

---

## 🔍 Wie prüfe ich welche geladen wird?

### Im Code (App.tsx):
```typescript
console.log('🔧 ENV VITE_API_URL:', import.meta.env.VITE_API_URL);
```

### Im Terminal:
```bash
# Zeige alle .env Files
ls -la frontend/.env*

# Zeige Inhalt der aktiven Datei
cat frontend/.env.development.local
```

### Im Browser:
- F12 → Console
- Sollte zeigen: `http://localhost:3000/api`

---

## 🧹 Aufräumen (Optional)

Du kannst die nicht-benötigten Files löschen:

```bash
cd frontend

# Diese werden NICHT benötigt (da .development.local existiert):
rm .env.development  # Hat localhost
rm .env.local        # Wird ignoriert

# BEHALTE diese:
# .env.development.local  ✅ (aktiv)
# .env.example           ✅ (Dokumentation)
```

---

## 🎓 Vite .env Regeln

### 1. Mode-spezifische Files haben Vorrang:
```
.env.development.local > .env.development
.env.production.local > .env.production
```

### 2. `.local` Files haben Vorrang:
```
.env.development.local > .env.local > .env
```

### 3. `.local` Files werden von Git ignoriert:
```gitignore
# .gitignore
.env*.local
```

### 4. Restart erforderlich:
Nach Änderung von `.env` Files → Frontend neu starten!

```bash
pkill -f "vite"
npm run dev
```

---

## 📋 Checkliste

- [x] `.env.development.local` existiert
- [x] Nutzt lokales Backend: `http://localhost:3000/api`
- [x] Frontend neu gestartet
- [x] Browser-Console zeigt korrekte URL
- [ ] Optional: Alte `.env` Files löschen

---

## 💡 Best Practices

### Development:
```bash
# Für Team: Jeder Developer hat eigene .local Files
.env.development.local    # Deine lokale Config (Git ignoriert)
```

### Production:
```bash
# Für Production-Build
.env.production           # Committed in Git
.env.production.local     # Lokale Overrides (Git ignoriert)
```

### Dokumentation:
```bash
# Für neue Team-Mitglieder
.env.example              # Template (committed in Git)
```

---

## 🔧 Troubleshooting

### Problem: Falsche URL wird geladen

**Lösung:**
```bash
# 1. Überprüfe Priorität
ls -lt frontend/.env* | head -5

# 2. Zeige aktive Datei
cat frontend/.env.development.local

# 3. Frontend neu starten
pkill -f "vite" && npm run dev
```

### Problem: Änderungen werden nicht übernommen

**Ursache:** Vite lädt `.env` nur beim Start!

**Lösung:**
```bash
# Immer neu starten nach .env Änderungen
pkill -f "vite"
npm run dev
```

---

## ✅ Zusammenfassung

**Für dich wichtig:**

1. **Editiere NUR:** `frontend/.env.development.local`
2. **Inhalt:** `VITE_API_URL=http://localhost:3000/api`
3. **Nach Änderung:** Frontend neu starten

**Alle anderen `.env` Files werden ignoriert!** ✅

