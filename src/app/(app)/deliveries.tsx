import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { auth } from '../../services/firebase';
import { useAuthStore } from '../../store/authStore';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useNotifications } from '../../hooks/useNotifications';
import { DeliveryCard } from '../../components/DeliveryCard';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { Delivery } from '../../types/delivery';

export default function DeliveriesScreen() {
  const user = useAuthStore((s) => s.user);
  const { deliveries, loading, updateStatus } = useDeliveries(user?.uid);

  useNotifications(user?.uid);

  const pendingCount = deliveries.filter(
    (d) => d.status === 'pending' || d.status === 'in_progress'
  ).length;

  if (loading && deliveries.length === 0) {
    return <LoadingOverlay message="Loading deliveries..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Drivers</Text>
          <Text style={styles.pendingInfo}>
            {pendingCount > 0
              ? `${pendingCount} pending stop${pendingCount > 1 ? 's' : ''}`
              : 'All deliveries complete!'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => auth.signOut()}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={deliveries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: { item: Delivery }) => (
          <DeliveryCard
            delivery={item}
            onPress={() =>
              router.push({ pathname: '/(app)/route', params: { focusId: item.id } })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No deliveries assigned</Text>
            <Text style={styles.emptySubtitle}>
              New deliveries will appear here automatically.
            </Text>
          </View>
        }
        contentContainerStyle={
          deliveries.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={loading} tintColor="#1A73E8" />
        }
      />

      {pendingCount > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.routeButton}
            onPress={() => router.push('/(app)/route')}
            activeOpacity={0.85}
          >
            <Text style={styles.routeButtonText}>View Optimised Route</Text>
            <Text style={styles.routeButtonSubtext}>
              {pendingCount} stop{pendingCount > 1 ? 's' : ''} remaining
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#1A73E8',
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pendingInfo: {
    fontSize: 14,
    color: '#BFDBFE',
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  routeButton: {
    backgroundColor: '#1A73E8',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  routeButtonSubtext: {
    color: '#BFDBFE',
    fontSize: 12,
    marginTop: 2,
  },
});
