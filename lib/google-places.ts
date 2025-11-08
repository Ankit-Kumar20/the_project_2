// Google Places API helper functions

export interface PlaceDetails {
  name: string;
  rating?: number;
  userRatingsTotal?: number;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
  }>;
  photos?: Array<{
    photoReference: string;
    height: number;
    width: number;
  }>;
  formattedAddress?: string;
  openingHours?: {
    weekdayText?: string[];
  };
}

export async function searchPlace(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY is not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
        query
      )}&inputtype=textquery&fields=place_id&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.candidates?.length > 0) {
      return data.candidates[0].place_id;
    }

    return null;
  } catch (error) {
    console.error('Error searching place:', error);
    return null;
  }
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY is not set');
    return null;
  }

  try {
    const fields = [
      'name',
      'rating',
      'user_ratings_total',
      'reviews',
      'photos',
      'formatted_address',
      'opening_hours',
    ].join(',');

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      return {
        name: result.name,
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        reviews: result.reviews?.map((review: any) => ({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
        })),
        photos: result.photos?.slice(0, 5).map((photo: any) => ({
          photoReference: photo.photo_reference,
          height: photo.height,
          width: photo.width,
        })),
        formattedAddress: result.formatted_address,
        openingHours: result.opening_hours,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}

export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

export async function getLocationInsights(locationName: string): Promise<PlaceDetails | null> {
  const placeId = await searchPlace(locationName);
  
  if (!placeId) {
    return null;
  }

  return await getPlaceDetails(placeId);
}
