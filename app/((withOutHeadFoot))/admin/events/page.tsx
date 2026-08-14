"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Power, Image as ImageIcon, Video, Eye, X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface EventData {
  event_id: number;
  order_no: number;
  event_date: string;
  event_title: string;
  media_type: "Image" | "Video";
  event_media: string;
  short_description: string;
  is_active: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm();
  const mediaType = watch("media_type");
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/events?search=${searchQuery}&status=${statusFilter}&page=${currentPage}&limit=${itemsPerPage}`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setEvents(resData.data);
        setTotalItems(resData.total);
        setTotalPages(Math.ceil(resData.total / itemsPerPage));
      } else {
        toast.error("Failed to load events");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, statusFilter, currentPage]);

  const handleOpenAddForm = () => {
    setSelectedEvent(null);
    reset({
      order_no: "",
      event_date: "",
      event_title: "",
      media_type: "Image",
      short_description: "",
      is_active: true
    });
    setPreviewMedia(null);
    setSelectedFile(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditForm = (evt: EventData) => {
    setSelectedEvent(evt);
    const dateStr = new Date(evt.event_date).toISOString().split('T')[0];
    reset({
      order_no: evt.order_no,
      event_date: dateStr,
      event_title: evt.event_title,
      media_type: evt.media_type,
      short_description: evt.short_description,
      is_active: evt.is_active === 1
    });
    setPreviewMedia(`${API_URL}${evt.event_media}`);
    setSelectedFile(null);
    setIsFormModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewMedia(URL.createObjectURL(file));
    }
  };

  const onSubmitForm = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("order_no", data.order_no);
      formData.append("event_date", data.event_date);
      formData.append("event_title", data.event_title);
      formData.append("media_type", data.media_type);
      formData.append("short_description", data.short_description);
      formData.append("is_active", data.is_active ? "1" : "0");

      if (selectedFile) {
        formData.append("event_media", selectedFile);
      } else if (!selectedEvent) {
        toast.error("Event media is required");
        return;
      }

      const url = selectedEvent ? `${API_URL}/api/admin/events/${selectedEvent.event_id}` : `${API_URL}/api/admin/events`;
      const method = selectedEvent ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(selectedEvent ? "Event updated" : "Event created");
        setIsFormModalOpen(false);
        fetchEvents();
      } else {
        toast.error(resData.error || "Failed to save event");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  const handleToggleStatus = async (evt: EventData) => {
    try {
      const formData = new FormData();
      formData.append("order_no", String(evt.order_no));
      formData.append("event_date", new Date(evt.event_date).toISOString().split('T')[0]);
      formData.append("event_title", evt.event_title);
      formData.append("media_type", evt.media_type);
      formData.append("short_description", evt.short_description);
      formData.append("is_active", evt.is_active === 1 ? "0" : "1");

      const res = await fetch(`${API_URL}/api/admin/events/${evt.event_id}`, {
        method: "PUT",
        body: formData
      });
      if (res.ok) {
        toast.success(`Event ${evt.is_active === 1 ? 'disabled' : 'enabled'}`);
        fetchEvents();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const confirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/events/${selectedEvent.event_id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Event deleted");
        setIsDeleteModalOpen(false);
        fetchEvents();
      } else {
        toast.error("Failed to delete event");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fade-in text-white w-full">
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#102554] p-6 rounded-xl border border-[#081A42]/50 text-left mb-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-instrumentserif text-3xl font-normal uppercase tracking-wider text-white">
            Events Management
          </h2>
          <p className="text-[14px] text-[#D3D3D3]/80">Manage company exhibitions, launches, campaigns and other events displayed on the website.</p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 bg-bg-blue hover:bg-bg-blue/80 border border-bg-blue/50 text-white px-5 py-2.5 rounded-full text-[14px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-[#081A42] rounded-xl border border-[#102554] shadow-2xl relative overflow-hidden">
        <div className="shrink-0 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-[#102554] bg-[#0A1D4A]">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by event name..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#081A42] border border-[#102554] rounded-lg py-2 pl-10 pr-4 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-[#081A42] border border-[#102554] rounded-lg py-2 px-4 text-[14px] text-white focus:outline-none focus:border-[#D4AF37] transition-all"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-[#102554] border-t border-[#081A42]/50 text-white min-h-0">
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#081A42] z-10 shadow-sm border-b border-[#102554]">
                <tr>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Order No</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Date</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Event Name</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Media</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37]">Status</th>
                  <th className="p-4 text-[14px] uppercase font-mono tracking-wider text-[#D4AF37] text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#081A42]/30 text-[15px] text-[#D3D3D3]">
                {events.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-[#D3D3D3]/50">No events found.</td></tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.event_id} className={`hover:bg-[#081A42]/10 transition-colors ${evt.is_active === 0 ? 'opacity-60' : ''}`}>
                      <td className="p-4">{evt.order_no}</td>
                      <td className="p-4">{new Date(evt.event_date).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-white">{evt.event_title}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {evt.media_type === "Image" ? <ImageIcon className="w-4 h-4 text-emerald-400" /> : <Video className="w-4 h-4 text-blue-400" />}
                          <span className="text-[12px] uppercase">{evt.media_type}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {evt.is_active === 1 ? (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-red-500/20 text-red-400 border border-red-500/30">Inactive</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { setSelectedEvent(evt); setIsViewModalOpen(true); }} className="p-1.5 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10 rounded text-blue-400 transition-all cursor-pointer"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleOpenEditForm(evt)} className="p-1.5 border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-500/10 rounded text-yellow-400 transition-all cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleToggleStatus(evt)} className={`p-1.5 border rounded transition-all cursor-pointer ${evt.is_active === 0 ? "border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400" : "border-gray-500/20 hover:bg-gray-500/10 text-gray-400"}`}><Power className="w-4 h-4" /></button>
                          <button onClick={() => { setSelectedEvent(evt); setIsDeleteModalOpen(true); }} className="p-1.5 border border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 rounded text-red-400 transition-all cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-2xl w-full shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsFormModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37] mb-6">{selectedEvent ? "Edit Event" : "Add Event"}</h3>
          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">Order No *</label>
                <input type="number" {...register("order_no", { required: true })} className="w-full bg-[#102554] border border-[#081A42]/50 rounded p-2 text-white outline-none" />
              </div>
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">Date *</label>
                <input type="date" {...register("event_date", { required: true })} className="w-full bg-[#102554] border border-[#081A42]/50 rounded p-2 text-white outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">Event Title *</label>
              <input type="text" {...register("event_title", { required: true })} className="w-full bg-[#102554] border border-[#081A42]/50 rounded p-2 text-white outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">Media Type *</label>
                <select {...register("media_type")} className="w-full bg-[#102554] border border-[#081A42]/50 rounded p-2 text-white outline-none">
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">Event Media {selectedEvent ? "" : "*"}</label>
                <input type="file" accept={mediaType === "Image" ? "image/*" : "video/*"} onChange={handleFileChange} className="w-full bg-[#102554] border border-[#081A42]/50 rounded p-1.5 text-white outline-none text-sm" />
              </div>
            </div>
            {previewMedia && (
              <div className="w-full h-32 relative rounded overflow-hidden border border-[#D4AF37]/30 bg-black">
                {mediaType === "Image" ? (
                  <img src={previewMedia} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={previewMedia} className="w-full h-full object-cover" controls />
                )}
              </div>
            )}
            <div>
              <label className="block text-[13px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">Short Description *</label>
              <textarea {...register("short_description", { required: true, maxLength: 500 })} rows={4} className="w-full bg-[#102554] border border-[#081A42]/50 rounded p-2 text-white outline-none" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" {...register("is_active")} id="activeStatus" className="w-4 h-4" />
              <label htmlFor="activeStatus" className="text-white text-sm">Active</label>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
              <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-6 py-2 rounded-full border border-white/20 text-white uppercase text-sm font-bold tracking-wider hover:bg-white/5 transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-full bg-[#D4AF37] text-[#102554] uppercase text-sm font-bold tracking-wider hover:bg-[#D4AF37]/90 transition-colors">Save Event</button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-6 text-center text-white">
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-red-500">Delete Event?</h3>
            <p className="text-[15px] text-[#D3D3D3]/80 leading-relaxed">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setIsDeleteModalOpen(false)} className="border border-[#102554] text-white hover:bg-white/5 font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-full text-[14px] uppercase tracking-wider transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-[#102554] border border-[#D4AF37]/30 rounded-2xl p-6 max-w-2xl w-full shadow-2xl text-white relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            <h3 className="font-instrumentserif text-2xl uppercase tracking-wider text-[#D4AF37] mb-4">View Event</h3>
          <div className="space-y-4">
            <div className="w-full h-64 relative rounded-xl overflow-hidden bg-black border border-white/10">
              {selectedEvent.media_type === "Image" ? (
                <img src={`${API_URL}${selectedEvent.event_media}`} alt="Event" className="w-full h-full object-cover" />
              ) : (
                <video src={`${API_URL}${selectedEvent.event_media}`} className="w-full h-full object-cover" controls />
              )}
            </div>
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-[#D4AF37] uppercase">{selectedEvent.event_title}</h3>
              <span className="text-sm text-gray-400">{new Date(selectedEvent.event_date).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedEvent.short_description}</p>
            <div className="pt-2">
              {selectedEvent.is_active === 1 ? (
                <span className="px-3 py-1 text-xs uppercase font-bold tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
              ) : (
                <span className="px-3 py-1 text-xs uppercase font-bold tracking-wider rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Inactive</span>
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
