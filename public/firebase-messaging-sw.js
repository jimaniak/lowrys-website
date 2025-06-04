// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Your Firebase configuration - hardcoded for service worker
const firebaseConfig = {
  apiKey: "AIzaSyA7j1WzBAmFdWaNNavTshMvqctIisvpj94",
  authDomain: "lowrys-resume-access.firebaseapp.com",
  projectId: "lowrys-resume-access",
  storageBucket: "lowrys-resume-access.firebasestorage.app",
  messagingSenderId: "162127606605",
  appId: "1:162127606605:web:213ac1a1a28089ad9a3d04"
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
    data: payload.data
  };
  
  // Add action buttons only if showActions flag is set
  if (payload.data && payload.data.showActions === 'true') {
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
