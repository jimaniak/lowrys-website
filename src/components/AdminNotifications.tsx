// src/components/AdminNotifications.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function AdminNotifications() {
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenSaved, setTokenSaved] = useState<boolean>(false);

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

  // Function to register the service worker
  const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        console.log('Registering service worker...');
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        console.log('Service Worker registered with scope:', registration.scope);
        return registration;
      } else {
        throw new Error('Service workers not supported');
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      await logErrorToFirestore('service_worker_registration', 'Service Worker registration failed', error);
      throw error;
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

    console.log('AdminNotifications component mounted');

    // Set initial permission state
    setNotificationPermission(Notification.permission);
    console.log('Initial notification permission:', Notification.permission);

    // Set up FCM
    const setupFCM = async () => {
      try {
        console.log('Setting up Firebase Cloud Messaging...');

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          console.log('Service Worker is supported by this browser');

          // Register service worker explicitly
          try {
            const registration = await registerServiceWorker();
            console.log('Service Worker registration successful:', registration);
          } catch (err) {
            const errorMsg = `Error registering service worker: ${err}`;
            setError(errorMsg);
            logErrorToFirestore('service_worker', errorMsg, err);
            console.error(errorMsg);
          }

          // Check if firebase-messaging-sw.js is accessible
          try {
            const swResponse = await fetch('/firebase-messaging-sw.js');
            console.log('Service Worker fetch response:', swResponse.status);

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
            console.log('Firebase messaging initialized');

            // Request permission if not already granted
            if (Notification.permission !== 'granted') {
              console.log('Requesting notification permission...');
              const permission = await Notification.requestPermission();
              setNotificationPermission(permission);
              console.log('Notification permission response:', permission);

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
            console.log('VAPID key available:', !!vapidKey);

            if (!vapidKey) {
              const errorMsg = 'VAPID key is missing';
              setError(errorMsg);
              logErrorToFirestore('vapid_key', errorMsg);
              console.error(errorMsg);
              return;
            }

            console.log('VAPID key starts with:', vapidKey.substring(0, 10) + '...');

            // Get token using your VAPID key and the registered service worker
            try {
              const swRegistration = await navigator.serviceWorker.ready;
              console.log('Service worker ready:', swRegistration);

              const token = await getToken(messaging, {
                vapidKey: vapidKey,
                serviceWorkerRegistration: swRegistration
              });

              if (token) {
                console.log('FCM token obtained:', token);
                setFcmToken(token);

                // Save token to your database
                const uid = 'admin'; // Or get actual user ID if you have authentication
                const tokenRef = doc(db, 'fcmTokens', uid);
                console.log('Saving FCM token to Firestore for uid:', uid);

                try {
                  await updateDoc(tokenRef, {
                    token: token,
                    device: navigator.userAgent,
                    timestamp: new Date()
                  });
                  console.log('FCM token document updated successfully');
                  setTokenSaved(true);
                } catch (err: any) {
                  console.log('Error updating FCM token document:', err.code);

                  if (err.code === 'not-found') {
                    console.log('FCM token document not found, creating new document');
                    try {
                      await setDoc(doc(db, 'fcmTokens', uid), {
                        token: token,
                        device: navigator.userAgent,
                        timestamp: new Date()
                      });
                      console.log('New FCM token document created successfully');
                      setTokenSaved(true);
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
                console.log('Setting up foreground message handler');
                onMessage(messaging, (payload) => {
                  console.log('Received foreground message:', payload);

                  if (payload.notification) {
                    const { title, body } = payload.notification;
                    console.log('Creating notification with title:', title, 'and body:', body);

                    new Notification(title || 'New Notification', {
                      body: body || 'You have a new notification'
                    });

                    console.log('Custom notification displayed');
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
      console.log('Manually requesting notification permission...');
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      console.log('Manual permission request response:', permission);

      if (permission === 'granted') {
        console.log('Permission granted, re-initializing FCM');

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

          const registration = await registerServiceWorker();

          const token = await getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration
          });
          console.log('New FCM token obtained:', token);
          setFcmToken(token);

          if (token) {
            const uid = 'admin';
            console.log('Saving new FCM token to Firestore');
            try {
              await setDoc(doc(db, 'fcmTokens', uid), {
                token: token,
                device: navigator.userAgent,
                timestamp: new Date()
              });
              console.log('New FCM token saved successfully');
              setTokenSaved(true);
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

  // Function to test notifications
  const testNotification = () => {
    try {
      new Notification('Test Notification', {
        body: 'This is a test notification to verify your browser settings',
        icon: '/favicon.ico'
      });
    } catch (error) {
      console.error('Error creating test notification:', error);
      setError(`Error creating test notification: ${error instanceof Error ? error.message : String(error)}`);
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

        {tokenSaved && (
          <p className="text-green-600 mb-2">
            ✓ FCM token successfully registered and saved to Firestore
          </p>
        )}

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
          <>
            <p className="text-green-600 mb-4">
              You will receive real-time notifications when new resume requests are submitted.
            </p>

            <button
              onClick={testNotification}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 mr-2"
            >
              Test Notification
            </button>

            {!tokenSaved && (
              <button
                onClick={requestPermission}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Retry Token Registration
              </button>
            )}
          </>
        )}

        {fcmToken && (
          <p className="mt-2 text-sm text-gray-600">
            Device registered for notifications
          </p>
        )}
      </div>

      <div className="text-sm text-gray-600 mt-4">
        <p>Troubleshooting:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Make sure you're using Chrome browser</li>
          <li>Check that notifications are enabled in your browser settings</li>
          <li>If issues persist, try clearing your browser cache and cookies</li>
        </ul>
      </div>
    </div>
  );
}