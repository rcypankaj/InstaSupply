import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Delivery } from '../types/delivery';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/constants';

interface Props {
  delivery: Delivery;
  onPress?: () => void;
}

export function DeliveryCard({ delivery, onPress }: Props) {
  const statusColor = STATUS_COLORS[delivery.status] ?? '#6B7280';
  const statusLabel = STATUS_LABELS[delivery.status] ?? delivery.status;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.orderId}>#{delivery.orderId}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={styles.customerName}>{delivery.customerName}</Text>
      <Text style={styles.address} numberOfLines={2}>
        {delivery.address}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});
