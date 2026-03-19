import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { Delivery, OptimizedStop } from '../types/delivery';
import { LatLng, OptimizedRoute } from '../types/route';

interface RouteState {
  orderedStops: OptimizedStop[];
  route: OptimizedRoute | null;
  driverLocation: LatLng | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRouteOptimization(deliveries: Delivery[]): RouteState {
  const [orderedStops, setOrderedStops] = useState<OptimizedStop[]>([]);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  const refresh = useCallback(() => setTrigger((t) => t + 1), []);

  useEffect(() => {
    const pending = deliveries.filter(
      (d) => d.status === 'pending' || d.status === 'in_progress'
    );

    if (pending.length === 0) {
      setOrderedStops([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied.');
          setLoading(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!cancelled) {
          setDriverLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
      } catch (err) {
      }

      if (!cancelled) {
        const stops: OptimizedStop[] = pending.map((d, i) => ({
          ...d,
          stopNumber: i + 1,
        }));
        setOrderedStops(stops);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [deliveries, trigger]);

  return { orderedStops, route: null, driverLocation, loading, error, refresh };
}
