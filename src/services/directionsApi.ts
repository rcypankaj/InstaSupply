import { GOOGLE_MAPS_DIRECTIONS_URL } from '../utils/constants';
import { decodePolyline } from '../utils/polyline';
import { LatLng, OptimizedRoute } from '../types/route';

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

export async function getOptimizedRoute(
  origin: LatLng,
  waypoints: LatLng[]
): Promise<OptimizedRoute | null> {
  if (waypoints.length === 0) return null;

  const originStr = `${origin.latitude},${origin.longitude}`;

  // With a single waypoint destination is the same as the waypoint
  const destination = `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;

  // Build waypoints string — optimize:true asks Google to reorder for shortest path
  let waypointStr = '';
  if (waypoints.length > 1) {
    const middle = waypoints.slice(0, -1);
    waypointStr = `optimize:true|${middle.map((p) => `${p.latitude},${p.longitude}`).join('|')}`;
  }

  const params = new URLSearchParams({
    origin: originStr,
    destination,
    key: API_KEY,
    departure_time: 'now', // enables traffic-aware routing
    traffic_model: 'best_guess',
  });

  if (waypointStr) {
    params.append('waypoints', waypointStr);
  }

  const url = `${GOOGLE_MAPS_DIRECTIONS_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.routes?.length) {
      console.warn('Directions API error:', data.status, data.error_message);
      return null;
    }

    const route = data.routes[0];

    // waypoint_order contains the reordered indices of the intermediate waypoints
    const waypointOrder: number[] = route.waypoint_order ?? [];

    // Build the full ordered indices array (includes final destination)
    const orderedIndices =
      waypoints.length === 1
        ? [0]
        : [...waypointOrder, waypoints.length - 1];

    // Decode the overview polyline for rendering on the map
    const polylinePoints = decodePolyline(route.overview_polyline.points);

    // Sum up duration and distance across all legs
    const legs: any[] = route.legs ?? [];
    const totalDurationSeconds = legs.reduce(
      (sum: number, leg: any) => sum + (leg.duration_in_traffic?.value ?? leg.duration?.value ?? 0),
      0
    );
    const totalDistanceMeters = legs.reduce(
      (sum: number, leg: any) => sum + (leg.distance?.value ?? 0),
      0
    );

    return { orderedIndices, polylinePoints, totalDurationSeconds, totalDistanceMeters };
  } catch (error) {
    console.error('getOptimizedRoute error:', error);
    return null;
  }
}
