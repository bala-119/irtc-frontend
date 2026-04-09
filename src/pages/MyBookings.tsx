import { useEffect, useState } from 'react';
import { api } from '../config/api';
import { Ticket, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/v1/booking/my-all-bookings');
      setBookings(response.data.data || []);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelTicket = async (pnr: string) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) return;
    
    try {
      await api.delete(`/v1/booking/cancel-ticket/${pnr}`);
      toast.success('Ticket cancelled successfully');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel ticket');
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-bold text-slate-500">Loading your bookings...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-800 flex items-center mb-8">
        <Ticket className="w-8 h-8 mr-3 text-primary" /> My Bookings
      </h2>

      {bookings.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm">
          <Ticket className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">No bookings yet</h3>
          <p className="text-slate-500">Go to search trains and book your first journey!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-slate-50 border-b border-slate-100">
                <div className="font-bold text-slate-700">PNR: <span className="text-blue-600">{booking.pnr}</span></div>
                <div className="flex space-x-2">
                  {booking.payment_status === 'PAID' && <span className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3 mr-1"/> Paid</span>}
                  {booking.payment_status === 'PENDING' && <span className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold"><Clock className="w-3 h-3 mr-1"/> Unpaid</span>}
                  
                  {booking.booking_status === 'CONFIRMED' && <span className="flex items-center text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold"> Seat Confirmed</span>}
                  {booking.booking_status === 'WAITING' && <span className="flex items-center text-purple-600 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold"> Waiting List</span>}
                  {booking.booking_status === 'CANCELLED' && <span className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold"><XCircle className="w-3 h-3 mr-1"/> Cancelled</span>}
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="col-span-2 space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Journey</p>
                      <p className="font-medium text-slate-800">{booking.from_station} to {booking.to_station}</p>
                      <p className="text-sm text-slate-500 mt-1">{booking.train_name} ({booking.train_number})</p>
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                      <p className="font-medium text-slate-800">{new Date(booking.journey_date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Class</p>
                      <p className="font-medium text-slate-800">{booking.class_type}</p>
                    </div>
                     <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passengers</p>
                      <p className="font-medium text-slate-800">{booking.passenger_count || booking.passengers?.length || 0}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-center space-y-3">
                    <p className="text-3xl font-bold text-slate-900">₹{booking.total_fare}</p>
                    
                    {(booking.booking_status === 'CONFIRMED' || booking.booking_status === 'WAITING') && booking.payment_status === 'PENDING' && (
                       <button 
                         onClick={() => navigate(`/payment/${booking.pnr}`)}
                         className="flex items-center text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold transition-all shadow-md"
                       >
                         <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                       </button>
                    )}

                    {(booking.booking_status === 'CONFIRMED' || booking.booking_status === 'WAITING') && (
                      <button 
                        onClick={() => cancelTicket(booking.pnr)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline mt-2"
                      >
                        Cancel Ticket
                      </button>
                    )}
                  </div>
                </div>

                {/* Passenger and Seat Details */}
                {(booking.passengers && booking.passengers.length > 0) && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-700 mb-4">Passenger Details</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-slate-400 bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 font-medium">Name</th>
                            <th className="px-4 py-2 font-medium">Age</th>
                            <th className="px-4 py-2 font-medium">Gender</th>
                            <th className="px-4 py-2 font-medium">Seat / Berth</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {booking.passengers.map((passenger: any, idx: number) => {
                            const seat = booking.seat_details && booking.seat_details[idx];
                            return (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-slate-700 font-medium">{passenger.name}</td>
                                <td className="px-4 py-3 text-slate-600">{passenger.age}</td>
                                <td className="px-4 py-3 text-slate-600">{passenger.gender}</td>
                                <td className="px-4 py-3 text-slate-900 font-bold">
                                  {seat ? `${seat.coach}-${seat.seat_number} (${seat.position || 'N/A'})` : (booking.booking_status === 'WAITING' ? `WL-${booking.waiting_number + idx}` : 'Not Assigned')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
