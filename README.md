# 3-Day MVP Sprints – Demo Apps

**Von signierten BDD-Specs zu lauffähigen Prototypen – in 72 Stunden für 5.000€.**

Dieses Repository enthält 3 vollständige Demo-Apps, die nach meinem 3-Day-Sprint-Prozess gebaut wurden. Keine Scope-Diskussionen, alle Tests grün, Code gehört dir vollständig.

---

## 💡 Was ist ein 3-Day MVP Sprint?

**Problem:** Product Manager verlieren 4-6 Wochen mit MVP-Briefings, die in endlosen Revisionen versinken.

**Lösung:** Du signierst die BDD-Spec, ich liefere den funktionierenden Prototyp in genau 72 Stunden.

**Wie?** Cursor AI + Claude 3.5 Sonnet + 40 Jahre Erfahrung als Safety-Layer.

---

## 🎯 Die 3 Demo-Apps (jede in 72h gebaut)

### 1️⃣ **Inventar-Tracker** | Barcode-Scan → Lagerbestand
**Problem gelöst:** Excel-Listen für Lagerbestände → digitale Echtzeit-Verwaltung

**BDD-Spec:** [inventory.feature](./demo-apps/inventory/inventory.feature)  
**Live Demo:** [inventory-demo.vercel.app](https://inventory-demo.vercel.app) *(ersetze mit deinem Link)*  
**Loom Zeitraffer:** [Video: 30 Sekunden Entwicklung](https://loom.com/share/inventory-demo)  
**GitHub Repo:** [demo-apps/inventory](./demo-apps/inventory/)

**Tech Stack:**
- React 18 + TypeScript + Vite
- Node.js + Express
- SQLite + better-sqlite3
- Jest + Supertest (alle Tests grün)
- Barcode-Scan mit Quagga2

**Key Metrics:**
- 10 BDD-Szenarien → 10 grüne Tests
- 1.200 Zeilen Code (inkl. Tests)
- Entwicklungszeit: 21 Stunden (Tag 1-3)

---

### 2️⃣ **Termin-Manager** | Auto-Email bei Verschiebung
**Problem gelöst:** Manuelles Termin-Verschieben → automatisierte Kundenbenachrichtigung

**BDD-Spec:** [appointments.feature](./demo-apps/appointments/appointments.feature)  
**Live Demo:** [appointments-demo.vercel.app](https://appointments-demo.vercel.app)  
**Loom Zeitraffer:** [Video: Termin-App in 72h](https://loom.com/share/appointments-demo)  
**GitHub Repo:** [demo-apps/appointments/](./demo-apps/appointments/)

**Tech Stack:**
- React + FullCalendar
- Node.js + Nodemailer (Mock)
- SQLite
- Jest + Supertest

**Key Metrics:**
- 5 BDD-Szenarien → 5 grüne Tests
- 980 Zeilen Code
- Entwicklungszeit: 19,5 Stunden

---

### 3️⃣ **Internes FAQ-Tool** | Suche + Admin-Panel
**Problem gelöst:** Mitarbeiter finden keine Antworten → Suchbasiertes Wissens-Tool

**BDD-Spec:** [faq-tool.feature](./demo-apps/faq-tool/faq-tool.feature)  
**Live Demo:** [faq-demo.vercel.app](https://faq-demo.vercel.app)  
**Loom Zeitraffer:** [Video: FAQ-Tool in 72h](https://loom.com/share/faq-tool-demo)  
**GitHub Repo:** [demo-apps/faq-tool/](./demo-apps/faq-tool/)

**Tech Stack:**
- React + Fuse.js (Suche)
- Node.js + Express
- SQLite
- Jest + Supertest

**Key Metrics:**
- 5 BDD-Szenarien → 5 grüne Tests
- 750 Zeilen Code
- Entwicklungszeit: 18 Stunden

---

## ⚙️ Der 3-Day Prozess (Visuell)


## License

MIT – you can use, fork, learn from this code.  
**For commercial projects, I transfer full rights after payment.**
