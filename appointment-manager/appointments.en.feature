@language:en
Feature: Appointment Management with Auto-Email

  Scenario: Create appointment and send confirmation email
    Given I am on the page "/appointments"
    When I enter an appointment on "2025-11-20" at "14:00"
    And I enter the email "customer@example.com"
    And I save
    Then a confirmation email is sent to "customer@example.com"
    And I see the appointment in the list

  Scenario: Move appointment and send update email
    Given an appointment exists on "2025-11-20"
    When I move the appointment to "2025-11-21"
    Then an update email is sent to the customer

  Scenario: Cancel appointment and send cancellation email
    Given an appointment exists on "2025-11-21"
    When I cancel the appointment
    Then a cancellation email is sent to the customer
    And the appointment is no longer in the list
