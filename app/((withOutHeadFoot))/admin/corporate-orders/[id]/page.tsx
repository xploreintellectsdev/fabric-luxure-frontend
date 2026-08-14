"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Building, Calendar, CheckCircle } from 'lucide-react';
import { showAlert } from '../../../../../utils/modalUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminCorporateOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiryDetails = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${API_URL}/api/admin/corporate-orders/${params?.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setEnquiry(data.data);
        } else {
          showAlert('error', 'Error', data.error || 'Failed to fetch details.');
          router.push('/admin/corporate-orders');
        }
      } catch (error) {
        console.error(error);
        showAlert('error', 'Error', 'Network error while fetching details.');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchEnquiryDetails();
    }
  }, [params?.id, router]);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!enquiry) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin/corporate-orders')}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-[#D4AF37]">Enquiry #{enquiry.id}</h1>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            enquiry.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
            enquiry.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-700' :
            enquiry.status === 'QUOTATION_SENT' ? 'bg-purple-100 text-purple-700' :
            'bg-green-100 text-green-700'
          }`}>
            {enquiry.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Message Content</h2>
            <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap font-medium">
              {enquiry.message}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Sender Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex items-start gap-3">
                <User className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{enquiry.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="font-medium text-gray-900">{enquiry.company_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <a href={`mailto:${enquiry.email}`} className="font-medium text-indigo-600 hover:underline">{enquiry.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="text-gray-400 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <a href={`tel:${enquiry.mobile}`} className="font-medium text-indigo-600 hover:underline">{enquiry.mobile}</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status & Meta */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 pb-2 border-b">Enquiry Meta</h2>
            
            <div className="flex items-center gap-3">
              <Calendar className="text-gray-400" size={16} />
              <div>
                <p className="text-xs text-gray-500">Submitted On</p>
                <p className="text-sm font-medium text-gray-900">{new Date(enquiry.created_at).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="text-gray-400" size={16} />
              <div>
                <p className="text-xs text-gray-500">Customer Type</p>
                <p className="text-sm font-medium text-gray-900">{enquiry.user_id ? 'Registered User' : 'Guest User'}</p>
              </div>
            </div>
            
            {enquiry.user_id && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <Link href={`/admin/users?search=${enquiry.email}`}>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium w-full text-left">
                    View User Profile &rarr;
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
