// src/app/admin/page.tsx
'use client';

import React from 'react';
import Layout from '../../components/Layout';
import AdminNotifications from '../../components/AdminNotifications';
import PendingRequestsTable from '../../components/PendingRequestsTable';

export default function AdminPage() {
  return (
    <Layout>
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Resume Access Admin</h1>
          <p className="text-xl max-w-3xl leading-relaxed">
            Manage resume access requests and receive real-time notifications.
          </p>
        </div>
      </section>
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Pending Requests Table */}
          <PendingRequestsTable />
          
          {/* Notifications Component */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h2>
          <AdminNotifications />
        </div>
      </section>
    </Layout>
  );
}
