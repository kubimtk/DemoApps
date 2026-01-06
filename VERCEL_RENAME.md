# Projekt umbenennen zu `demoapps-kubimtk`

## Option 1: Vercel Dashboard (schnellste Methode)

1. **Öffne:** https://vercel.com/wolfgang-kubisiaks-projects/demo-apps/settings
2. **Navigiere zu:** Settings → General → Project Name
3. **Ändere:** `demo-apps` → `demoapps-kubimtk`
4. **Speichern**

Die URL wird dann automatisch zu: `https://demoapps-kubimtk.vercel.app`

---

## Option 2: Über CLI (alternative Methode)

```bash
# Vercel CLI unterstützt Rename nicht direkt
# Aber wir können das Projekt neu erstellen:

cd /Users/kubi/Cursorfiles/DemoApps

# Altes Projekt löschen (optional)
vercel remove demo-apps --yes

# Neues Projekt mit gewünschtem Namen erstellen
vercel --prod --name demoapps-kubimtk
```

---

## ✅ Nach dem Umbenennen

Die App ist dann unter folgenden URLs erreichbar:

- **Landing Page:** `https://demoapps-kubimtk.vercel.app/`
- **Inventory:** `https://demoapps-kubimtk.vercel.app/inventory`
- **FAQ Tool:** `https://demoapps-kubimtk.vercel.app/faq-tool`
- **Appointment Manager:** `https://demoapps-kubimtk.vercel.app/appointment-manager`
- **Feature Voting:** `https://demoapps-kubimtk.vercel.app/feature-voting`

