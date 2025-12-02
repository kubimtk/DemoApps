# 3-Day MVP Sprints – Demo Apps

**Von signierten BDD-Specs zu lauffähigen Prototypen – in 72 Stunden für 5.000€.**

Dieses Repository enthält Demo-Apps, die nach meinem 3-Day-Sprint-Prozess gebaut wurden. Keine Scope-Diskussionen, alle Tests grün, Code gehört dir vollständig.

---

## 💡 Was ist ein 3-Day MVP Sprint?

**Problem:** Product Manager verlieren 4-6 Wochen mit MVP-Briefings, die in endlosen Revisionen versinken.

**Lösung:** Du signierst die BDD-Spec, ich liefere den funktionierenden Prototyp in genau 72 Stunden.

**Wie?** Cursor AI + Claude 3.5 Sonnet + 40 Jahre Erfahrung als Safety-Layer.

---

## 🎯 Demo-Apps

### 1️⃣ **Appointment Manager** | Termin-Management mit Auto-Email
**Problem gelöst:** Manuelles Termin-Verschieben → automatisierte Kundenbenachrichtigung

**Live Demo:** [appointment-manager.vercel.app](https://appointment-manager-4va4jnqv4-wolfgang-kubisiaks-projects.vercel.app)  
**BDD-Spec:** [appointments.feature](./appointment-manager/appointments.feature)  
**GitHub:** [appointment-manager/](./appointment-manager/)

**Features:**
- ✅ Termine erstellen, verschieben, stornieren
- ✅ Email-Mock mit sichtbarem Log-Panel
- ✅ Such/Filter-Funktion
- ✅ Export-Funktion (JSON-Download)
- ✅ Toast-Notifications & Loading-States
- ✅ localStorage-Persistenz
- ✅ Responsive Design (Mobile, Tablet, Desktop)

**Tech Stack:**
- React 18 + TypeScript + Vite
- Tailwind CSS
- localStorage (Mock Backend)

**Key Metrics:**
- 3 BDD-Szenarien → alle grün
- ~500 Zeilen Code
- Entwicklungszeit: ~20 Stunden

---

## ⚙️ Der 3-Day Prozess

1. **Tag 0**: BDD-Spec Review & Signierung
2. **Tag 1-3**: Entwicklung mit AI + Safety-Layer
3. **Tag 3**: Lieferung + Übergabe

**Ergebnis:** Funktionierender Prototyp, alle Tests grün, volle Code-Rechte.

---

## 🚀 Quick Start

Jede Demo-App hat ihre eigene README mit detaillierten Anweisungen:

```bash
# Appointment Manager
cd appointment-manager/frontend
npm install
npm run dev
```

---

## 📦 Weitere Demo-Apps (Coming Soon)

### 2️⃣ **Inventar-Tracker** | Barcode-Scan → Lagerbestand
**Status:** In Planung

### 3️⃣ **Internes FAQ-Tool** | Suche + Admin-Panel
**Status:** In Planung

---

## 📞 Kontakt

Interesse an einem eigenen 3-Day MVP Sprint?

**Preis:** 5.000€ (72h, alle Rechte inklusive)  
**Follow-up-Sprints:** 1.500€/Tag (z.B. Backend-Integration, Auth, Deployment)

---

## License

MIT – you can use, fork, learn from this code.  
**For commercial projects, I transfer full rights after payment.**
