import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, MapPin, Calendar, TrainFront, ArrowRight, SortAsc, Clock } from 'lucide-react';
import { api, BOOKING_SERVICE_URL } from '../config/api';

const SearchTrains = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: '',
    sortBy: '',
    class: '',
  });
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Store stations in local storage
      localStorage.setItem('last_search_from', formData.source);
      localStorage.setItem('last_search_to', formData.destination);

      // Booking microservice: /v1/booking/schedule/search-trains
      const response = await api.get(`${BOOKING_SERVICE_URL}/v1/booking/schedule/search-trains`, {
        params: {
          from: formData.source,
          to: formData.destination,
          date: formData.date,
          sortBy: formData.sortBy || undefined,
          class: formData.class || undefined,
        }
      });
      setSchedules(response.data.data || []);
      setSearched(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch trains');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (schedule: any, selectedClass?: string) => {
    const fromName = schedule.from_station?.name || "";
    const toName = schedule.to_station?.name || "";
    const fromCode = schedule.from_station?.code || "";
    const toCode = schedule.to_station?.code || "";

    const params = new URLSearchParams({
      train_number: schedule.train_number || '',
      train_name: schedule.train_name || '',
      from: fromName || fromCode,
      to: toName || toCode,
      date: schedule.journey_date?.split('T')[0] || formData.date,
      class: selectedClass || formData.class || Object.keys(schedule.seats || {})[0] || 'SL',
      fare: schedule.seats?.[selectedClass || formData.class || Object.keys(schedule.seats || {})[0] || 'SL']?.price?.toString() || '0'
    });
    
    // Also store in localStorage as requested
    localStorage.setItem('booking_from', fromName || fromCode);
    localStorage.setItem('booking_to', toName || toCode);
    localStorage.setItem('booking_train_name', schedule.train_name || '');
    localStorage.setItem('booking_fare', schedule.seats?.[selectedClass || formData.class || Object.keys(schedule.seats || {})[0] || 'SL']?.price?.toString() || '0');
    
    navigate(`/book?${params.toString()}`);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-2 flex items-center tracking-tight">
            Explore Destinations
          </h2>
          <p className="text-slate-400 mb-10 text-lg font-medium">Find and book your next journey across the nation's rail network.</p>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Chennai Central"
                  className="w-full pl-12 pr-5 py-5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:bg-white focus:text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-semibold"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
              
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Arakkonam Junction"
                  className="w-full pl-12 pr-5 py-5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:bg-white focus:text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-semibold"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
              
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="date"
                  required
                  className="w-full pl-12 pr-5 py-5 rounded-2xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:bg-white focus:text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-semibold [color-scheme:dark] focus:[color-scheme:light]"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
              <div className="md:col-span-4 lg:col-span-3">
                <div className="relative">
                  <SortAsc className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    className="w-full pl-10 pr-5 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 appearance-none focus:bg-white focus:text-slate-900 outline-none transition-all text-sm font-bold cursor-pointer"
                    value={formData.sortBy}
                    onChange={(e) => setFormData({ ...formData, sortBy: e.target.value })}
                  >
                    <option value="">Sort By: Default</option>
                    <option value="departure">Departure Time</option>
                    <option value="arrival">Arrival Time</option>
                    <option value="duration">Shortest Duration</option>
                    <option value="price_low">Lowest Price</option>
                    <option value="availability">Highest Availability</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-4 lg:col-span-3">
                <div className="relative">
                  <TrainFront className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    className="w-full pl-10 pr-5 py-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 appearance-none focus:bg-white focus:text-slate-900 outline-none transition-all text-sm font-bold cursor-pointer"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  >
                    <option value="">All Classes</option>
                    <option value="AC">All AC Classes</option>
                    <option value="1AC">First AC (1A)</option>
                    <option value="2AC">Second AC (2A)</option>
                    <option value="3AC">Third AC (3AC)</option>
                    <option value="SL">Sleeper (SL)</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-4 lg:col-span-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-blue-600 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-xl shadow-primary/20 disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden group"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <>
                      <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Search Trains</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {searched && (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {schedules.length} Trains Available
              </h3>
              <p className="text-slate-500 font-medium text-sm">On {formData.date}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Live Availability
              </div>
            </div>
          </div>
          
          {schedules.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrainFront className="w-12 h-12 text-slate-300" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">No Trains Found</h4>
              <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any trains matching your search criteria for this route and date.</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {schedules.map((schedule, index) => (
                <div key={schedule.train_id || index} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                  
                  {/* Top Bar: Train Info */}
                  <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                        <TrainFront className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-xl font-extrabold text-slate-900 group-hover:text-primary transition-colors">{schedule.train_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold tracking-wider">#{schedule.train_number}</span>
                          <span className="text-slate-400 text-xs font-semibold uppercase">{schedule.running_day || 'RUNS DAILY'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-3 items-center text-center w-full max-w-md">
                      <div>
                        <p className="text-3xl font-black text-slate-900 tabular-nums leading-none mb-1">{schedule.departure_time}</p>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{schedule.from_station?.name || schedule.from_station?.code}</p>
                      </div>
                      <div className="flex flex-col items-center px-4 relative">
                        <div className="absolute inset-0 flex items-center justify-center -top-8">
                           <p className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {schedule.duration_hours}h {schedule.duration_minutes}m
                           </p>
                        </div>
                        <div className="w-full h-[3px] bg-slate-100 rounded-full relative overflow-hidden">
                           <div className="absolute inset-0 bg-primary/20 w-1/2 translate-x-full animate-progress-slow"></div>
                        </div>
                        <div className="mt-2 text-slate-300">
                           <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-slate-900 tabular-nums leading-none mb-1">{schedule.arrival_time}</p>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{schedule.to_station?.name || schedule.to_station?.code}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBook(schedule)}
                      className="hidden md:flex bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
                    >
                      Book Ticket
                    </button>
                  </div>

                  {/* Bottom Bar: Class Availability */}
                  <div className="bg-slate-50/50 p-6 flex flex-wrap gap-4">
                    {Object.entries(schedule.seats || {}).map(([className, data]: [string, any]) => (
                      <div 
                        key={className}
                        onClick={() => handleBook(schedule, className)}
                        className="flex-1 min-w-[140px] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/30 transition-all group/card overflow-hidden relative cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-black text-slate-900">{className}</span>
                          <span className="text-lg font-black text-emerald-600">₹{data.price}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {data.available > 0 ? (
                              <>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Available</span>
                                <span className="text-lg font-black text-emerald-600">{data.available}</span>
                              </>
                            ) : data.waiting_list_count < data.max_waiting ? (
                              <>
                                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">WL {data.waiting_list_count + 1}</span>
                                <span className="text-xs font-bold text-slate-400 mt-1">High Probability</span>
                              </>
                            ) : (
                              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Regret</span>
                            )}
                          </div>
                          <Clock className="w-3 h-3 text-slate-300 group-hover/card:text-primary transition-colors" />
                        </div>
                        
                        {/* Selected indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover/card:scale-x-100 transition-transform origin-left"></div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleBook(schedule)}
                      className="md:hidden w-full mt-2 bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold transition-all shadow-md"
                    >
                      Book Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchTrains;
