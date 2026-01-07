@language:de
Feature: Lagerbestand verwalten via Barcode

  Scenario: Barcode scannen und Bestand erhöhen
    Given ein Produkt mit Barcode "12345" und Name "Schrauben M3"
    And aktueller Lagerbestand ist 10
    When ich Barcode "12345" scannen
    And Menge 5 hinzufügen
    Then Lagerbestand ist 15
    And letzte Änderung ist heute

  Scenario: Barcode scannen und Bestand verringern
    Given ein Produkt mit Barcode "12345" und Name "Schrauben M3"
    And aktueller Lagerbestand ist 10
    When ich Barcode "12345" scannen
    And Menge 3 entnehmen
    Then Lagerbestand ist 7
    And Verbrauch wird protokolliert

  Scenario: Neues Produkt anlegen
    Given kein Produkt mit Barcode "99999" existiert
    When ich ein neues Produkt anlege
      | Barcode | 99999          |
      | Name    | Muttern M5     |
      | Lager   | Werkstatt      |
    Then Produkt ist gespeichert
    And Lagerbestand ist 0

  Scenario: Lagerbestand anzeigen
    Given 3 Produkte in der Datenbank
    When ich die Übersicht aufrufe
    Then ich sehe alle Produkte mit Barcode, Name, Bestand
    And ich kann nach Lager filtern

  Scenario: Niedrig-Bestand Warnung
    Given Produkt "Schrauben" hat Mindestbestand 20
    And aktueller Bestand ist 15
    When ich die Übersicht öffne
    Then Produkt ist rot markiert
    And ich sehe Warnung "Mindestbestand unterschritten"