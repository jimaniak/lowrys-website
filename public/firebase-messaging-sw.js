// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBGMzxdIJfHEUXHpWS9YYmLGKDkgMHmH-s",
  authDomain: "lowrys-website.firebaseapp.com",
  projectId: "lowrys-website",
  storageBucket: "lowrys-website.appspot.com",
  messagingSenderId: "1004942448336",
  appId: "1:1004942448336:web:a1f0e5e9f0b0f0b0f0b0f0"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Create a set to track already processed request IDs
const processedRequestIds = new Set();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Extract request ID from payload
  const requestId = payload.data?.requestId;
  
  // Check if this is a notification for a request we've already processed
  if (requestId && processedRequestIds.has(requestId)) {
    console.log(`Already processed request ${requestId}, not showing notification with actions`);
    
    // Still show a notification, but without action buttons
    self.registration.showNotification(payload.notification.title, {
      body: payload.notification.body,
      icon: '/favicon.ico'
    });
    
    return;
  }
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico',
    data: payload.data // Store the data for use in the click handler
  };
  
  // Only add actions if this is NOT a confirmation notification
  if (payload.data && payload.data.isConfirmation !== 'true' && payload.data.showActions === 'true') {
    notificationOptions.actions = [
      {
        action: 'approve',
        title: 'Approve'
      },
      {
        action: 'deny',
        title: 'Deny'
      }
    ];
  }
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click ', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data;
  
  notification.close();
  
  if (action === 'approve') {
    const requestId = data.requestId;
    
    // Add this request ID to our processed set to prevent loops
    if (requestId) {
      processedRequestIds.add(requestId);
      console.log(`Marked request ${requestId} as processed`);
    }
    
    const url = `/api/approve-resume-request?id=${requestId}`;
    
    event.waitUntil(
      fetch(url)
        .then(response => console.log('Approved request:', response))
        .catch(error => console.error('Error approving request:', error))
    );
  } else if (action === 'deny') {
    const requestId = data.requestId;
    
    // Add this request ID to our processed set to prevent loops
    if (requestId) {
      processedRequestIds.add(requestId);
      console.log(`Marked request ${requestId} as processed`);
    }
    
    const url = `/api/deny-resume-request?id=${requestId}`;
    
    event.waitUntil(
      fetch(url)
        .then(response => console.log('Denied request:', response))
        .catch(error => console.error('Error denying request:', error))
    );
  } else {
    // Open the admin panel
    const urlToOpen = new URL('/admin', self.location.origin).href;
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If so, focus it
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});
