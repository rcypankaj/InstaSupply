import '../lib/patchNativeMaps';
import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { auth } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import * as Notifications from 'expo-notifications';
import { onAuthStateChanged } from '@react-native-firebase/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setUser, setAuthStep } = useAuthStore();

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const screen = response.notification.request.content.data?.screen as string | undefined;
      if (screen === 'deliveries') {
        setTimeout(() => router.push('/(app)/deliveries'), 300);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setAuthStep('unauthenticated');
        router.replace('/(auth)/login');
      } else {
        const hasPhone = user.providerData?.some((p) => p.providerId === 'phone');
        if (!hasPhone) {
          setAuthStep('phone_required');
          router.replace('/(auth)/phone-otp');
        } else {
          setAuthStep('authenticated');
          router.replace('/(app)/deliveries');
        }
      }
      SplashScreen.hideAsync();
    });
    return () => unsubscribe();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
