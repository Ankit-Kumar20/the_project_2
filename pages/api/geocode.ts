import type { NextApiRequest, NextApiResponse } from 'next';
import { geocodeLocation } from '@/lib/google-places';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const coordinates = await geocodeLocation(location);

    if (!coordinates) {
      return res.status(404).json({ error: 'Could not geocode location' });
    }

    return res.status(200).json({
      success: true,
      coordinates,
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return res.status(500).json({ error: 'Failed to geocode location' });
  }
}
