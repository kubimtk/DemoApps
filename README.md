# DemoApps – BDD to MVP in 72h

**Transforming signed BDD specifications into production-ready prototypes in 3 days.**

[![BDD](https://img.shields.io/badge/Approach-BDD-brightgreen)](https://cucumber.io/docs/bdd/)
[![Tech Stack](https://img.shields.io/badge/Tech-React%20|%20TypeScript%20|%20Tailwind-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🚀 What is This?

This repository demonstrates my **3-Day Sprint** methodology:  
You sign a BDD specification → I deliver a fully functional, tested application in 72 hours.

**Core Principles:**
- ✅ No scope creep after Day 1
- ✅ All BDD scenarios must pass
- ✅ Real functionality, no smoke & mirrors
- ✅ Production-ready code ownership
- ✅ Modern tech stack (React, TypeScript, Tailwind)

---

## 📱 The 3 Demo Applications

### 1. Appointment Manager (Auto-Email Notifications)

**Status:** ✅ Complete | [Live Demo](https://appointment-manager-zeta.vercel.app) | [GitHub](./appointment-manager/)

**Business Value:** Automate appointment management with instant email notifications for bookings, rescheduling, and cancellations.

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

**Key Features:**
- ✅ Dark-mode responsive UI
- ✅ Email-Log-Panel with timestamps
- ✅ Search/Filter functionality
- ✅ JSON Export
- ✅ Toast notifications & loading states
- ✅ localStorage persistence

**Development Metrics:**
- 3 BDD scenarios → all passing
- ~500 lines of code
- Development time: ~20 hours

---

### 2. Inventory Tracker (Barcode Scanning)

**Status:** ✅ Complete | [Live Demo](https://inventory-eight-ruby.vercel.app) | [GitHub](https://github.com/kubimtk/DemoApps/tree/main/inventory)

**Business Value:** Digitize inventory management for small businesses with barcode scanning and real-time stock updates.

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

### 3. Internal FAQ Tool (Search + Admin Panel)

**Status:** 🚧 In Planning | Live Demo: - | GitHub: -

**Business Value:** Empower employees to find answers instantly with a searchable knowledge base and easy admin management.

**Tech Stack (Planned):** React, TypeScript, Fuse.js (Fuzzy Search), Node.js + Express

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

## ⚙️ The 3-Day Sprint Process

**Day 0:** BDD Spec Review & Sign-off  
**Day 1-3:** Development with AI + Safety Layer  
**Day 3:** Delivery + Handover + Full Code Rights

**Pricing:**
- 3-Day MVP Sprint: **5,000€** (72h, full rights)
- Follow-up Sprints: **1,500€/day** (Backend integration, Auth, Real APIs, etc.)

---

## 🛠️ Quick Start

Each demo app has its own README with detailed instructions:

```bash
# Appointment Manager
cd appointment-manager/frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

---

## 📞 Contact

Interested in your own 3-Day MVP Sprint?

**Email:** [your-email@example.com]  
**LinkedIn:** [Your LinkedIn Profile]  
**Portfolio:** [Your Website]

---

## 📄 License

MIT – you can use, fork, and learn from this code.  
**For commercial projects, full rights transfer included after payment.**

---

## 🎯 Why This Approach Works

**Problem:** Product managers waste 4-6 weeks on MVP briefings that drown in endless revisions.

**Solution:** Sign a BDD spec → Get a working prototype in exactly 72 hours.

**How?** Cursor AI + Claude 3.5 Sonnet + 40 years of experience as a safety layer.

**Result:** Zero scope discussions, all tests green, code belongs to you completely.
