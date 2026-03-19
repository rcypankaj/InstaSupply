import { router } from 'expo-router';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useRouteOptimization } from '../../hooks/useRouteOptimization';
import { useAuthStore } from '../../store/authStore';
import { OptimizedStop } from '../../types/delivery';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/constants';

export default function RouteScreen() {
  const user = useAuthStore((s) => s.user);
  const { deliveries, updateStatus } = useDeliveries(user?.uid);
  const { orderedStops, route, driverLocation, loading, error, refresh } =
    useRouteOptimization(deliveries);

  const handleMarkDelivered = useCallback(
    async (stop: OptimizedStop) => {
      await updateStatus(stop.id, 'completed');
      refresh();
    },
    [updateStatus, refresh]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Optimised Route</Text>
        <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.mapOverlay}>
            <ActivityIndicator size="small" color="#1A73E8" />
            <Text style={styles.mapOverlayText}>Loading route…</Text>
          </View>
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackText}>Map unavailable</Text>
            <Text style={styles.mapFallbackSub}>Coming Soon</Text>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={orderedStops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: OptimizedStop }) => (
          <StopListItem
            stop={item}
            onMarkDelivered={() => handleMarkDelivered(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>All deliveries complete!</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.stopsList}
      />
    </View>
  );
}

function StopListItem({
  stop,
  onMarkDelivered,
}: {
  stop: OptimizedStop;
  onMarkDelivered: () => void;
}) {
  const isActive = stop.status === 'pending' || stop.status === 'in_progress';
  const statusColor = STATUS_COLORS[stop.status] ?? '#6B7280';

  return (
    <View style={[styles.stopCard, !isActive && styles.stopCardDone]}>
      <View style={styles.stopBadge}>
        <Text style={styles.stopNumber}>{stop.stopNumber}</Text>
      </View>
      <View style={styles.stopInfo}>
        <Text style={styles.stopCustomer}>{stop.customerName}</Text>
        <Text style={styles.stopAddress} numberOfLines={1}>
          {stop.address}
        </Text>
        <Text style={[styles.stopStatus, { color: statusColor }]}>
          {STATUS_LABELS[stop.status]}
        </Text>
      </View>
      {isActive && (
        <TouchableOpacity
          style={styles.deliverBtn}
          onPress={onMarkDelivered}
          activeOpacity={0.8}
        >
          <Text style={styles.deliverBtnText}>✓{'\n'}Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#1A73E8',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  backText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  refreshBtn: {
    padding: 4,
    width: 32,
    alignItems: 'center',
  },
  refreshText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  mapContainer: {
    height: 280,
    backgroundColor: '#E5E7EB',
  },
  mapOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  mapOverlayText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  mapFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  mapFallbackText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  mapFallbackSub: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  errorText: { color: '#92400E', fontSize: 12 },
  stopsList: { paddingVertical: 8, paddingBottom: 24 },
  stopCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  stopCardDone: { opacity: 0.55 },
  stopBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumber: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  stopInfo: { flex: 1 },
  stopCustomer: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  stopAddress: { fontSize: 12, color: '#6B7280', marginBottom: 3 },
  stopStatus: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  deliverBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deliverBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
});
