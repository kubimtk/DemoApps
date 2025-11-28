import { NextRequest, NextResponse } from 'next/server';
import { addVote, getVotersForFeature } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const featureId = parseInt(id);

    if (isNaN(featureId)) {
      return NextResponse.json(
        { error: 'Invalid feature ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId, userName, userAvatar } = body;

    if (!userId || !userName || !userAvatar) {
      return NextResponse.json(
        { error: 'User information is required' },
        { status: 400 }
      );
    }

    const vote = await addVote(featureId, userId, userName, userAvatar);

    return NextResponse.json(vote, { status: 201 });
  } catch (error: any) {
    console.error('Error adding vote:', error);
    
    if (error.message === 'User has already voted for this feature') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add vote' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const featureId = parseInt(id);

    if (isNaN(featureId)) {
      return NextResponse.json(
        { error: 'Invalid feature ID' },
        { status: 400 }
      );
    }

    const voters = await getVotersForFeature(featureId);

    return NextResponse.json(voters, { status: 200 });
  } catch (error) {
    console.error('Error fetching voters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voters' },
      { status: 500 }
    );
  }
}


