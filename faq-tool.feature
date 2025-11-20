Feature: FAQ-Tool

  Als Website-Admin
  will ich FAQs verwalten
  damit User schnell Antworten finden

  Szenario: Admin erstellt FAQ
    Given ich bin als Admin eingeloggt
    When ich eine FAQ mit Titel "Versandkosten", Kategorie "Logistik", Inhalt "Ab 50€ gratis" anlege
    Then sehe ich "FAQ erfolgreich erstellt"
    And die FAQ ist in der Datenbank sichtbar

  Szenario: User sucht nach Stichwort
    Given es gibt eine FAQ "Versandkosten" in Kategorie "Logistik"
    When ich als User nach "Versand" suche
    Then sehe ich die FAQ "Versandkosten" in den Ergebnissen

  Szenario: User filtert nach Kategorie
    Given es gibt 5 FAQs in Kategorie "Logistik" und 3 in "Rechnung"
    When ich als User Kategorie "Logistik" filter
    Then sehe ich genau 5 FAQs

  Szenario: Admin editiert FAQ
    Given es gibt eine FAQ "Versandkosten" mit Inhalt "Ab 100€"
    When ich als Admin den Inhalt zu "Ab 50€ gratis" ändere
    Then sehe ich "FAQ aktualisiert"
    And User sehen den neuen Inhalt sofort

  Szenario: Admin löscht FAQ
    Given es gibt eine FAQ "Versandkosten"
    When ich als Admin die FAQ lösche
    Then sehe ich "FAQ gelöscht"
    And User finden die FAQ nicht mehr

  Szenario: User markiert FAQ als hilfreich
    Given es gibt eine FAQ "Versandkosten" mit Hilfreich-Punkten 0
    When ich als User "Hilfreich?" klicke
    Then steht "1 Kunde fand diese FAQ hilfreich"

  Szenario: User sieht beliebte FAQs
    Given die FAQ "Rückgabe" hat 10 Hilfreich-Punkte, "Versand" hat 5
    When ich als User die FAQ-Seite öffne
    Then sehe ich "Rückgabe" vor "Versand" in "Beliebte FAQs"

  Szenario: FAQ-Tags in Suche
    Given eine FAQ hat Tags "Paket, Lieferung"
    When ich als User nach "Paket" suche
    Then findet die Suche die FAQ

  Szenario: Admin exportiert CSV
    Given es gibt 3 FAQs
    When ich als Admin auf "CSV Export" klicke
    Then lade ich eine Datei mit 3 FAQs herunter

  Szenario: Mobile Accordion
    Given ich bin auf einem 375px Screen
    When ich die FAQ-Seite öffne
    Then sehe ich FAQ-Titel als klickbare Accordion-Elemente
