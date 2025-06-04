"use client";

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function AdminNotifications() {
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to log errors to Firestore for easier debugging
  const logErrorToFirestore = async (errorType: string, errorMessage: string, errorDetails?: any) => {
    try {
      await addDoc(collection(db, 'fcmErrors'), {
        errorType,
        errorMessage,
        errorDetails: errorDetails ? JSON.stringify(errorDetails) : null,
        timestamp: new Date()
      });
      console.log('Error logged to Firestore:', errorType, errorMessage);
    } catch (err) {
      console.error('Failed to log error to Firestore:', err);
    }
  };

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      const errorMsg = 'This browser does not support notifications';
      setError(errorMsg);
      logErrorToFirestore('browser_support', errorMsg);
      console.log(errorMsg);
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
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('Service Worker registrations:', registrations); // Debug log
            
            if (registrations.length === 0) {
              const errorMsg = 'No service workers registered';
              setError(errorMsg);
              logErrorToFirestore('service_worker', errorMsg);
            }
          } catch (err) {
            const errorMsg = `Error checking service worker registrations: ${err}`;
            setError(errorMsg);
            logErrorToFirestore('service_worker', errorMsg, err);
            console.error(errorMsg);
          }
          
          // Check if firebase-messaging-sw.js is accessible
          try {
            const swResponse = await fetch('/firebase-messaging-sw.js');
            console.log('Service Worker fetch response:', swResponse.status); // Debug log
            
            if (!swResponse.ok) {
              const errorMsg = `Service worker file not accessible: ${swResponse.status}`;
              setError(errorMsg);
              logErrorToFirestore('service_worker', errorMsg, { status: swResponse.status });
              console.error(errorMsg);
            }
          } catch (err) {
            const errorMsg = `Error fetching service worker file: ${err}`;
            setError(errorMsg);
            logErrorToFirestore('service_worker', errorMsg, err);
            console.error(errorMsg);
          }
          
          // Initialize Firebase Messaging
          try {
            const messaging = getMessaging();
            console.log('Firebase messaging initialized'); // Debug log
            
            // Request permission if not already granted
            if (Notification.permission !== 'granted') {
              console.log('Requesting notification permission...'); // Debug log
              const permission = await Notification.requestPermission();
              setNotificationPermission(permission);
              console.log('Notification permission response:', permission); // Debug log
              
              if (permission !== 'granted') {
                const errorMsg = 'Notification permission not granted';
                setError(errorMsg);
                logErrorToFirestore('permission', errorMsg, { permission });
                console.error(errorMsg);
                return;
              }
            }
            
            // Check if VAPID key is available
            const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
            console.log('VAPID key available:', !!vapidKey); // Debug log
            
            if (!vapidKey) {
              const errorMsg = 'VAPID key is missing';
              setError(errorMsg);
              logErrorToFirestore('vapid_key', errorMsg);
              console.error(errorMsg);
              return;
            }
            
            // Log VAPID key first few characters for debugging
            console.log('VAPID key starts with:', vapidKey.substring(0, 10) + '...'); // Debug log
            
            // Get token using your VAPID key
            try {
              const token = await getToken(messaging, {
                vapidKey: vapidKey
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
                    try {
                      await setDoc(doc(db, 'fcmTokens', uid), {
                        token: token,
                        timestamp: new Date()
                      });
                      console.log('New FCM token document created successfully'); // Debug log
                    } catch (setDocErr) {
                      const errorMsg = `Error creating FCM token document: ${setDocErr}`;
                      setError(errorMsg);
                      logErrorToFirestore('firestore', errorMsg, setDocErr);
                      console.error(errorMsg);
                    }
                  } else {
                    const errorMsg = `Unexpected error saving FCM token: ${err}`;
                    setError(errorMsg);
                    logErrorToFirestore('firestore', errorMsg, err);
                    console.error(errorMsg);
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
                const errorMsg = 'No registration token available';
                setError(errorMsg);
                logErrorToFirestore('token', errorMsg);
                console.error(errorMsg);
              }
            } catch (tokenErr) {
              const errorMsg = `Error getting FCM token: ${tokenErr}`;
              setError(errorMsg);
              logErrorToFirestore('token', errorMsg, tokenErr);
              console.error(errorMsg);
            }
          } catch (messagingErr) {
            const errorMsg = `Error initializing Firebase messaging: ${messagingErr}`;
            setError(errorMsg);
            logErrorToFirestore('messaging', errorMsg, messagingErr);
            console.error(errorMsg);
          }
        } else {
          const errorMsg = 'This browser does not support notifications or service workers';
          setError(errorMsg);
          logErrorToFirestore('browser_support', errorMsg);
          console.log(errorMsg);
        }
      } catch (error) {
        const errorMsg = `Error setting up FCM: ${error}`;
        setError(errorMsg);
        logErrorToFirestore('setup', errorMsg, error);
        console.error(errorMsg);
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
        try {
          const messaging = getMessaging();
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          
          if (!vapidKey) {
            const errorMsg = 'VAPID key is missing';
            setError(errorMsg);
            logErrorToFirestore('vapid_key', errorMsg);
            console.error(errorMsg);
            return;
          }
          
          const token = await getToken(messaging, {
            vapidKey: vapidKey
          });
          console.log('New FCM token obtained:', token); // Debug log
          setFcmToken(token);
          
          // Save token to database
          if (token) {
            const uid = 'admin';
            console.log('Saving new FCM token to Firestore'); // Debug log
            try {
              await setDoc(doc(db, 'fcmTokens', uid), {
                token: token,
                timestamp: new Date()
              });
              console.log('New FCM token saved successfully'); // Debug log
            } catch (err) {
              const errorMsg = `Error saving FCM token: ${err}`;
              setError(errorMsg);
              logErrorToFirestore('firestore', errorMsg, err);
              console.error(errorMsg);
            }
          }
        } catch (err) {
          const errorMsg = `Error reinitializing FCM: ${err}`;
          setError(errorMsg);
          logErrorToFirestore('reinitialize', errorMsg, err);
          console.error(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Error requesting notification permission: ${error}`;
      setError(errorMsg);
      logErrorToFirestore('permission', errorMsg, error);
      console.error(errorMsg);
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
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p><strong>Error:</strong> {error}</p>
            <p className="text-sm">Check the fcmErrors collection in Firestore for more details.</p>
          </div>
        )}
        
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
