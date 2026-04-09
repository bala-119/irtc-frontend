import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Ticket, Train, Calendar, User, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { api } from '../config/api';

const PNRStatus = () => {
  const { pnr: urlPnr } = useParams();
  const navigate = useNavigate();
  const [pnrInput, setPnrInput] = useState(urlPnr || '');
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  const fetchPNRStatus = async (pnrToFetch: string) => {
    if (!pnrToFetch) return;
    console.log('Fetching PNR status for:', pnrToFetch);
    setLoading(true);
    setBooking(null);
    try {
      // Use the dedicated PNR status endpoint
      const response = await api.get(`/v1/booking/pnr-status/${pnrToFetch}`);
      console.log('PNR API Response:', response.data);
      if (response.data.success) {
        setBooking(response.data.data);
      } else {
        toast.error('PNR not found');
      }
    } catch (error: any) {
      console.error('PNR Fetch Error:', error);
      toast.error(error.response?.data?.message || 'Error fetching PNR status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlPnr) {
      fetchPNRStatus(urlPnr);
    }
  }, [urlPnr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pnr = pnrInput.trim();
    
    // Basic format validation: allow alphanumeric and hyphens
    const pnrRegex = /^[a-zA-Z0-9-]+$/;
    if (!pnrRegex.test(pnr)) {
      toast.error('Invalid PNR format. Please check your ticket.');
      return;
    }
    
    navigate(`/pnr-status/${pnr}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'WAITING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-8 px-4">
      {/* Search Header */}
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Check PNR Status</h2>
        <p className="text-slate-500 font-medium mb-8">Enter your unique PNR number to get live booking information.</p>
        
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto group">
          <Ticket className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Enter PNR Number (e.g. 12601-1775...)"
            value={pnrInput}
            onChange={(e) => setPnrInput(e.target.value)}
            className="w-full pl-16 pr-32 py-6 rounded-[2rem] bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/50 outline-none focus:border-primary transition-all font-bold text-lg"
          />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-white px-8 py-3.5 rounded-2xl font-black hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search className="w-5 h-5" />}
            Check
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse">Retrieving PNR Data...</p>
        </div>
      )}

      {booking && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Status Badge */}
          <div className="flex justify-center">
            <div className={`px-8 py-3 rounded-full border text-base font-black flex items-center gap-3 shadow-lg ${getStatusColor(booking.booking_status)}`}>
              {booking.booking_status === 'CONFIRMED' ? <CheckCircle2 className="w-5 h-5 transition-transform hover:scale-110" /> : <AlertCircle className="w-5 h-5" />}
              <span className="tracking-widest">{booking.booking_status}</span>
            </div>
          </div>

          {/* Main Ticket Card */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 overflow-hidden border border-slate-100">
            {/* Header info */}
            <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
                  <Train className="w-9 h-9 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{booking.train_name}</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">Train #{booking.train_number}</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span className="text-primary text-xs font-black uppercase">{booking.class_type} CLASS</span>
                  </div>
                </div>
              </div>
              <div className="text-center md:text-right relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">PNR Number</p>
                <p className="text-3xl font-black text-primary tracking-tighter drop-shadow-sm">{booking.pnr}</p>
              </div>
            </div>

            {/* Journey Details */}
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-10 mb-12">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">From Station</p>
                  <p className="text-3xl font-black text-slate-900">
                    {booking.from_station?.name || booking.from_station_name || (typeof booking.from_station === 'string' ? booking.from_station : booking.payment_details?.metadata?.from_station) || 'MAS'}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1 tracking-widest">
                    {booking.from_station?.code || (typeof booking.from_station === 'string' ? booking.from_station : booking.payment_details?.metadata?.from_station) || 'MAS'}
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-full flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full border-[3px] border-primary bg-white shrink-0 shadow-sm"></div>
                    <div className="h-[2px] bg-slate-100 flex-1 relative overflow-hidden rounded-full">
                      <div className="absolute inset-0 bg-primary/30 w-1/3 translate-x-full animate-progress-slow"></div>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-primary shrink-0 shadow-md"></div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-slate-50 px-5 py-2 rounded-full border border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-tighter">
                    {booking.stop_gaps} Stops Between
                  </div>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">To Station</p>
                  <p className="text-3xl font-black text-slate-900">
                    {booking.to_station?.name || booking.to_station_name || (typeof booking.to_station === 'string' ? booking.to_station : booking.payment_details?.metadata?.to_station) || 'SBC'}
                  </p>
                  <p className="text-sm font-bold text-primary mt-1 tracking-widest">
                    {booking.to_station?.code || (typeof booking.to_station === 'string' ? booking.to_station : booking.payment_details?.metadata?.to_station) || 'SBC'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-slate-50">
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all">
                  <Calendar className="w-6 h-6 text-slate-400 mb-3 group-hover:text-primary transition-colors" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Journey Date</p>
                  <p className="text-base font-black text-slate-900">{new Date(booking.journey_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all">
                  <User className="w-6 h-6 text-slate-400 mb-3 group-hover:text-primary transition-colors" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Booking Type</p>
                  <p className="text-base font-black text-slate-900">{booking.booking_type}</p>
                </div>
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all">
                  <Ticket className="w-6 h-6 text-slate-400 mb-3 group-hover:text-emerald-500 transition-colors" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Payment Status</p>
                  <p className={`text-base font-black ${booking.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-500'}`}>{booking.payment_status}</p>
                </div>
                <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all">
                  <Clock className="w-6 h-6 text-slate-400 mb-3 group-hover:text-primary transition-colors" />
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Confirmed At</p>
                  <p className="text-base font-black text-slate-900">{booking.confirmed_at ? new Date(booking.confirmed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fare & Transaction Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-5 bg-slate-50 border-b border-slate-100">
                  <h4 className="font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase text-sm">
                    Fare Breakdown
                  </h4>
                </div>
                <div className="p-8 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">Fare per Passenger</span>
                      <span className="font-black text-slate-900">₹{booking.fare_per_passenger}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-bold">Passenger Count</span>
                      <span className="font-black text-slate-900">× {booking.passengers?.length || 0}</span>
                   </div>
                   <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-slate-900 font-black">Total Fare Paid</span>
                      <span className="text-2xl font-black text-emerald-600">₹{booking.total_fare}</span>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-8 py-5 bg-slate-50 border-b border-slate-100">
                  <h4 className="font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase text-sm">
                    Transaction Info
                  </h4>
                </div>
                <div className="p-8 space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Payment ID</span>
                      <span className="font-black text-slate-900 tabular-nums">{booking.payment_details?.payment_id || 'N/A'}</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</span>
                      <span className="text-[11px] font-bold text-slate-600 break-all bg-slate-50 p-2 rounded-lg border border-slate-100">{booking.payment_details?.transaction_id || 'N/A'}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Method</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-black text-[10px] uppercase text-slate-700">{booking.payment_details?.payment_method || 'CARD'}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Passenger Details */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            <div className="px-10 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-black text-slate-900 tracking-tight flex items-center gap-3 text-lg">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <User className="w-5 h-5" />
                </div>
                Passenger Information
              </h4>
              <span className="text-[10px] font-black bg-primary text-white px-3 py-1 rounded-full uppercase tracking-tighter">
                {booking.passengers?.length} Passenger(s)
              </span>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seat Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {booking.passengers?.map((p: any, idx: number) => {
                    const seat = booking.seat_details?.[idx];
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-10 py-8">
                          <p className="font-black text-slate-900 text-lg group-hover:text-primary transition-colors">
                            {p.name || `Passenger ${idx + 1}`}
                          </p>
                          <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-tight">{p.age} Years • {p.gender}</p>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex flex-col gap-1.5">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border text-center ${getStatusColor(booking.booking_status)} shadow-sm`}>
                                 {booking.booking_status}
                              </span>
                              {booking.waiting_number > 0 && (
                                <span className="text-[10px] font-bold text-amber-500 text-center uppercase tracking-tighter">
                                  WL-{booking.waiting_number}
                                </span>
                              )}
                           </div>
                        </td>
                        <td className="px-10 py-8">
                          {seat ? (
                            <div className="relative inline-block">
                              <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl shadow-slate-900/10">
                                <div className="text-center">
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Coach</p>
                                   <p className="text-lg font-black leading-none">{seat.coach}</p>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10"></div>
                                <div className="text-center">
                                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Berth</p>
                                   <p className="text-lg font-black leading-none">{seat.seat_number}</p>
                                </div>
                              </div>
                              <div className="mt-2 text-[10px] font-black text-primary text-center tracking-widest uppercase">
                                {seat.position?.replace('_', ' ')}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-slate-400 font-bold text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              To be assigned on chart prep
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  }) || (
                    <tr>
                      <td colSpan={3} className="px-10 py-16 text-center">
                        <Loader2 className="w-10 h-10 text-slate-100 mx-auto animate-spin mb-4" />
                        <p className="text-slate-500 font-bold">No passenger information found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Footer Note */}
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">
            PNR generated at {new Date(booking.createdAt).toLocaleString()} • Last Updated {new Date(booking.updatedAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default PNRStatus;
