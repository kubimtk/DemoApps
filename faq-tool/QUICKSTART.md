# Quick Start Guide - FAQ-Tool

## 🚀 In 3 Schritten starten

### 1. Installation

```bash
npm install
```

### 2. Starten

```bash
npm start
```

### 3. Öffnen

Browser öffnen: `http://localhost:3000`

---

## ✅ Sofort loslegen

### Als Admin einloggen

1. Klicke auf "Als Admin einloggen" Button
2. Du kannst jetzt FAQs erstellen, bearbeiten und löschen

### Erste FAQ erstellen

1. Nach dem Admin-Login siehst du "Admin Dashboard" Button
2. Klicke darauf
3. Klicke "+ Neue FAQ erstellen"
4. Fülle das Formular aus:
   - **Titel:** z.B. "Versandkosten"
   - **Kategorie:** z.B. "Logistik"
   - **Inhalt:** z.B. "Ab 50€ versandkostenfrei"
   - **Tags:** z.B. "Versand, Kosten, Lieferung"
5. Klicke "Speichern"

### Als User FAQs nutzen

1. Zurück zur Hauptseite (klicke auf "← Zurück zur Hauptseite")
2. **Suchen:** Gib ein Stichwort in die Suchleiste ein
3. **Filtern:** Wähle eine Kategorie aus dem Dropdown
4. **FAQ öffnen:** Klicke auf einen FAQ-Titel
5. **Als hilfreich markieren:** Klicke "Hilfreich? 👍"

### CSV Export

1. Als Admin einloggen
2. Gehe zum Admin Dashboard
3. Klicke "CSV Export"
4. CSV-Datei wird heruntergeladen

---

## 🧪 Tests ausführen

```bash
npm test
```

**Ergebnis:**
- ✅ 46 Tests bestehen
- ✅ 83.8% Code Coverage
- ✅ Alle BDD-Szenarien erfüllt

---

## 📱 Mobile testen

Öffne Developer Tools (F12) → Device Mode → iPhone SE (375px)

Die FAQ-Accordion-Ansicht passt sich automatisch an!

---

## 🎯 Alle Features testen

### Admin Features

- ✅ FAQ erstellen
- ✅ FAQ bearbeiten (Klicke "✏️ Bearbeiten" in Admin-Tabelle)
- ✅ FAQ löschen (Klicke "🗑 Löschen")
- ✅ CSV Export

### User Features

- ✅ Suche nach Stichwort
- ✅ Filter nach Kategorie
- ✅ Suche in Tags
- ✅ FAQ als hilfreich markieren
- ✅ Beliebte FAQs sehen (sortiert nach Punkten)
- ✅ Mobile Accordion-View

---

## 🔧 Entwicklungsmodus

```bash
npm run dev
```

Mit **nodemon** - automatischer Neustart bei Änderungen

---

## 📊 Test Coverage anzeigen

Nach `npm test` öffne:

```
coverage/lcov-report/index.html
```

im Browser für detaillierten Coverage-Report.

---

## 🐛 Troubleshooting

### Port bereits belegt?

Ändere in `src/app.js` (letzte Zeile):

```javascript
startServer(3001); // oder einen anderen Port
```

### Datenbank zurücksetzen?

Lösche einfach:

```bash
rm faq-tool.db
```

Beim nächsten Start wird die DB neu erstellt.

---

## 📝 Beispiel-Daten

Hier sind Beispiel-FAQs zum Testen:

**FAQ 1:**
- Titel: "Versandkosten"
- Kategorie: "Logistik"
- Inhalt: "Ab 50€ Bestellwert versandkostenfrei. Darunter 4,99€."
- Tags: "Versand, Kosten, Lieferung"

**FAQ 2:**
- Titel: "Rückgaberecht"
- Kategorie: "Service"
- Inhalt: "30 Tage Rückgaberecht ab Erhalt der Ware."
- Tags: "Rückgabe, Rücksendung"

**FAQ 3:**
- Titel: "Zahlungsmethoden"
- Kategorie: "Rechnung"
- Inhalt: "Wir akzeptieren PayPal, Kreditkarte und Vorkasse."
- Tags: "Zahlung, PayPal"

---

## ✨ Das war's!

Du hast jetzt ein voll funktionsfähiges FAQ-Tool mit:
- Admin-Bereich
- Suche & Filter
- Mobile-Ansicht
- CSV-Export
- 83.8% Test Coverage

Viel Spaß! 🎉

