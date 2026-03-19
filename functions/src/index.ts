import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';

admin.initializeApp();

setGlobalOptions({ region: 'us-central1' });

const db = admin.firestore();
const fcm = admin.messaging();

export const onNewDelivery = onDocumentCreated(
  'deliveries/{deliveryId}',
  async (event) => {
    const delivery = event.data?.data();
    if (!delivery) {
      console.log('No delivery data found, skipping.');
      return;
    }

    const { orderId, customerName, assignedDriverUid } = delivery;

    if (!assignedDriverUid) {
      console.log(`Delivery ${event.params.deliveryId} has no assigned driver.`);
      return;
    }

    const userDoc = await db.collection('users').doc(assignedDriverUid).get();
    const fcmToken: string | undefined = userDoc.data()?.fcmToken;

    if (!fcmToken) {
      console.log(`No FCM token found for driver ${assignedDriverUid}.`);
      return;
    }

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title: '📦 New Delivery Assigned',
        body: `Order #${orderId} — ${customerName}`,
      },
      data: {
        screen: 'deliveries',
        deliveryId: event.params.deliveryId,
        orderId: String(orderId ?? ''),
        customerName: String(customerName ?? ''),
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'deliveries',
          color: '#1A73E8',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: '📦 New Delivery Assigned',
              body: `Order #${orderId} — ${customerName}`,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const messageId = await fcm.send(message);
      console.log(
        `Notification sent to driver ${assignedDriverUid} for delivery ${event.params.deliveryId}. Message ID: ${messageId}`
      );
    } catch (error: unknown) {
      console.error('FCM send error:', error);

      const err = error as { errorInfo?: { code?: string } };
      if (
        err.errorInfo?.code === 'messaging/invalid-registration-token' ||
        err.errorInfo?.code === 'messaging/registration-token-not-registered'
      ) {
        await db.collection('users').doc(assignedDriverUid).update({
          fcmToken: admin.firestore.FieldValue.delete(),
        });
        console.log(`Cleaned up stale FCM token for driver ${assignedDriverUid}.`);
      }
    }
  }
);
