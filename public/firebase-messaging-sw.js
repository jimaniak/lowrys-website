// Import and initialize the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js' );
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js' );

// Your Firebase configuration - must match client config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "lowrys-resume-access.firebaseapp.com",
  projectId: "lowrys-resume-access",
  storageBucket: "lowrys-resume-access.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon/android-chrome-192x192.png', // Reuse your existing favicon
    data: payload.data,
    actions: [
      {
        action: 'open_admin',
        title: 'View Request'
      }
    ]
  };
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open_admin') {
    // Open the admin page
    clients.openWindow('/admin');
  } else {
    // Default action - open the admin page
    clients.openWindow('/admin');
  }
});
