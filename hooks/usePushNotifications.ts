import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { Alert } from 'react-native';

export function usePushNotifications() {
  useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      } else {
        Alert.alert('Push Notifications Disabled', 'Please enable push notifications in your settings.');
      }
    };

    const getToken = async () => {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    };

    const onMessageListener = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('New Notification', remoteMessage.notification?.title || '');
    });

    requestPermission();
    getToken();

    return () => {
      onMessageListener();
    };
  }, []);
}
