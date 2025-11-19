# Appointment Manager

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
https://appointment-manager-[your-id].vercel.app

## BDD Specification
[appointments.feature](./appointments.feature)

## Tech Stack
- React 18
- TypeScript
- Vite
- Tailwind CSS
- localStorage (Mock Backend)

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

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

## Development

This project was built as part of the 3-Day MVP Sprint Demo Apps collection.

**Development Time:** ~20 hours  
**BDD Scenarios:** 3 scenarios → all passing  
**Lines of Code:** ~450 (without tests)

## License

MIT – you can use, fork, and learn from this code.
