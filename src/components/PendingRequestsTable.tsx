// src/components/PendingRequestsTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { FaCheck, FaTimes, FaFilter, FaSpinner } from 'react-icons/fa';
import { db } from '@/lib/firebase-client';

interface Request {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: string;
  category: string;
  timestamp: any;
}

export default function PendingRequestsTable() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Categories for the filter dropdown
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'resume', label: 'Resume' },
    { value: 'free_item', label: 'Free Item' },
    { value: 'portfolio', label: 'Portfolio' }
  ];

  // Statuses for the filter dropdown
  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' },
    { value: 'used', label: 'Used' },
    { value: 'expired', label: 'Expired' }
  ];

  // Function to fetch requests from Firestore (client-side filtering)
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'resumeRequests'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      let requestsData: Request[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requestsData.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          message: data.message || '',
          status: data.status || 'pending',
          category: data.category || 'resume', // Default to 'resume' for backward compatibility
          timestamp: data.timestamp || data.createdAt || null
        });
      });

      // Filter by status and category on the client side
      if (statusFilter !== 'all') {
        requestsData = requestsData.filter(r => r.status === statusFilter);
      }
      if (categoryFilter !== 'all') {
        requestsData = requestsData.filter(r => (r.category === categoryFilter || (!r.category && categoryFilter === 'resume')));
      }

      setRequests(requestsData);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to approve a request
  const approveRequest = async (id: string) => {
    setProcessingId(id);
    try {
      // Call the approve API endpoint
      const response = await fetch(`/api/approve-resume-request?id=${id}`);
      const data = await response.json();
      
      if (data.success) {
        // Refresh the requests list
        fetchRequests();
      } else {
        setError(`Failed to approve request: ${data.message}`);
      }
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Function to deny a request
  const denyRequest = async (id: string) => {
    setProcessingId(id);
    try {
      // Call the deny API endpoint
      const response = await fetch(`/api/deny-resume-request?id=${id}`);
      const data = await response.json();
      
      if (data.success) {
        // Refresh the requests list
        fetchRequests();
      } else {
        setError(`Failed to deny request: ${data.message}`);
      }
    } catch (err) {
      console.error('Error denying request:', err);
      setError('Failed to deny request. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  // Format timestamp to a readable date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      
      // Handle string ISO date
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleString();
      }
      
      // Handle date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }
      
      return 'Invalid date';
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryObj = categories.find(c => c.value === category);
    return categoryObj ? categoryObj.label : category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Fetch requests on component mount and when filters change
  useEffect(() => {
    fetchRequests();
  }, [categoryFilter, statusFilter]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Access Requests</h2>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaFilter className="text-gray-400" />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <FaFilter className="text-gray-400" />
            </div>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchRequests}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-2" /> Loading...
              </span>
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Requests Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Company</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-4 px-4 text-center">
                  <FaSpinner className="animate-spin inline-block mr-2" /> Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 px-4 text-center">
                  No requests found matching the selected filters.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{request.name}</td>
                  <td className="py-3 px-4">{request.email}</td>
                  <td className="py-3 px-4">{request.company}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryDisplayName(request.category)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'denied' ? 'bg-red-100 text-red-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'used' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatDate(request.timestamp)}</td>
                  <td className="py-3 px-4">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveRequest(request.id)}
                          disabled={processingId === request.id}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded focus:outline-none focus:shadow-outline transition duration-150"
                          title="Approve"
                        >
                          {processingId === request.id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaCheck />
                          )}
                        </button>
                        <button
                          onClick={() => denyRequest(request.id)}
                          disabled={processingId === request.id}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded focus:outline-none focus:shadow-outline transition duration-150"
                          title="Deny"
                        >
                          {processingId === request.id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTimes />
                          )}
                        </button>
                      </div>
                    )}
                    {request.status !== 'pending' && (
                      <span className="text-gray-500 italic">No actions available</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}