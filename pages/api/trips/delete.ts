import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db';
import { trips } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    // Delete only if trip belongs to user
    const result = await db
      .delete(trips)
      .where(and(
        eq(trips.id, id),
        eq(trips.userId, session.user.id)
      ))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: 'Trip not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete trip'
    });
  }
}
