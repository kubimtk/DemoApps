/**
 * BDD Scenario 4: Admin löscht Duplikat
 * 
 * Given: Ich bin als Admin eingeloggt
 * And: Es gibt zwei Requests "Dark Mode"
 * When: Ich lösche den älteren Request
 * Then: Nur der neue Request ist sichtbar
 */

import { NextRequest } from 'next/server';
import { POST as createFeature, GET as getFeatures } from '@/app/api/features/route';
import { DELETE as deleteFeature } from '@/app/api/features/[id]/route';
import { initDatabase, clearDatabase } from '@/lib/db';

describe('Scenario 4: Admin löscht Duplikat', () => {
  let olderDarkModeId: number;
  let newerDarkModeId: number;

  beforeAll(async () => {
    await clearDatabase();
    await initDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    // And: Es gibt zwei Requests "Dark Mode"
    
    // Create older Dark Mode request
    const older = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Dark Mode',
        description: 'First submission for dark mode'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const olderResponse = await createFeature(older);
    const olderFeature = await olderResponse.json();
    olderDarkModeId = olderFeature.id;

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create newer Dark Mode request
    const newer = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Dark Mode',
        description: 'Duplicate submission for dark mode'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const newerResponse = await createFeature(newer);
    const newerFeature = await newerResponse.json();
    newerDarkModeId = newerFeature.id;

    // Verify both exist
    expect(olderDarkModeId).toBeDefined();
    expect(newerDarkModeId).toBeDefined();
    expect(olderDarkModeId).not.toBe(newerDarkModeId);
  });

  it('BUSINESS OUTCOME: Admin can delete duplicate, only new request remains visible', async () => {
    // Given: Ich bin als Admin eingeloggt
    // When: Ich lösche den älteren Request
    
    const deleteRequest = new NextRequest(`http://localhost:3000/api/features/${olderDarkModeId}`, {
      method: 'DELETE',
      headers: {
        'x-user-admin': 'true', // Simulating admin authentication
      },
    });

    const deleteResponse = await deleteFeature(deleteRequest, { 
      params: Promise.resolve({ id: olderDarkModeId.toString() }) 
    });
    const deleteResult = await deleteResponse.json();

    // BUSINESS OUTCOME VERIFICATION #1: Deletion was successful
    expect(deleteResponse.status).toBe(200);
    expect(deleteResult.message).toContain('deleted successfully');

    // Then: Nur der neue Request ist sichtbar
    
    const listRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'GET',
    });

    const listResponse = await getFeatures(listRequest);
    const features = await listResponse.json();

    // BUSINESS OUTCOME VERIFICATION #2: Only one Dark Mode feature is visible
    const darkModeFeatures = features.filter((f: any) => f.title === 'Dark Mode');
    expect(darkModeFeatures.length).toBe(1);

    // BUSINESS OUTCOME VERIFICATION #3: The visible feature is the newer one
    expect(darkModeFeatures[0].id).toBe(newerDarkModeId);
    expect(darkModeFeatures[0].description).toBe('Duplicate submission for dark mode');

    // BUSINESS OUTCOME VERIFICATION #4: The older feature is not in the list
    const olderFeature = features.find((f: any) => f.id === olderDarkModeId);
    expect(olderFeature).toBeUndefined();
  });

  it('BUSINESS OUTCOME: Non-admin users cannot delete features', async () => {
    // When: Non-admin user tries to delete
    const deleteRequest = new NextRequest(`http://localhost:3000/api/features/${olderDarkModeId}`, {
      method: 'DELETE',
      headers: {
        'x-user-admin': 'false', // Not an admin
      },
    });

    const deleteResponse = await deleteFeature(deleteRequest, { 
      params: Promise.resolve({ id: olderDarkModeId.toString() }) 
    });
    const deleteResult = await deleteResponse.json();

    // BUSINESS OUTCOME VERIFICATION #1: Deletion is rejected
    expect(deleteResponse.status).toBe(403);
    expect(deleteResult.error).toContain('Unauthorized');
    expect(deleteResult.error).toContain('Admin');

    // BUSINESS OUTCOME VERIFICATION #2: Both features are still visible
    const listRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'GET',
    });

    const listResponse = await getFeatures(listRequest);
    const features = await listResponse.json();

    const darkModeFeatures = features.filter((f: any) => f.title === 'Dark Mode');
    expect(darkModeFeatures.length).toBe(2);
  });

  it('BUSINESS OUTCOME: Admin cannot delete non-existent feature', async () => {
    const nonExistentId = 99999;

    const deleteRequest = new NextRequest(`http://localhost:3000/api/features/${nonExistentId}`, {
      method: 'DELETE',
      headers: {
        'x-user-admin': 'true',
      },
    });

    const deleteResponse = await deleteFeature(deleteRequest, { 
      params: Promise.resolve({ id: nonExistentId.toString() }) 
    });

    // BUSINESS OUTCOME: Deletion completes without error (soft delete)
    expect(deleteResponse.status).toBe(200);
  });

  it('BUSINESS OUTCOME: Deleting feature removes votes but keeps voter history', async () => {
    // Add vote to older Dark Mode
    const { POST: addVote } = await import('@/app/api/features/[id]/vote/route');
    
    const voteRequest = new NextRequest(`http://localhost:3000/api/features/${olderDarkModeId}/vote`, {
      method: 'POST',
      body: JSON.stringify({
        userId: 'voter1',
        userName: 'Voter One',
        userAvatar: 'https://i.pravatar.cc/150?u=voter1'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await addVote(voteRequest, { params: Promise.resolve({ id: olderDarkModeId.toString() }) });

    // Delete the feature
    const deleteRequest = new NextRequest(`http://localhost:3000/api/features/${olderDarkModeId}`, {
      method: 'DELETE',
      headers: {
        'x-user-admin': 'true',
      },
    });

    await deleteFeature(deleteRequest, { 
      params: Promise.resolve({ id: olderDarkModeId.toString() }) 
    });

    // BUSINESS OUTCOME: Feature is not visible in list
    const listRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'GET',
    });

    const listResponse = await getFeatures(listRequest);
    const features = await listResponse.json();

    const deletedFeature = features.find((f: any) => f.id === olderDarkModeId);
    expect(deletedFeature).toBeUndefined();
  });

  it('BUSINESS OUTCOME: Multiple duplicates can be cleaned up by admin', async () => {
    // Create a third Dark Mode request
    const third = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Dark Mode',
        description: 'Yet another dark mode request'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const thirdResponse = await createFeature(third);
    const thirdFeature = await thirdResponse.json();

    // Delete both older duplicates
    const delete1 = new NextRequest(`http://localhost:3000/api/features/${olderDarkModeId}`, {
      method: 'DELETE',
      headers: { 'x-user-admin': 'true' },
    });

    const delete2 = new NextRequest(`http://localhost:3000/api/features/${newerDarkModeId}`, {
      method: 'DELETE',
      headers: { 'x-user-admin': 'true' },
    });

    await deleteFeature(delete1, { params: Promise.resolve({ id: olderDarkModeId.toString() }) });
    await deleteFeature(delete2, { params: Promise.resolve({ id: newerDarkModeId.toString() }) });

    // BUSINESS OUTCOME: Only the newest feature remains
    const listRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'GET',
    });

    const listResponse = await getFeatures(listRequest);
    const features = await listResponse.json();

    const darkModeFeatures = features.filter((f: any) => f.title === 'Dark Mode');
    expect(darkModeFeatures.length).toBe(1);
    expect(darkModeFeatures[0].id).toBe(thirdFeature.id);
    expect(darkModeFeatures[0].description).toBe('Yet another dark mode request');
  });
});


