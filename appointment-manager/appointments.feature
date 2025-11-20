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
