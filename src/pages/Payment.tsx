import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreditCard, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../config/api';

const Payment = () => {
  const { pnr } = useParams<{ pnr: string }>();
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<any>(() => {
    const storedName = localStorage.getItem('checkout_train_name');
    const storedPnr = localStorage.getItem('checkout_pnr') || pnr; // Use PNR from URL as fallback
    
    if (storedName || localStorage.getItem('checkout_total_amount')) {
      return {
        pnr: storedPnr,
        train_name: storedName || 'Train',
        train_number: localStorage.getItem('checkout_train_number') || '',
        total_fare: localStorage.getItem('checkout_total_amount') || '0',
        from_station: localStorage.getItem('checkout_from') || '',
        to_station: localStorage.getItem('checkout_to') || '',
        journey_date: localStorage.getItem('checkout_date') || new Date().toISOString(),
        class_type: localStorage.getItem('checkout_class_type') || '',
        passengers: new Array(parseInt(localStorage.getItem('checkout_passengers_count') || '1')).fill({})
      };
    }
    return null;
  });

  useEffect(() => {
    if (pnr) {
      fetchBookingDetails();
    }
  }, [pnr]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/v1/booking/with-payment/${pnr}`);
      if (response.data.success && response.data.data) {
        setBooking(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      // If API fails, we still have the localStorage data as a fallback
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post('/v1/payment/create-checkout-session', {
        pnr,
        metadata: {
          source: 'react_frontend'
        }
      });
      
      if (response.data?.success && response.data?.data?.session_url) {
        toast.success('Redirecting to secure gateway...');
        window.location.href = response.data.data.session_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Payment initiation failed';
      toast.error(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Preparing your payment details...</p>
      </div>
    );
  }

  const passengersCount = booking.passengers?.length || parseInt(localStorage.getItem('checkout_passengers_count') || '0');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Checkout</h2>
        <p className="text-slate-500 font-medium">PNR: <span className="text-blue-600 font-bold">{pnr}</span></p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        {/* Booking Summary */}
        <div className="md:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex justify-between items-start border-b border-slate-50 pb-6">
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Train</p>
               <h3 className="text-xl font-bold text-slate-800">{booking.train_name}</h3>
               <p className="text-sm text-slate-500 font-medium">#{booking.train_number} • {booking.class_type}</p>
             </div>
             <div className="text-right">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Journey Date</p>
               <p className="font-bold text-slate-800">
                 {booking.journey_date && !isNaN(Date.parse(booking.journey_date)) 
                   ? new Date(booking.journey_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                   : 'Date TBD'}
               </p>
             </div>
          </div>

          <div className="flex items-center justify-between py-2 text-slate-700">
            <div className="text-center">
              <p className="text-lg font-black">{booking.from_station || 'Source'}</p>
              <p className="text-xs text-slate-400 font-bold uppercase">Source</p>
            </div>
            <div className="flex-1 px-8 flex flex-col items-center">
              <div className="w-full h-px bg-slate-100 relative">
                <ArrowRight className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-black">{booking.to_station || 'Destination'}</p>
              <p className="text-xs text-slate-400 font-bold uppercase">Destination</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pricing Details</p>
             <div className="flex justify-between text-sm">
               <span className="text-slate-600">Base Fare ({passengersCount} {passengersCount === 1 ? 'Passenger' : 'Passengers'})</span>
               <span className="font-bold text-slate-800">₹{booking.total_fare}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-600">Service Charges</span>
               <span className="font-bold text-emerald-600">₹0.00</span>
             </div>
             <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
               <span className="text-lg font-bold text-slate-800">Total Amount</span>
               <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{booking.total_fare}</span>
             </div>
          </div>
        </div>

        {/* Payment Action */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
             
             <div className="flex items-center space-x-3 mb-4">
               <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                 <ShieldCheck className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Security</p>
                 <p className="font-bold text-sm">100% Protected</p>
               </div>
             </div>

             <h3 className="text-xl font-bold mb-2">Confirm Payment</h3>
             <p className="text-sm text-white/60 mb-8 leading-relaxed">
               Clicking the button will open our secure Stripe gateway to complete your transaction safely.
             </p>

             <button
               onClick={handleCheckout}
               disabled={loading}
               className="w-full bg-primary hover:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
             >
               {loading ? (
                 <Loader2 className="w-6 h-6 animate-spin" />
               ) : (
                 <>
                  <span>Pay Now</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                 </>
               )}
             </button>
             
             <div className="flex items-center justify-center space-x-6 pt-4 border-t border-white/10 opacity-50 grayscale transition-all hover:grayscale-0">
               <CreditCard className="w-8 h-8" />
               <div className="w-8 h-8 font-black flex items-center">VISA</div>
               <div className="w-8 h-8 font-black flex items-center">UPI</div>
             </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
             <p className="text-xs text-blue-700 leading-relaxed font-medium">
               <strong>Note:</strong> Your seats are held for 15 minutes. Please complete payment within this window to avoid automatic cancellation.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
