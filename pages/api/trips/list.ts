import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { trips } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

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

    const userTrips = await db
      .select({
        id: trips.id,
        name: trips.name,
        fromLocation: trips.fromLocation,
        toLocation: trips.toLocation,
        days: trips.days,
        stops: trips.stops,
        createdAt: trips.createdAt,
      })
      .from(trips)
      .where(eq(trips.userId, session.user.id))
      .orderBy(trips.createdAt);

    return res.status(200).json({
      success: true,
      trips: userTrips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch trips'
    });
  }
}
