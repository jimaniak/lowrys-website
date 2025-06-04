"use client";

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function AdminNotifications() {
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Set initial permission state
    setNotificationPermission(Notification.permission);

    // Set up FCM
    const setupFCM = async () => {
      try {
        // Check if we're in a browser and if the browser supports service workers
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          const messaging = getMessaging();
          
          // Request permission if not already granted
          if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission !== 'granted') {
              console.error('Notification permission not granted');
              return;
            }
          }
          
          // Get token using your VAPID key
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
          
          if (token) {
            setFcmToken(token);
            
            // Save token to your database
            const uid = 'admin'; // Or get actual user ID if you have authentication
            const tokenRef = doc(db, 'fcmTokens', uid);
            
            try {
              // Try to update existing document
              await updateDoc(tokenRef, {
                token: token,
                timestamp: new Date()
              });
            } catch (err: any) {
              // If document doesn't exist, create it
              if (err.code === 'not-found') {
                await setDoc(doc(db, 'fcmTokens', uid), {
                  token: token,
                  timestamp: new Date()
                });
              } else {
                throw err;
              }
            }
            
            console.log('FCM token registered:', token);
            
            // Handle foreground messages
            onMessage(messaging, (payload) => {
              console.log('Received foreground message:', payload);
              // You can display a custom notification here if desired
              if (payload.notification) {
                const { title, body } = payload.notification;
                // Create a custom notification or update UI
                new Notification(title || 'New Notification', {
                  body: body || 'You have a new notification'
                });
              }
            });
          } else {
            console.error('No registration token available');
          }
        } else {
          console.log('This browser does not support notifications or service workers');
        }
      } catch (error) {
        console.error('Error setting up FCM:', error);
      }
    };
    
    setupFCM();
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Re-initialize FCM after permission is granted
        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        setFcmToken(token);
        
        // Save token to database
        if (token) {
          const uid = 'admin';
          await setDoc(doc(db, 'fcmTokens', uid), {
            token: token,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  return (
    <div className="mb-8 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
      
      <div className="mb-4">
        <p className="mb-2">
          <strong>Notification Status:</strong> {notificationPermission === 'granted' 
            ? 'Enabled' 
            : notificationPermission === 'denied' 
              ? 'Blocked' 
              : 'Not enabled'}
        </p>
        
        {notificationPermission !== 'granted' && (
          <button
            onClick={requestPermission}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={notificationPermission === 'denied'}
          >
            {notificationPermission === 'denied' 
              ? 'Notifications Blocked (check browser settings)' 
              : 'Enable Notifications'}
          </button>
        )}
        
        {notificationPermission === 'granted' && (
          <p className="text-green-600">
            You will receive real-time notifications when new resume requests are submitted.
          </p>
        )}
        
        {fcmToken && (
          <p className="mt-2 text-sm text-gray-600">
            Device registered for notifications
          </p>
        )}
      </div>
    </div>
  );
}
