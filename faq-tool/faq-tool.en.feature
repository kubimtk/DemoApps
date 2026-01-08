@language:en
Feature: FAQ-Tool

  Scenario: Admin creates FAQ
    Given I am logged in as admin
    When I create a FAQ with title "Versandkosten", category "Logistik", content "Ab 50€ gratis"
    Then I see "FAQ erfolgreich erstellt"
    And the FAQ is visible in the database

  Scenario: User searches by keyword
    Given there is a FAQ "Versandkosten" in category "Logistik"
    When I search for "Versand" as user
    Then I see the FAQ "Versandkosten" in results

  Scenario: User filters by category
    Given there are 5 FAQs in category "Logistik" and 3 in "Rechnung"
    When I filter by category "Logistik" as user
    Then I see exactly 5 FAQs
