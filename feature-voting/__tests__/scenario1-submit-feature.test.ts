/**
 * BDD Scenario 1: User reicht Feature-Request ein
 * 
 * Given: Ich bin auf der Startseite
 * When: Ich fülle das Formular aus (Titel: "Dark Mode", Beschreibung: "User wollen Nachts besser lesen")
 * And: Ich klicke "Submit"
 * Then: Der Request erscheint in der Liste mit 0 Votes
 */

import { createServer } from 'http';
import { NextRequest } from 'next/server';
import { POST as createFeature, GET as getFeatures } from '@/app/api/features/route';
import { initDatabase, clearDatabase } from '@/lib/db';

describe('Scenario 1: User reicht Feature-Request ein', () => {
  beforeAll(async () => {
    await clearDatabase();
    await initDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it('BUSINESS OUTCOME: Feature request appears in list with 0 votes after submission', async () => {
    // Given: Ich bin auf der Startseite (setup complete)
    
    // When: Ich fülle das Formular aus
    const featureData = {
      title: 'Dark Mode',
      description: 'User wollen Nachts besser lesen'
    };

    // And: Ich klicke "Submit"
    const createRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify(featureData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const createResponse = await createFeature(createRequest);
    const createdFeature = await createResponse.json();

    // Then: Der Request erscheint in der Liste mit 0 Votes
    
    // BUSINESS OUTCOME VERIFICATION #1: Feature was created successfully
    expect(createResponse.status).toBe(201);
    expect(createdFeature).toHaveProperty('id');
    expect(createdFeature.title).toBe('Dark Mode');
    expect(createdFeature.description).toBe('User wollen Nachts besser lesen');
    
    // BUSINESS OUTCOME VERIFICATION #2: Feature has 0 votes initially
    expect(createdFeature.votes).toBe(0);

    // BUSINESS OUTCOME VERIFICATION #3: Feature appears in the list
    const listRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'GET',
    });

    const listResponse = await getFeatures(listRequest);
    const features = await listResponse.json();

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(features)).toBe(true);
    
    // BUSINESS OUTCOME VERIFICATION #4: The submitted feature is in the list
    const submittedFeature = features.find((f: any) => f.id === createdFeature.id);
    expect(submittedFeature).toBeDefined();
    expect(submittedFeature.title).toBe('Dark Mode');
    expect(submittedFeature.description).toBe('User wollen Nachts besser lesen');
    expect(submittedFeature.votes).toBe(0);

    // BUSINESS OUTCOME VERIFICATION #5: Feature is not deleted
    expect(submittedFeature.is_deleted).toBe(false);
  });

  it('EDGE CASE: Cannot submit feature without title', async () => {
    const invalidData = {
      description: 'No title provided'
    };

    const request = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await createFeature(request);
    const result = await response.json();

    // BUSINESS OUTCOME: Invalid requests are rejected
    expect(response.status).toBe(400);
    expect(result.error).toContain('required');
  });

  it('EDGE CASE: Cannot submit feature without description', async () => {
    const invalidData = {
      title: 'No Description'
    };

    const request = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await createFeature(request);
    const result = await response.json();

    // BUSINESS OUTCOME: Invalid requests are rejected
    expect(response.status).toBe(400);
    expect(result.error).toContain('required');
  });
});



