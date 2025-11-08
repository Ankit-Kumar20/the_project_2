import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { trips } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    const [trip] = await db
      .select()
      .from(trips)
      .where(and(
        eq(trips.id, id),
        eq(trips.userId, session.user.id)
      ))
      .limit(1);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    return res.status(200).json({
      success: true,
      trip: {
        ...trip,
        tripData: JSON.parse(trip.tripData)
      }
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch trip'
    });
  }
}
