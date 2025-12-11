# Appointment Manager

🇬🇧 **English** | [🇩🇪 Deutsch](#-appointment-manager-deutsch)

BDD-driven appointment management with modern dark-mode design.

## Features

- ✅ Create, reschedule, cancel appointments
- ✅ Email mock with console logs
- ✅ Search/filter functionality
- ✅ Export function (JSON download)
- ✅ Toast notifications
- ✅ Loading states
- ✅ localStorage persistence
- ✅ Responsive design (Mobile, Tablet, Desktop)

## Live Demo
https://appointment-manager-zeta.vercel.app

## ⚠️ Note: Demo Mode

This demo uses an **Email-Log-Panel** – **no real emails** are sent.  
SMTP integration can be added in production sprint for **+500€**.

**What you see:** Confirmation email appears in log.  
**What you get in real sprint:** Real SMTP connection (Postmark/SendGrid).

**Persistence:** All appointments are stored in browser (localStorage) – ideal for quick demos without backend setup.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

# 🇩🇪 Appointment Manager (Deutsch)

[🇬🇧 English](#appointment-manager) | 🇩🇪 **Deutsch**

BDD-Spec-gesteuerte Terminverwaltung mit modernem Dark-Mode Design.

## Features

- ✅ Termine erstellen, verschieben, stornieren
- ✅ Email-Mock mit Console-Logs
- ✅ Such/Filter-Funktion
- ✅ Export-Funktion (JSON-Download)
- ✅ Toast-Notifications
- ✅ Loading-States
- ✅ localStorage-Persistenz
- ✅ Responsive Design (Mobile, Tablet, Desktop)

## Live Demo
https://appointment-manager-zeta.vercel.app

## BDD Specification
[appointments.feature](./appointments.feature)

## ⚠️ Hinweis: Demo-Modus

Diese Demo verwendet ein **Email-Log-Panel** – es werden **keine echten E-Mails** versendet.  
Im Produktiv-Sprint kann SMTP-Integration für **+500€** hinzugebucht werden.

**Was du siehst:** Bestätigungsmail erscheint im Log.  
**Was du im echten Sprint bekommst:** Echte SMTP-Verbindung (Postmark/SendGrid).

**Persistenz:** Alle Termine werden im Browser (localStorage) gespeichert – ideal für schnelle Demos ohne Backend-Setup.

## Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- localStorage (Mock Backend)

## Schnellstart

```bash
cd frontend
npm install
npm run dev
```

Öffne http://localhost:5173 in deinem Browser.

## Projektstruktur

```
appointment-manager/
├── appointments.feature    # BDD Specification
├── frontend/
│   ├── src/
│   │   ├── App.tsx        # Main application (all-in-one)
│   │   ├── index.css      # Tailwind directives
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   └── package.json
└── README.md
```

## Entwicklung

Dieses Projekt wurde als Teil der 3-Tage MVP Sprint Demo Apps Sammlung erstellt.

**Entwicklungszeit:** ~20 Stunden  
**BDD-Szenarien:** 3 Szenarien → alle bestanden  
**Codezeilen:** ~450 (ohne Tests)

## Lizenz

MIT – Du kannst diesen Code nutzen, forken und daraus lernen.
