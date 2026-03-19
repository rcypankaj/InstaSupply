export type DeliveryStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  status: DeliveryStatus;
  assignedDriverUid: string;
  createdAt: number; // Unix timestamp
  updatedAt: number;
}

export interface OptimizedStop extends Delivery {
  stopNumber: number;
}
