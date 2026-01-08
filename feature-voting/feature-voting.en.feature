@language:en
Feature: Feature Voting Tool for Product Managers

  As a Product Manager I want to collect and prioritize feature requests,
  so that I can make data-driven roadmap decisions.

  Scenario: User submits feature request
    Given I am on the homepage
    When I fill out the form (Title: "Dark Mode", Description: "Users want to read better at night")
    And I click "Submit"
    Then The request appears in the list with 0 votes

  Scenario: Team member votes for feature
    Given There is a request "Dark Mode" with 0 votes
    When I click on "Upvote"
    Then The vote counter shows 1
    And I see my avatar in the voter list

  Scenario: PM sorts by votes
    Given There is "Dark Mode" (5 votes) and "Export PDF" (3 votes)
    When I select "Sort by: Most Voted"
    Then "Dark Mode" is in first place

  Scenario: Admin deletes duplicate
    Given I am logged in as admin
    And There are two requests "Dark Mode"
    When I delete the older request
    Then Only the new request is visible
