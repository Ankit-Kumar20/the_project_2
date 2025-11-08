import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { origins, destinations } = req.body;

  if (!origins || !destinations) {
    return res.status(400).json({ error: 'Origins and destinations are required' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Google Maps API key not configured' });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.append('origins', origins);
    url.searchParams.append('destinations', destinations);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('units', 'metric');

    console.log('🗺️  Distance API Request:', {
      origins,
      destinations,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(url.toString());
    const data = await response.json();

    console.log('📡 Distance API Response Status:', data.status);

    if (data.status !== 'OK') {
      console.error('❌ Distance API Error:', {
        status: data.status,
        error_message: data.error_message,
        data
      });
      return res.status(500).json({ error: 'Failed to fetch distance data', details: data });
    }

    const element = data.rows[0]?.elements[0];
    if (element?.status !== 'OK') {
      console.error('❌ Distance Element Error:', {
        status: element?.status,
        element
      });
      return res.status(500).json({ error: 'Distance not available', details: element });
    }

    // Convert distance from meters to kilometers
    const distanceInKm = (element.distance.value / 1000).toFixed(2);
    const distanceText = `${distanceInKm} km`;

    console.log('✅ Distance Calculated:', {
      from: origins,
      to: destinations,
      distance: distanceText,
      distanceKm: parseFloat(distanceInKm),
      distanceMeters: element.distance.value,
      duration: element.duration.text,
      durationSeconds: element.duration.value,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      distance: distanceText,
      duration: element.duration.text,
      distanceValue: element.distance.value,
      distanceKm: parseFloat(distanceInKm),
      durationValue: element.duration.value,
    });
  } catch (error) {
    console.error('❌ Distance API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
