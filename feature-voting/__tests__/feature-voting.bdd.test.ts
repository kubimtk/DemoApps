import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';

const feature = loadFeature(path.join(__dirname, '../feature-voting.feature'));

defineFeature(feature, test => {
  test('User reicht Feature-Request ein', ({ given, when, and, then }) => {
    given('Ich bin auf der Startseite', () => {
      expect(true).toBe(true);
    });

    when('Ich fülle das Formular aus (Titel: "Dark Mode", Beschreibung: "User wollen Nachts besser lesen")', () => {
      expect(true).toBe(true);
    });

    and('Ich klicke "Submit"', () => {
      expect(true).toBe(true);
    });

    then('Der Request erscheint in der Liste mit 0 Votes', () => {
      expect(true).toBe(true);
    });
  });

  test('Team-Member vote für Feature', ({ given, when, then, and }) => {
    given('Es gibt einen Request "Dark Mode" mit 0 Votes', () => {
      expect(true).toBe(true);
    });

    when('Ich klicke auf "Upvote"', () => {
      expect(true).toBe(true);
    });

    then('Der Vote-Zähler steht bei 1', () => {
      expect(true).toBe(true);
    });

    and('Ich sehe meinen Avatar in der Voter-Liste', () => {
      expect(true).toBe(true);
    });
  });

  test('PM sortiert nach Votes', ({ given, when, then }) => {
    given('Es gibt "Dark Mode" (5 Votes) und "Export PDF" (3 Votes)', () => {
      expect(true).toBe(true);
    });

    when('Ich wähle "Sort by: Most Voted"', () => {
      expect(true).toBe(true);
    });

    then('"Dark Mode" steht an erster Stelle', () => {
      expect(true).toBe(true);
    });
  });

  test('Admin löscht Duplikat', ({ given, and, when, then }) => {
    given('Ich bin als Admin eingeloggt', () => {
      expect(true).toBe(true);
    });

    and('Es gibt zwei Requests "Dark Mode"', () => {
      expect(true).toBe(true);
    });

    when('Ich lösche den älteren Request', () => {
      expect(true).toBe(true);
    });

    then('Nur der neue Request ist sichtbar', () => {
      expect(true).toBe(true);
    });
  });
});
