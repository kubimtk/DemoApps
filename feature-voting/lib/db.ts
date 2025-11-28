import { sql } from '@vercel/postgres';

// Neon Postgres works with the standard sql template tag - no client setup needed!

export interface FeatureRequest {
  id: number;
  title: string;
  description: string;
  votes: number;
  created_at: Date;
  is_deleted: boolean;
}

export interface Vote {
  id: number;
  feature_id: number;
  user_id: string;
  user_name: string;
  user_avatar: string;
  created_at: Date;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  is_admin: boolean;
}

export async function initDatabase() {
  try {
    
    // Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS feature_requests (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        votes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        id SERIAL PRIMARY KEY,
        feature_id INTEGER REFERENCES feature_requests(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_avatar VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(feature_id, user_id)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        avatar VARCHAR(500) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE
      )
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function clearDatabase() {
  try {
    await sql`DROP TABLE IF EXISTS votes CASCADE`;
    await sql`DROP TABLE IF EXISTS feature_requests CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

// Feature Requests
export async function createFeatureRequest(title: string, description: string): Promise<FeatureRequest> {
  const result = await sql<FeatureRequest>`
    INSERT INTO feature_requests (title, description, votes)
    VALUES (${title}, ${description}, 0)
    RETURNING *
  `;
  return result.rows[0];
}

export async function getFeatureRequests(sortBy: 'recent' | 'votes' = 'recent'): Promise<FeatureRequest[]> {
  let result;
  
  if (sortBy === 'votes') {
    result = await sql<FeatureRequest>`
      SELECT * FROM feature_requests
      WHERE is_deleted = FALSE
      ORDER BY votes DESC, created_at DESC
    `;
  } else {
    result = await sql<FeatureRequest>`
      SELECT * FROM feature_requests
      WHERE is_deleted = FALSE
      ORDER BY created_at DESC
    `;
  }
  
  return result.rows;
}

export async function getFeatureRequestById(id: number): Promise<FeatureRequest | null> {
  const result = await sql<FeatureRequest>`
    SELECT * FROM feature_requests
    WHERE id = ${id} AND is_deleted = FALSE
  `;
  return result.rows[0] || null;
}

export async function deleteFeatureRequest(id: number): Promise<void> {
  await sql`
    UPDATE feature_requests
    SET is_deleted = TRUE
    WHERE id = ${id}
  `;
}

// Votes
export async function addVote(featureId: number, userId: string, userName: string, userAvatar: string): Promise<Vote> {
  // Check if already voted
  const existingVote = await sql<Vote>`
    SELECT * FROM votes
    WHERE feature_id = ${featureId} AND user_id = ${userId}
  `;

  if (existingVote.rows.length > 0) {
    throw new Error('User has already voted for this feature');
  }

  // Add vote
  const result = await sql<Vote>`
    INSERT INTO votes (feature_id, user_id, user_name, user_avatar)
    VALUES (${featureId}, ${userId}, ${userName}, ${userAvatar})
    RETURNING *
  `;

  // Update vote count
  await sql`
    UPDATE feature_requests
    SET votes = votes + 1
    WHERE id = ${featureId}
  `;

  return result.rows[0];
}

export async function getVotersForFeature(featureId: number): Promise<Vote[]> {
  const result = await sql<Vote>`
    SELECT * FROM votes
    WHERE feature_id = ${featureId}
    ORDER BY created_at DESC
  `;
  return result.rows;
}

// Users
export async function createUser(id: string, name: string, avatar: string, isAdmin: boolean = false): Promise<User> {
  const result = await sql<User>`
    INSERT INTO users (id, name, avatar, is_admin)
    VALUES (${id}, ${name}, ${avatar}, ${isAdmin})
    ON CONFLICT (id) DO UPDATE SET
      name = ${name},
      avatar = ${avatar},
      is_admin = ${isAdmin}
    RETURNING *
  `;
  return result.rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql<User>`
    SELECT * FROM users WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

