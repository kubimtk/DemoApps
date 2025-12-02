# DemoApps – Von BDD zu MVP in 72h

**Signierte BDD-Spezifikationen werden in 3 Tagen zu produktionsreifen Prototypen.**

[![BDD](https://img.shields.io/badge/Ansatz-BDD-brightgreen)](https://cucumber.io/docs/bdd/)
[![Tech Stack](https://img.shields.io/badge/Tech-React%20|%20TypeScript%20|%20Tailwind-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/Lizenz-MIT-yellow)](LICENSE)

---

## 🚀 Was ist das?

Dieses Repository demonstriert meine **3-Tage-Sprint**-Methodik:  
Du signierst eine BDD-Spezifikation → Ich liefere eine voll funktionsfähige, getestete Anwendung in 72 Stunden.

**Grundprinzipien:**
- ✅ Kein Scope Creep nach Tag 1
- ✅ Alle BDD-Szenarien müssen bestehen
- ✅ Echte Funktionalität, keine Tricks
- ✅ Produktionsreifer Code in deinem Besitz
- ✅ Moderner Tech Stack (React, TypeScript, Tailwind)

---

## 📱 Die 3 Demo-Anwendungen

### 1. Appointment Manager (Auto-Email-Benachrichtigungen)

**Status:** ✅ Fertig | [Live Demo](https://appointment-manager-zeta.vercel.app) | [Loom](https://www.loom.com/share/cb02808e47fc4c3fadb363d064ea7f1f) | [GitHub](./appointment-manager/)

**Business Value:** Automatisiere Terminverwaltung mit sofortigen E-Mail-Benachrichtigungen für Buchungen, Verschiebungen und Stornierungen.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, localStorage (Mock Backend)

**BDD Specs (appointments.feature):**
```gherkin
Feature: Termin-Management mit Auto-Email

  Scenario: Termin erstellen und Bestätigungsmail senden
    Given ich bin auf der Seite "/appointments"
    When ich einen Termin am "2025-11-20" um "14:00" eintrage
    And die E-Mail "kunde@beispiel.de" eingebe
    And ich speichere
    Then wird eine Bestätigungsmail an "kunde@beispiel.de" gesendet
    And ich sehe den Termin in der Liste

  Scenario: Termin verschieben und Update-Mail senden
    Given ein Termin am "2025-11-20" existiert
    When ich den Termin auf "2025-11-21" verschiebe
    Then wird eine Update-Mail an den Kunden gesendet

  Scenario: Termin stornieren und Stornomail senden
    Given ein Termin am "2025-11-21" existiert
    When ich den Termin storniere
    Then wird eine Stornomail an den Kunden gesendet
    And der Termin ist nicht mehr in der Liste
```

**Hauptfunktionen:**
- ✅ Dark-Mode responsive UI
- ✅ Email-Log-Panel mit Zeitstempeln
- ✅ Such-/Filterfunktion
- ✅ JSON-Export
- ✅ Toast-Benachrichtigungen & Loading-States
- ✅ localStorage-Persistenz

**Entwicklungsmetriken:**
- 3 BDD-Szenarien → alle bestanden
- ~500 Zeilen Code
- Entwicklungszeit: ~20 Stunden

---

### 2. Inventory Tracker (Barcode-Scanning)

**Status:** ✅ Fertig | [Live Demo](https://inventory-eight-ruby.vercel.app) | [Loom](https://www.loom.com/share/abd30dc17b8741beade3f5c6cec91f43) | [GitHub](https://github.com/kubimtk/DemoApps/tree/main/inventory)

**Business Value:** Digitalisiere die Lagerverwaltung für kleine Unternehmen mit Barcode-Scanning und Echtzeit-Bestandsaktualisierungen.

**Tech Stack:** React, TypeScript, Quagga2 (Barcode), SQLite/PostgreSQL

**BDD Specs (inventory.feature):**
```gherkin
Feature: Inventory Management

  Scenario: Scan new product
    Given I have a blank inventory
    When I scan barcode "1234567890123"
    Then the product should be added with quantity 1
    And the stock count should increase by 1

  Scenario: Update existing product quantity
    Given product "1234567890123" exists with quantity 5
    When I scan barcode "1234567890123"
    Then the quantity should be 6
    And I should see "Stock updated: 6" notification

  Scenario: Low stock alert
    Given product "9876543210987" has quantity 2
    And the low-stock threshold is 3
    When I view the dashboard
    Then I should see a red alert for "9876543210987"
```

---

### 3. Internes FAQ-Tool (Suche + Admin-Panel)

**Status:** ✅ Fertig | [Live Demo](https://faq-tool.vercel.app) | [Loom](https://www.loom.com/share/6f40db2d35c849f6ab2925cccf587a9d) | [GitHub](https://github.com/kubimtk/DemoApps/tree/main/faq-tool)

**Business Value:** Ermögliche Mitarbeitern, Antworten sofort zu finden – mit einer durchsuchbaren Wissensdatenbank und einfacher Admin-Verwaltung.

**Tech Stack:** React, TypeScript, Fuse.js (Fuzzy Search), Node.js + Express

**BDD Specs (faq-tool.feature):**
```gherkin
Feature: FAQ Management

  Scenario: Search for FAQ
    Given I am on the FAQ page
    When I search for "password reset"
    Then I should see matching FAQ entries
    And results should be ranked by relevance

  Scenario: Admin adds new FAQ
    Given I am logged in as admin
    When I add a new FAQ with title "How to reset password"
    And I add answer "Go to Settings > Security > Reset Password"
    Then the FAQ should appear in search results
    And other users should see it immediately

  Scenario: User votes FAQ helpful
    Given I am viewing FAQ "How to reset password"
    When I click "Helpful"
    Then the helpfulness score should increase
    And the FAQ should rank higher in results
```

---

## ⚙️ Der 3-Tage-Sprint-Prozess

**Tag 0:** BDD-Spec Review & Signierung  
**Tag 1-3:** Entwicklung mit KI + Safety Layer  
**Tag 3:** Lieferung + Übergabe + Volle Code-Rechte

**Preise:**
- 3-Tage MVP Sprint: **5.000€** (72h, volle Rechte)
- Follow-up Sprints: **1.500€/Tag** (Backend-Integration, Auth, Echte APIs, etc.)

---

## 🛠️ Schnellstart

Jede Demo-App hat ihre eigene README mit detaillierten Anweisungen:

```bash
# Appointment Manager
cd appointment-manager/frontend
npm install
npm run dev
```

Öffne http://localhost:5173 in deinem Browser.

---

## 📞 Kontakt

Interesse an deinem eigenen 3-Tage MVP Sprint?

**E-Mail:** [deine-email@beispiel.de]  
**LinkedIn:** [Dein LinkedIn-Profil]  
**Portfolio:** [Deine Website]

---

## 📄 Lizenz

MIT – Du kannst diesen Code nutzen, forken und daraus lernen.  
**Für kommerzielle Projekte: Vollständige Rechteübertragung nach Zahlung inklusive.**

---

## 🎯 Warum dieser Ansatz funktioniert

**Problem:** Product Manager verschwenden 4-6 Wochen mit MVP-Briefings, die in endlosen Revisionen versinken.

**Lösung:** Signiere eine BDD-Spec → Erhalte einen funktionierenden Prototyp in exakt 72 Stunden.

**Wie?** Cursor AI + Claude 3.5 Sonnet + 40 Jahre Erfahrung als Safety Layer.

**Ergebnis:** Null Scope-Diskussionen, alle Tests grün, Code gehört vollständig dir.
