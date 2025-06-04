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

    console.log('AdminNotifications component mounted'); // Debug log
    
    // Set initial permission state
    setNotificationPermission(Notification.permission);
    console.log('Initial notification permission:', Notification.permission); // Debug log

    // Set up FCM
    const setupFCM = async () => {
      try {
        console.log('Setting up Firebase Cloud Messaging...'); // Debug log
        
        // Check if we're in a browser and if the browser supports service workers
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          console.log('Service Worker is supported by this browser'); // Debug log
          
          // Check service worker registrations
          const registrations = await navigator.serviceWorker.getRegistrations();
          console.log('Service Worker registrations:', registrations); // Debug log
          
          const messaging = getMessaging();
          console.log('Firebase messaging initialized'); // Debug log
          
          // Request permission if not already granted
          if (Notification.permission !== 'granted') {
            console.log('Requesting notification permission...'); // Debug log
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            console.log('Notification permission response:', permission); // Debug log
            
            if (permission !== 'granted') {
              console.error('Notification permission not granted');
              return;
            }
          }
          
          // Get token using your VAPID key
          console.log('Getting FCM token with VAPID key:', process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ? 'Key exists' : 'Key missing'); // Debug log
          
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
          
          if (token) {
            console.log('FCM token obtained:', token); // Debug log
            setFcmToken(token);
            
            // Save token to your database
            const uid = 'admin'; // Or get actual user ID if you have authentication
            const tokenRef = doc(db, 'fcmTokens', uid);
            console.log('Saving FCM token to Firestore for uid:', uid); // Debug log
            
            try {
              // Try to update existing document
              console.log('Attempting to update existing FCM token document'); // Debug log
              await updateDoc(tokenRef, {
                token: token,
                timestamp: new Date()
              });
              console.log('FCM token document updated successfully'); // Debug log
            } catch (err: any) {
              console.log('Error updating FCM token document:', err.code); // Debug log
              
              // If document doesn't exist, create it
              if (err.code === 'not-found') {
                console.log('FCM token document not found, creating new document'); // Debug log
                await setDoc(doc(db, 'fcmTokens', uid), {
                  token: token,
                  timestamp: new Date()
                });
                console.log('New FCM token document created successfully'); // Debug log
              } else {
                console.error('Unexpected error saving FCM token:', err); // Debug log
                throw err;
              }
            }
            
            console.log('FCM token registered:', token);
            
            // Handle foreground messages
            console.log('Setting up foreground message handler'); // Debug log
            onMessage(messaging, (payload) => {
              console.log('Received foreground message:', payload);
              // You can display a custom notification here if desired
              if (payload.notification) {
                const { title, body } = payload.notification;
                console.log('Creating notification with title:', title, 'and body:', body); // Debug log
                
                // Create a custom notification or update UI
                new Notification(title || 'New Notification', {
                  body: body || 'You have a new notification'
                });
                
                console.log('Custom notification displayed'); // Debug log
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
      console.log('Manually requesting notification permission...'); // Debug log
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      console.log('Manual permission request response:', permission); // Debug log
      
      if (permission === 'granted') {
        console.log('Permission granted, re-initializing FCM'); // Debug log
        
        // Re-initialize FCM after permission is granted
        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        console.log('New FCM token obtained:', token); // Debug log
        setFcmToken(token);
        
        // Save token to database
        if (token) {
          const uid = 'admin';
          console.log('Saving new FCM token to Firestore'); // Debug log
          await setDoc(doc(db, 'fcmTokens', uid), {
            token: token,
            timestamp: new Date()
          });
          console.log('New FCM token saved successfully'); // Debug log
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
