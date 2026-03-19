export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface OptimizedRoute {
  orderedIndices: number[]; // original index → optimized position
  polylinePoints: LatLng[];
  totalDurationSeconds: number;
  totalDistanceMeters: number;
}
