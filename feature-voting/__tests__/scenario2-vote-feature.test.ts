/**
 * BDD Scenario 2: Team-Member vote für Feature
 * 
 * Given: Es gibt einen Request "Dark Mode" mit 0 Votes
 * When: Ich klicke auf "Upvote"
 * Then: Der Vote-Zähler steht bei 1
 * And: Ich sehe meinen Avatar in der Voter-Liste
 */

import { NextRequest } from 'next/server';
import { POST as createFeature, GET as getFeatures } from '@/app/api/features/route';
import { GET as getFeatureById } from '@/app/api/features/[id]/route';
import { POST as addVote, GET as getVoters } from '@/app/api/features/[id]/vote/route';
import { initDatabase, clearDatabase } from '@/lib/db';

describe('Scenario 2: Team-Member vote für Feature', () => {
  let featureId: number;

  beforeAll(async () => {
    await clearDatabase();
    await initDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    // Given: Es gibt einen Request "Dark Mode" mit 0 Votes
    const createRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Dark Mode',
        description: 'User wollen Nachts besser lesen'
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const createResponse = await createFeature(createRequest);
    const feature = await createResponse.json();
    featureId = feature.id;

    // Verify initial state
    expect(feature.votes).toBe(0);
  });

  it('BUSINESS OUTCOME: Vote counter increases and voter avatar appears in list', async () => {
    // When: Ich klicke auf "Upvote"
    const userData = {
      userId: 'user123',
      userName: 'Max Mustermann',
      userAvatar: 'https://i.pravatar.cc/150?u=user123'
    };

    const voteRequest = new NextRequest(`http://localhost:3000/api/features/${featureId}/vote`, {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const voteResponse = await addVote(voteRequest, { params: Promise.resolve({ id: featureId.toString() }) });
    const voteResult = await voteResponse.json();

    // BUSINESS OUTCOME VERIFICATION #1: Vote was recorded
    expect(voteResponse.status).toBe(201);
    expect(voteResult).toHaveProperty('id');
    expect(voteResult.feature_id).toBe(featureId);
    expect(voteResult.user_id).toBe(userData.userId);

    // Then: Der Vote-Zähler steht bei 1
    const featureRequest = new NextRequest(`http://localhost:3000/api/features/${featureId}`, {
      method: 'GET',
    });

    const featureResponse = await getFeatureById(featureRequest, { params: Promise.resolve({ id: featureId.toString() }) });
    const updatedFeature = await featureResponse.json();

    // BUSINESS OUTCOME VERIFICATION #2: Vote counter is incremented
    expect(updatedFeature.votes).toBe(1);

    // And: Ich sehe meinen Avatar in der Voter-Liste
    const votersRequest = new NextRequest(`http://localhost:3000/api/features/${featureId}/vote`, {
      method: 'GET',
    });

    const votersResponse = await getVoters(votersRequest, { params: Promise.resolve({ id: featureId.toString() }) });
    const voters = await votersResponse.json();

    // BUSINESS OUTCOME VERIFICATION #3: My avatar appears in voter list
    expect(Array.isArray(voters)).toBe(true);
    expect(voters.length).toBe(1);
    
    const myVote = voters[0];
    expect(myVote.user_id).toBe(userData.userId);
    expect(myVote.user_name).toBe(userData.userName);
    expect(myVote.user_avatar).toBe(userData.userAvatar);

    // BUSINESS OUTCOME VERIFICATION #4: Feature appears in list with correct vote count
    const listRequest = new NextRequest('http://localhost:3000/api/features', {
      method: 'GET',
    });

    const listResponse = await getFeatures(listRequest);
    const features = await listResponse.json();
    const votedFeature = features.find((f: any) => f.id === featureId);

    expect(votedFeature.votes).toBe(1);
  });

  it('BUSINESS OUTCOME: Multiple users can vote for same feature', async () => {
    // User 1 votes
    const user1 = {
      userId: 'user1',
      userName: 'Alice',
      userAvatar: 'https://i.pravatar.cc/150?u=user1'
    };

    const vote1Request = new NextRequest(`http://localhost:3000/api/features/${featureId}/vote`, {
      method: 'POST',
      body: JSON.stringify(user1),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const vote1Response = await addVote(vote1Request, { params: Promise.resolve({ id: featureId.toString() }) });
    expect(vote1Response.status).toBe(201);

    // User 2 votes
    const user2 = {
      userId: 'user2',
      userName: 'Bob',
      userAvatar: 'https://i.pravatar.cc/150?u=user2'
    };

    const vote2Request = new NextRequest(`http://localhost:3000/api/features/${featureId}/vote`, {
      method: 'POST',
      body: JSON.stringify(user2),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const vote2Response = await addVote(vote2Request, { params: Promise.resolve({ id: featureId.toString() }) });
    expect(vote2Response.status).toBe(201);

    // BUSINESS OUTCOME: Vote count reflects both votes
    const featureRequest = new NextRequest(`http://localhost:3000/api/features/${featureId}`, {
      method: 'GET',
    });

    const featureResponse = await getFeatureById(featureRequest, { params: Promise.resolve({ id: featureId.toString() }) });
    const feature = await featureResponse.json();

    expect(feature.votes).toBe(2);

    // BUSINESS OUTCOME: Both avatars appear in voter list
    const votersRequest = new NextRequest(`http://localhost:3000/api/features/${featureId}/vote`, {
      method: 'GET',
    });

    const votersResponse = await getVoters(votersRequest, { params: Promise.resolve({ id: featureId.toString() }) });
    const voters = await votersResponse.json();

    expect(voters.length).toBe(2);
    expect(voters.find((v: any) => v.user_id === 'user1')).toBeDefined();
    expect(voters.find((v: any) => v.user_id === 'user2')).toBeDefined();
  });

  it('EDGE CASE: User cannot vote twice for same feature', async () => {
    const userData = {
      userId: 'user456',
      userName: 'Jane Doe',
      userAvatar: 'https://i.pravatar.cc/150?u=user456'
    };

    // First vote
    const vote1Request = new NextRequest(`http://localhost:3000/api/features/${featureId}/vote`, {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const vote1Response = await addVote(vote1Request, { params: Promise.resolve({ id: featureId.toString() }) });
    expect(vote1Response.status).toBe(201);

    // Second vote (should fail)
    const vote2Request = new NextRequest(`http://localhost:3000/api/features/${featureId}/vote`, {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const vote2Response = await addVote(vote2Request, { params: Promise.resolve({ id: featureId.toString() }) });
    const result = await vote2Response.json();

    // BUSINESS OUTCOME: Duplicate votes are prevented
    expect(vote2Response.status).toBe(409);
    expect(result.error).toContain('already voted');

    // BUSINESS OUTCOME: Vote count is still 1
    const featureRequest = new NextRequest(`http://localhost:3000/api/features/${featureId}`, {
      method: 'GET',
    });

    const featureResponse = await getFeatureById(featureRequest, { params: Promise.resolve({ id: featureId.toString() }) });
    const feature = await featureResponse.json();

    expect(feature.votes).toBe(1);
  });
});


