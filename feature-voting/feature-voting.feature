@language:de
Feature: Feature-Voting-Tool für Product Manager

  Als Product Manager will ich Feature-Requests sammeln und priorisieren,
  damit ich datengestützte Roadmap-Entscheidungen treffe.

  Scenario: User reicht Feature-Request ein
    Given Ich bin auf der Startseite
    When Ich fülle das Formular aus (Titel: "Dark Mode", Beschreibung: "User wollen Nachts besser lesen")
    And Ich klicke "Submit"
    Then Der Request erscheint in der Liste mit 0 Votes

  Scenario: Team-Member vote für Feature
    Given Es gibt einen Request "Dark Mode" mit 0 Votes
    When Ich klicke auf "Upvote"
    Then Der Vote-Zähler steht bei 1
    And Ich sehe meinen Avatar in der Voter-Liste

  Scenario: PM sortiert nach Votes
    Given Es gibt "Dark Mode" (5 Votes) und "Export PDF" (3 Votes)
    When Ich wähle "Sort by: Most Voted"
    Then "Dark Mode" steht an erster Stelle

  Scenario: Admin löscht Duplikat
    Given Ich bin als Admin eingeloggt
    And Es gibt zwei Requests "Dark Mode"
    When Ich lösche den älteren Request
    Then Nur der neue Request ist sichtbar
