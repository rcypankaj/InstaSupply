export const COLLECTIONS = {
  DELIVERIES: 'deliveries',
  USERS: 'users',
} as const;

export const NOTIFICATION_CHANNELS = {
  DELIVERIES: 'deliveries',
} as const;

export const GOOGLE_MAPS_DIRECTIONS_URL =
  'https://maps.googleapis.com/maps/api/directions/json';

export const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  in_progress: '#3B82F6',
  completed: '#10B981',
  failed: '#EF4444',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  failed: 'Failed',
};
