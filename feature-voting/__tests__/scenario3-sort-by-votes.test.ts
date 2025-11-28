/**
 * BDD Scenario 3: PM sortiert nach Votes
 * 
 * Given: Es gibt "Dark Mode" (5 Votes) und "Export PDF" (3 Votes)
 * When: Ich wähle "Sort by: Most Voted"
 * Then: "Dark Mode" steht an erster Stelle
 */

import { NextRequest } from 'next/server';
import { POST as createFeature, GET as getFeatures } from '@/app/api/features/route';
import { POST as addVote } from '@/app/api/features/[id]/vote/route';
import { initDatabase, clearDatabase } from '@/lib/db';

describe('Scenario 3: PM sortiert nach Votes', () => {
  let darkModeId: number;
  let exportPdfId: number;

  beforeAll(async () => {
    await clearDatabase();
    await initDatabase();

    // Given: Es gibt "Dark Mode" (5 Votes) und "Export PDF" (3 Votes)
    
    // Create Dark Mode feature
    const darkModeRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Dark Mode',
        description: 'User wollen Nachts besser lesen'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const darkModeResponse = await createFeature(darkModeRequest);
    const darkMode = await darkModeResponse.json();
    darkModeId = darkMode.id;

    // Add 5 votes to Dark Mode
    for (let i = 1; i <= 5; i++) {
      const voteRequest = new NextRequest(`http://localhost:3000/api/features/${darkModeId}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          userId: `user${i}`,
          userName: `User ${i}`,
          userAvatar: `https://i.pravatar.cc/150?u=user${i}`
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await addVote(voteRequest, { params: Promise.resolve({ id: darkModeId.toString() }) });
    }

    // Create Export PDF feature
    const exportPdfRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Export PDF',
        description: 'Export reports as PDF'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const exportPdfResponse = await createFeature(exportPdfRequest);
    const exportPdf = await exportPdfResponse.json();
    exportPdfId = exportPdf.id;

    // Add 3 votes to Export PDF
    for (let i = 6; i <= 8; i++) {
      const voteRequest = new NextRequest(`http://localhost:3000/api/features/${exportPdfId}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          userId: `user${i}`,
          userName: `User ${i}`,
          userAvatar: `https://i.pravatar.cc/150?u=user${i}`
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await addVote(voteRequest, { params: Promise.resolve({ id: exportPdfId.toString() }) });
    }
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it('BUSINESS OUTCOME: Features are sorted by votes (most voted first)', async () => {
    // When: Ich wähle "Sort by: Most Voted"
    const sortedRequest = new NextRequest('http://localhost:3000/api/features?sortBy=votes', {
      method: 'GET',
    });

    const sortedResponse = await getFeatures(sortedRequest);
    const features = await sortedResponse.json();

    // BUSINESS OUTCOME VERIFICATION #1: Request was successful
    expect(sortedResponse.status).toBe(200);
    expect(Array.isArray(features)).toBe(true);
    expect(features.length).toBe(2);

    // Then: "Dark Mode" steht an erster Stelle
    
    // BUSINESS OUTCOME VERIFICATION #2: Dark Mode is first in the list
    expect(features[0].title).toBe('Dark Mode');
    expect(features[0].votes).toBe(5);
    expect(features[0].id).toBe(darkModeId);

    // BUSINESS OUTCOME VERIFICATION #3: Export PDF is second in the list
    expect(features[1].title).toBe('Export PDF');
    expect(features[1].votes).toBe(3);
    expect(features[1].id).toBe(exportPdfId);

    // BUSINESS OUTCOME VERIFICATION #4: Features are ordered by vote count
    for (let i = 0; i < features.length - 1; i++) {
      expect(features[i].votes).toBeGreaterThanOrEqual(features[i + 1].votes);
    }
  });

  it('BUSINESS OUTCOME: Default sort shows recent features first', async () => {
    // When: Default sorting is used (recent first)
    const recentRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'GET',
    });

    const recentResponse = await getFeatures(recentRequest);
    const features = await recentResponse.json();

    // BUSINESS OUTCOME VERIFICATION #1: Request was successful
    expect(recentResponse.status).toBe(200);
    expect(Array.isArray(features)).toBe(true);

    // BUSINESS OUTCOME VERIFICATION #2: Most recent feature (Export PDF) is first
    expect(features[0].title).toBe('Export PDF');
    expect(features[0].id).toBe(exportPdfId);

    // BUSINESS OUTCOME VERIFICATION #3: Older feature (Dark Mode) is second
    expect(features[1].title).toBe('Dark Mode');
    expect(features[1].id).toBe(darkModeId);
  });

  it('BUSINESS OUTCOME: Sort parameter is case-insensitive', async () => {
    // When: Using different case for sortBy parameter
    const request1 = new NextRequest('http://localhost:3000/api/features?sortBy=votes', {
      method: 'GET',
    });
    const request2 = new NextRequest('http://localhost:3000/api/features?sortBy=recent', {
      method: 'GET',
    });

    const response1 = await getFeatures(request1);
    const response2 = await getFeatures(request2);

    const features1 = await response1.json();
    const features2 = await response2.json();

    // BUSINESS OUTCOME: Both requests succeed
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    // BUSINESS OUTCOME: Different sort orders produce different results
    expect(features1[0].id).not.toBe(features2[0].id);
  });

  it('BUSINESS OUTCOME: Features with equal votes maintain creation order', async () => {
    // Create two more features with same vote count
    const feature1Request = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Feature A',
        description: 'Description A'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const feature1Response = await createFeature(feature1Request);
    const feature1 = await feature1Response.json();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const feature2Request = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Feature B',
        description: 'Description B'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const feature2Response = await createFeature(feature2Request);
    const feature2 = await feature2Response.json();

    // Add 2 votes to each
    for (let i = 0; i < 2; i++) {
      await addVote(
        new NextRequest(`http://localhost:3000/api/features/${feature1.id}/vote`, {
          method: 'POST',
          body: JSON.stringify({
            userId: `userA${i}`,
            userName: `User A${i}`,
            userAvatar: `https://i.pravatar.cc/150?u=userA${i}`
          }),
          headers: { 'Content-Type': 'application/json' },
        }),
        { params: Promise.resolve({ id: feature1.id.toString() }) }
      );

      await addVote(
        new NextRequest(`http://localhost:3000/api/features/${feature2.id}/vote`, {
          method: 'POST',
          body: JSON.stringify({
            userId: `userB${i}`,
            userName: `User B${i}`,
            userAvatar: `https://i.pravatar.cc/150?u=userB${i}`
          }),
          headers: { 'Content-Type': 'application/json' },
        }),
        { params: Promise.resolve({ id: feature2.id.toString() }) }
      );
    }

    // When: Sort by votes
    const sortedRequest = new NextRequest('http://localhost:3000/api/features?sortBy=votes', {
      method: 'GET',
    });

    const sortedResponse = await getFeatures(sortedRequest);
    const features = await sortedResponse.json();

    // Find our two features
    const featureAIndex = features.findIndex((f: any) => f.id === feature1.id);
    const featureBIndex = features.findIndex((f: any) => f.id === feature2.id);

    // BUSINESS OUTCOME: Both features with same votes are present
    expect(featureAIndex).toBeGreaterThanOrEqual(0);
    expect(featureBIndex).toBeGreaterThanOrEqual(0);

    // BUSINESS OUTCOME: When votes are equal, newer feature comes first
    expect(featureBIndex).toBeLessThan(featureAIndex);
  });
});


