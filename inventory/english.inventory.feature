@language:en
Feature: Manage Inventory via Barcode

  Scenario: Scan barcode and increase stock
    Given a product with barcode "12345" and name "Screws M3"
    And current stock is 10
    When I scan barcode "12345"
    And add quantity 5
    Then stock is 15
    And last change is today

  Scenario: Scan barcode and decrease stock
    Given a product with barcode "12345" and name "Screws M3"
    And current stock is 10
    When I scan barcode "12345"
    And remove quantity 3
    Then stock is 7
    And consumption is logged

  Scenario: Create new product
    Given no product with barcode "99999" exists
    When I create a new product
      | Barcode   | 99999          |
      | Name      | Nuts M5        |
      | Warehouse | Workshop       |
    Then product is saved
    And stock is 0

  Scenario: Display inventory
    Given 3 products in the database
    When I open the overview
    Then I see all products with barcode, name, stock
    And I can filter by warehouse

  Scenario: Low stock warning
    Given product "Screws" has minimum stock 20
    And current stock is 15
    When I open the overview
    Then product is marked red
    And I see warning "Minimum stock not met"

