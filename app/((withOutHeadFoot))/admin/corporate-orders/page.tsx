"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Search, Briefcase, Phone, Mail, User } from 'lucide-react';
import { showAlert } from '../../../../utils/modalUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminCorporateOrdersPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchEnquiries = async (currentPage = 1, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_URL}/api/admin/corporate-orders?page=${currentPage}&limit=10&search=${search}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEnquiries(data.data.enquiries);
        setTotalPages(data.data.pagination.totalPages);
        setTotalRecords(data.data.pagination.total);
        setPage(data.data.pagination.page);
      } else {
        showAlert('error', 'Error', data.error || 'Failed to fetch corporate orders.');
      }
    } catch (error: any) {
      console.error(error);
      showAlert('error', 'Error', 'Failed to fetch corporate orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries(page, searchTerm);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEnquiries(1, searchTerm);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">New</span>;
      case 'CONTACTED':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">Contacted</span>;
      case 'QUOTATION_SENT':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded-full">Quote Sent</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Closed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#D4AF37] tracking-tight flex items-center gap-2">
            <Briefcase className="text-indigo-600" /> Corporate Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage B2B enquiries and corporate orders</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by name, email, company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
            Search
          </button>
        </form>
      </div>

      {/* Main content table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-800">Total Enquiries: {totalRecords}</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID / Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading enquiries...
                    </div>
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No corporate order enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600">#{enquiry.id}</div>
                      <div className="text-xs text-gray-500">{new Date(enquiry.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{enquiry.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Mail size={12}/> {enquiry.email}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={12}/> {enquiry.mobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enquiry.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${enquiry.user_id ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        <User size={12} />
                        {enquiry.user_id ? 'Registered' : 'Guest'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(enquiry.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/corporate-orders/${enquiry.id}`}>
                        <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded transition-colors inline-flex items-center gap-1">
                          <Eye size={16} /> <span className="hidden sm:inline">View</span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span> results
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 border border-indigo-500 bg-indigo-50 text-indigo-700 rounded text-sm font-medium">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
