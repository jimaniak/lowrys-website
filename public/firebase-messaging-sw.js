// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY,
  authDomain: self.FIREBASE_AUTH_DOMAIN,
  projectId: self.FIREBASE_PROJECT_ID,
  storageBucket: self.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
  appId: self.FIREBASE_APP_ID
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data,
    actions: [
      {
        action: 'approve',
        title: 'Approve'
      },
      {
        action: 'deny',
        title: 'Deny'
      }
    ]
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Handle action buttons
  if (event.action === 'approve') {
    const requestId = event.notification.data.requestId;
    const url = `/api/approve-resume-request?id=${requestId}`;
    
    fetch(url)
      .then(response => console.log('Approved request:', response))
      .catch(error => console.error('Error approving request:', error));
      
    // Open admin page
    clients.openWindow('/admin');
  } else if (event.action === 'deny') {
    const requestId = event.notification.data.requestId;
    const url = `/api/deny-resume-request?id=${requestId}`;
    
    fetch(url)
      .then(response => console.log('Denied request:', response))
      .catch(error => console.error('Error denying request:', error));
      
    // Open admin page
    clients.openWindow('/admin');
  } else {
    // Default click behavior - open admin page
    clients.openWindow('/admin');
  }
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed:', event);
});
