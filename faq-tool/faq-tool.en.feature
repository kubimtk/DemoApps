@language:en
Feature: FAQ Tool

  As a website admin
  I want to manage FAQs
  so that users can quickly find answers

  Scenario: Admin creates FAQ
    Given I am logged in as admin
    When I create a FAQ with title "Shipping Costs", category "Logistics", content "Free from 50€"
    Then I see "FAQ successfully created"
    And the FAQ is visible in the database

  Scenario: User searches by keyword
    Given there is a FAQ "Shipping Costs" in category "Logistics"
    When I search for "Shipping" as user
    Then I see the FAQ "Shipping Costs" in results

  Scenario: User filters by category
    Given there are 5 FAQs in category "Logistics" and 3 in "Billing"
    When I filter by category "Logistics" as user
    Then I see exactly 5 FAQs

  Scenario: Admin edits FAQ
    Given there is a FAQ "Shipping Costs" with content "From 100€"
    When I change the content to "Free from 50€" as admin
    Then I see "FAQ updated"
    And users see the new content immediately

  Scenario: Admin deletes FAQ
    Given there is a FAQ "Shipping Costs"
    When I delete the FAQ as admin
    Then I see "FAQ deleted"
    And users can no longer find the FAQ

  Scenario: User marks FAQ as helpful
    Given there is a FAQ "Shipping Costs" with 0 helpful points
    When I click "Helpful?" as user
    Then it says "1 customer found this FAQ helpful"

  Scenario: User sees popular FAQs
    Given the FAQ "Returns" has 10 helpful points, "Shipping" has 5
    When I open the FAQ page as user
    Then I see "Returns" before "Shipping" in "Popular FAQs"

  Scenario: FAQ tags in search
    Given a FAQ has tags "Package, Delivery"
    When I search for "Package" as user
    Then the search finds the FAQ

  Scenario: Admin exports CSV
    Given there are 3 FAQs
    When I click "CSV Export" as admin
    Then I download a file with 3 FAQs

  Scenario: Mobile accordion
    Given I am on a 375px screen
    When I open the FAQ page
    Then I see FAQ titles as clickable accordion elements
