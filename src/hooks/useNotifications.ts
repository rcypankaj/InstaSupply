import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  setBackgroundMessageHandler,
  registerDeviceForRemoteMessages,
  getToken,
  onTokenRefresh,
  onMessage,
} from '@react-native-firebase/messaging';
import { doc, setDoc } from '@react-native-firebase/firestore';
import { messaging, db } from '../services/firebase';
import { COLLECTIONS, NOTIFICATION_CHANNELS } from '../utils/constants';
import { router } from 'expo-router';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Background / quit handler — must be at module level
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('Background FCM message:', remoteMessage.messageId);
});

export function useNotifications(uid: string | undefined) {
  useEffect(() => {
    if (!uid) return;

    const cleanups: (() => void)[] = [];

    (async () => {
      // 1. Create Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.DELIVERIES, {
          name: 'Deliveries',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1A73E8',
        });
      }

      // 2. Request permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission denied');
        return;
      }

      // 3. Get FCM token
      await registerDeviceForRemoteMessages(messaging);
      const fcmToken = await getToken(messaging);
      if (fcmToken) {
        await saveFcmToken(uid, fcmToken);
      }

      // 4. Token refresh listener
      const unsubTokenRefresh = onTokenRefresh(messaging, async (token) => {
        await saveFcmToken(uid, token);
      });
      cleanups.push(unsubTokenRefresh);

      // 5. Foreground FCM message → display via expo-notifications
      const unsubForeground = onMessage(messaging, async (remoteMessage) => {
        const notification = remoteMessage.notification;
        if (!notification) return;
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title ?? 'New Delivery',
            body: notification.body ?? '',
            data: remoteMessage.data ?? {},
          },
          trigger: null,
        });
      });
      cleanups.push(unsubForeground);

      // 6. Notification tap → navigate to deliveries
      const sub = Notifications.addNotificationResponseReceivedListener((response) => {
        const screen = response.notification.request.content.data?.screen as string | undefined;
        if (screen === 'deliveries') {
          router.push('/(app)/deliveries');
        }
      });
      cleanups.push(() => sub.remove());
    })();

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [uid]);
}

async function saveFcmToken(uid: string, token: string) {
  try {
    await setDoc(
      doc(db, COLLECTIONS.USERS, uid),
      { fcmToken: token, tokenUpdatedAt: Date.now() },
      { merge: true }
    );
  } catch (err) {
    console.error('saveFcmToken error:', err);
  }
}
