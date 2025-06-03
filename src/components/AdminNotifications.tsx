'use client';

import React, { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  setDoc,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db, messaging, getToken, onMessage } from '../lib/firebase-client';
import { MessagePayload } from 'firebase/messaging';
import { Firestore } from 'firebase/firestore';

// TypeScript interfaces
interface ResumeRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  reason: string;
  timestamp: string | { toDate: () => Date };
  status: string;
}

interface NotificationData {
  title: string;
  body: string;
  data?: {
    requestId?: string;
    name?: string;
    email?: string;
    company?: string;
    reason?: string;
    click_action?: string;
  };
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

const AdminNotifications: React.FC = () => {
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Request notification permission and set up FCM
    if (messaging) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          
          // Get FCM token - Add extra null check to satisfy TypeScript
          if (messaging) { // Extra null check for TypeScript
            getToken(messaging, { 
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY 
            })
              .then((token) => {
                if (token) {
                  console.log('FCM Token:', token);
                  setFcmToken(token);
                  saveTokenToDatabase(token);
                }
              })
              .catch((err: Error) => {
                console.error('Failed to get token:', err);
              });
            
            // Handle foreground messages
            const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
              console.log('Message received:', payload);
              if (payload.notification) {
                setNotification({
                  title: payload.notification.title || 'New Notification',
                  body: payload.notification.body || '',
                  data: payload.data
                });
              }
              loadRequests();
            });
            
            return () => unsubscribe();
          }
        }
      });
    }
    
    // Load initial requests
    loadRequests();
  }, []);
  
  const saveTokenToDatabase = async (token: string): Promise<void> => {
    // Save token to Firestore
    try {
      if (!db) {
        console.error('Firestore db is not initialized');
        return;
      }
      
      await setDoc(doc(db, 'fcmTokens', 'admin'), {
        token,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };
  
  const loadRequests = async (): Promise<void> => {
    try {
      if (!db) {
        console.error('Firestore db is not initialized');
        return;
      }
      
      const q = query(
        collection(db, 'resumeRequests'),
        where('status', '==', 'pending'),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const requestsData: ResumeRequest[] = [];
      
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        requestsData.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          reason: data.reason || '',
          timestamp: data.timestamp,
          status: data.status || 'pending'
        });
      });
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };
  
  const approveRequest = async (requestId: string): Promise<void> => {
    try {
      const response = await fetch('/api/approve-resume-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        alert('Request approved! Passcode sent to user.');
        loadRequests();
      } else {
        alert('Error approving request: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error approving request');
    }
  };
  
  const denyRequest = async (requestId: string): Promise<void> => {
    try {
      const response = await fetch('/api/deny-resume-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        alert('Request denied.');
        loadRequests();
      } else {
        alert('Error denying request: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error denying request');
    }
  };
  
  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string | { toDate: () => Date }): string => {
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    } else if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    return 'Unknown date';
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Resume Access Requests</h1>
      
      {fcmToken && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <p>Notifications enabled! Your device is registered to receive alerts.</p>
        </div>
      )}
      
      {notification && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <h3 className="font-bold">{notification.title}</h3>
          <p>{notification.body}</p>
        </div>
      )}
      
      <h2 className="text-xl font-semibold mb-2">Pending Requests</h2>
      
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded p-4">
              <h3 className="font-bold">Request from {request.name}</h3>
              <p><strong>Company:</strong> {request.company}</p>
              <p><strong>Email:</strong> {request.email}</p>
              <p><strong>Reason:</strong> {request.reason}</p>
              <p><strong>Time:</strong> {formatTimestamp(request.timestamp)}</p>
              <div className="mt-2 space-x-2">
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => approveRequest(request.id)}
                >
                  Approve
                </button>
                <button 
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => denyRequest(request.id)}
                >
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
