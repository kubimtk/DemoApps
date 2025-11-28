import { NextRequest, NextResponse } from 'next/server';
import { getFeatureRequestById, deleteFeatureRequest } from '@/lib/db';

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

    const feature = await getFeatureRequestById(featureId);

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(feature, { status: 200 });
  } catch (error) {
    console.error('Error fetching feature request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user is admin (in a real app, this would check authentication)
    const isAdmin = request.headers.get('x-user-admin') === 'true';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await deleteFeatureRequest(featureId);

    return NextResponse.json(
      { message: 'Feature request deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting feature request:', error);
    return NextResponse.json(
      { error: 'Failed to delete feature request' },
      { status: 500 }
    );
  }
}


