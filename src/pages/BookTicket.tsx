import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, Train, Calendar, Trash2, Ticket, ChevronRight, Info } from 'lucide-react';
import { api } from '../config/api';

const BookTicket = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const trainName = searchParams.get('train_name') || localStorage.getItem('booking_train_name') || '';
  const perPassengerFare = parseFloat(searchParams.get('fare') || localStorage.getItem('booking_fare') || '0');
  const trainCode = searchParams.get('train_number');
  const fromCode = searchParams.get('from') || localStorage.getItem('booking_from') || '';
  const toCode = searchParams.get('to') || localStorage.getItem('booking_to') || '';
  const dateStr = searchParams.get('date');
  const initialClass = searchParams.get('class') || 'SL';

  const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'MALE' }]);
  const [classType, setClassType] = useState(initialClass);
  const [berthPreference, setBerthPreference] = useState('NO_PREFERENCE');
  const [loading, setLoading] = useState(false);

  const totalAmount = passengers.length * perPassengerFare;

  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      toast.error('Maximum 6 passengers allowed per booking');
      return;
    }
    setPassengers([...passengers, { name: '', age: '', gender: 'MALE' }]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length === 1) return;
    setPassengers(passengers.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const newPass = [...passengers];
    (newPass[index] as any)[field] = value;
    setPassengers(newPass);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Check if all passengers have name and age
    for (let i = 0; i < passengers.length; i++) {
        if (!passengers[i].name.trim() || !passengers[i].age) {
            toast.error(`Please provide Name and Age for Passenger ${i + 1}`);
            return;
        }
    }

    setLoading(true);
    try {
      console.log("SENDING BOOKING PAYLOAD:", {
        train_number: trainCode,
        journey_date: dateStr,
        class_type: classType,
        from_station: fromCode,
        to_station: toCode,
        berth_preference: berthPreference,
        passengers: passengers.map(p => ({
          name: p.name,
          age: parseInt(p.age) || 0,
          gender: p.gender
        }))
      });

      const response = await api.post('/v1/booking/book', {
        train_number: trainCode,
        journey_date: dateStr,
        class_type: classType,
        from_station: fromCode,
        to_station: toCode,
        berth_preference: berthPreference,
        passengers: passengers.map(p => ({
          name: p.name,
          age: parseInt(p.age),
          gender: p.gender
        }))
      });
      
      toast.success(response.data.message || 'Booking successful! Redirecting to payment...');
      
      // Store checkout details in localStorage
      localStorage.setItem('checkout_train_name', trainName);
      localStorage.setItem('checkout_train_number', trainCode || '');
      localStorage.setItem('checkout_total_amount', totalAmount.toString());
      localStorage.setItem('checkout_from', fromCode);
      localStorage.setItem('checkout_to', toCode);
      localStorage.setItem('checkout_date', dateStr || '');
      localStorage.setItem('checkout_passengers_count', passengers.length.toString());
      localStorage.setItem('checkout_class_type', classType);

      if (response.data?.data?.pnr) {
         localStorage.setItem('checkout_pnr', response.data.data.pnr);
         navigate(`/payment/${response.data.data.pnr}`);
      } else {
         navigate('/bookings');
      }
    } catch (error: any) {
      const backendMsg = error.response?.data?.message || 'Booking failed';
      toast.error(backendMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!trainCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Invalid Session</h2>
          <p className="text-slate-500 mb-8">The booking information is missing or the session has expired.</p>
          <button onClick={() => navigate('/search')} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Go to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
          <Ticket className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Review & Book</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Passenger Details
            </h3>

            <div className="space-y-6">
              {passengers.map((p, index) => (
                <div key={index} className="relative group p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-primary/30 transition-all">
                  <div className="absolute -left-3 top-6 w-6 h-6 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {index + 1}
                  </div>
                  
                  {passengers.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemovePassenger(index)}
                      className="absolute -right-2 -top-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-7">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Full Name</label>
                      <input 
                        required 
                        type="text" 
                        placeholder="Ex: Arjun Rajesh" 
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                        value={p.name} 
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)} 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Age</label>
                      <input 
                        required 
                        type="number" 
                        placeholder="Age" 
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium"
                        value={p.age} 
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)} 
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Gender</label>
                      <select 
                        className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm"
                        value={p.gender} 
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="NOT_PREFERRED">Other / Not Specified</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleAddPassenger} 
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all font-bold"
              >
                <UserPlus className="w-5 h-5" />
                Add Another Passenger
              </button>
            </div>
          </div>

          {/* Preferences Box */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
             <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-primary" />
              Travel Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Class Type</label>
                <select 
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-900"
                >
                  <option value="SL">Sleeper (SL)</option>
                  <option value="3AC">3 Tier AC (3A)</option>
                  <option value="2AC">2 Tier AC (2A)</option>
                  <option value="1AC">1st Class AC (1A)</option>
                  <option value="CC">AC Chair Car (CC)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">Berth Preference</label>
                <select 
                  value={berthPreference}
                  onChange={(e) => setBerthPreference(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-900"
                >
                  <option value="NO_PREFERENCE">No Preference</option>
                  <option value="LOWER">Lower Berth</option>
                  <option value="MIDDLE">Middle Berth</option>
                  <option value="UPPER">Upper Berth</option>
                  <option value="SIDE_LOWER">Side Lower</option>
                  <option value="SIDE_UPPER">Side Upper</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden sticky top-24">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Train className="w-5 h-5 text-primary" />
              Trip Overview
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Train / Number</p>
                <p className="text-lg font-extrabold">{trainName} <span className="text-sm font-medium text-slate-400">#{trainCode}</span></p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="w-0.5 h-10 bg-slate-700"></div>
                      <div className="w-2 h-2 border-2 border-primary rounded-full"></div>
                   </div>
                   <div className="space-y-6 flex-1">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Boarding From</p>
                        <p className="font-bold text-sm uppercase">{fromCode}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Arriving At</p>
                        <p className="font-bold text-sm uppercase">{toCode}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <p className="text-xs font-bold">{dateStr?.split('T')[0]}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Passengers</p>
                     <p className="text-sm font-bold">{passengers.length}</p>
                  </div>
                </div>
                
              </div>

              <button 
                onClick={handleBook}
                disabled={loading}
                className="w-full bg-primary hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 disabled:opacity-50 mt-4 h-16 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Continue Booking <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
             <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                <Info className="w-5 h-5" />
             </div>
             <p className="text-xs text-blue-700 leading-relaxed font-medium">
                Please ensure the passenger names match their official ID cards for a smooth journey experience.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTicket;
