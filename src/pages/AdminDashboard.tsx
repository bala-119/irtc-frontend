import React, { useState } from 'react';
import { api, TRAIN_SERVICE_URL, BOOKING_SERVICE_URL } from '../config/api';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Plus, Save, Upload, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'train' | 'schedule' | 'station'>('train');
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<any[]>([]);
  const [isBulkEditorOpen, setIsBulkEditorOpen] = useState(false);
  const [bulkJson, setBulkJson] = useState(`[
  {
    "station_code": "AJJ",
    "station_name": "Arakkonam Junction",
    "city": "Arakkonam",
    "state": "Tamil Nadu"
  },
  {
    "station_code": "KPD",
    "station_name": "Katpadi Junction",
    "city": "Vellore",
    "state": "Tamil Nadu"
  },
  {
    "station_code": "JTJ",
    "station_name": "Jolarpettai Junction",
    "city": "Tirupathur",
    "state": "Tamil Nadu"
  }
]`);

  const fetchStations = async () => {
    try {
      const response = await api.get(`${TRAIN_SERVICE_URL}/stations/`);
      if (response.data.success) {
        setStations(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stations', error);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'station') {
      fetchStations();
    }
  }, [activeTab]);

  // Train Creation State
  const [trainData, setTrainData] = useState({
    train_number: '12601',
    train_name: 'CHENNAI MAIL',
    route: [
      { station_code: 'MAS', departure_time: '20:00' },
      { station_code: 'AJJ', arrival_time: '21:15', departure_time: '21:17' },
      { station_code: 'KPD', arrival_time: '22:30', departure_time: '22:32' },
      { station_code: 'JTJ', arrival_time: '23:45', departure_time: '23:47' },
      { station_code: 'SBC', arrival_time: '04:30' }
    ],
    coaches: [
      { coach_id: 'S1', coach_type: 'SL', total_seats: 72 },
      { coach_id: 'S2', coach_type: 'SL', total_seats: 72 },
      { coach_id: 'A1', coach_type: '3AC', total_seats: 64 },
      { coach_id: 'A2', coach_type: '2AC', total_seats: 52 },
      { coach_id: 'H1', coach_type: '1AC', total_seats: 5 }
    ],
    class_pricing: {
      SL: 500,
      '3AC': 1200,
      '2AC': 1800,
      '1AC': 2500
    }
  });

  // Scheduling State
  const [scheduleData, setScheduleData] = useState({
    train_number: '12601',
    days: 30,
    running_days: ['MON', 'WED', 'FRI', 'SUN']
  });

  const handleRouteUpdate = (index: number, field: string, value: string) => {
    const newRoute = [...trainData.route];
    (newRoute[index] as any)[field] = value;
    setTrainData({ ...trainData, route: newRoute });
  };

  const addStation = () => {
    setTrainData({
      ...trainData,
      route: [...trainData.route, { station_code: '', arrival_time: '', departure_time: '' }]
    });
  };

  const removeStation = (index: number) => {
    if (trainData.route.length <= 2) return;
    setTrainData({
      ...trainData,
      route: trainData.route.filter((_, i) => i !== index)
    });
  };

  const handleCreateTrain = async () => {
    setLoading(true);
    try {
      await api.post(`${TRAIN_SERVICE_URL}/train/create-train`, trainData);
      toast.success('Train created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create train');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStations = async () => {
    setLoading(true);
    try {
      let payload = null;
      try {
        payload = JSON.parse(bulkJson);
      } catch (e) {
        toast.error('Invalid JSON format');
        setLoading(false);
        return;
      }

      await api.post(`${TRAIN_SERVICE_URL}/stations/bulk`, payload);
      toast.success('Stations imported successfully');
      setIsBulkEditorOpen(false);
      fetchStations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to bulk upload stations');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    setLoading(true);
    try {
      await api.post(`${BOOKING_SERVICE_URL}/v1/booking/schedule/generate`, scheduleData);
      toast.success('Schedules generated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate schedules');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800">Admin Control Panel</h2>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('train')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'train' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
          >
            Create Train
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'schedule' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
          >
            Schedules
          </button>
          <button
            onClick={() => setActiveTab('station')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'station' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
          >
            Stations
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'train' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Create New Train
                </h3>
                <button 
                  onClick={addStation}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                >
                  + Add Stop
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Train Number</label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10"
                    value={trainData.train_number}
                    onChange={(e) => setTrainData({ ...trainData, train_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Train Name</label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10"
                    value={trainData.train_name}
                    onChange={(e) => setTrainData({ ...trainData, train_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <h4 className="font-bold text-sm mb-4">Route Configuration</h4>
                <div className="space-y-3">
                  {trainData.route.map((r, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl group relative border border-transparent hover:border-slate-200 transition-all">
                      <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center font-black text-[10px] text-slate-400">
                        {i + 1}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <div>
                          <input 
                            className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-sm"
                            value={r.station_code}
                            placeholder="STN CODE"
                            onChange={(e) => handleRouteUpdate(i, 'station_code', e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-black text-slate-400">Arr</span>
                            <input 
                              disabled={i === 0}
                              className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-xs disabled:opacity-30"
                              value={i === 0 ? '--' : (r.arrival_time || '')}
                              placeholder="00:00"
                              onChange={(e) => handleRouteUpdate(i, 'arrival_time', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-black text-slate-400">Dep</span>
                            <input 
                              disabled={i === trainData.route.length - 1}
                              className="w-full bg-white px-3 py-1.5 border border-slate-200 rounded-lg font-bold text-xs disabled:opacity-30"
                              value={i === trainData.route.length - 1 ? '--' : (r.departure_time || '')}
                              placeholder="00:00"
                              onChange={(e) => handleRouteUpdate(i, 'departure_time', e.target.value)}
                            />
                        </div>
                      </div>

                      {trainData.route.length > 2 && (
                        <button 
                          onClick={() => removeStation(i)}
                          className="w-6 h-6 bg-red-100 text-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateTrain}
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Creating...' : 'Finalize & Create Train'}
              </button>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Generate Schedules
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Train Number</label>
                  <input
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    value={scheduleData.train_number}
                    onChange={(e) => setScheduleData({ ...scheduleData, train_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Number of Days</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl"
                    value={scheduleData.days}
                    onChange={(e) => setScheduleData({ ...scheduleData, days: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Running Days</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                      <button
                        key={day}
                        onClick={() => {
                          const days = scheduleData.running_days.includes(day)
                            ? scheduleData.running_days.filter(d => d !== day)
                            : [...scheduleData.running_days, day];
                          setScheduleData({ ...scheduleData, running_days: days });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${scheduleData.running_days.includes(day) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateSchedule}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                {loading ? 'Generating...' : 'Generate Future Schedules'}
              </button>
            </div>
          )}

          {activeTab === 'station' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Station Network
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Total registered stations: {stations.length}</p>
                </div>
                <button
                  onClick={() => setIsBulkEditorOpen(!isBulkEditorOpen)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${isBulkEditorOpen ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isBulkEditorOpen ? 'Close Editor' : 'Bulk Import'}
                </button>
              </div>

              {isBulkEditorOpen ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">JSON Station Array</span>
                       <span className="text-[10px] font-bold text-slate-600">Postman Format</span>
                    </div>
                    <textarea 
                      className="w-full h-64 bg-transparent text-emerald-400 font-mono text-sm outline-none resize-none custom-scrollbar"
                      value={bulkJson}
                      onChange={(e) => setBulkJson(e.target.value)}
                      placeholder="Paste your JSON array here..."
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleBulkStations}
                      disabled={loading}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : (
                        <>
                          <Save className="w-4 h-4" />
                          Commit Bulk Import
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => setIsBulkEditorOpen(false)}
                      className="px-6 py-3 border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-center">
                    Note: Your JSON should be an array of objects containing <code className="text-slate-500">station_code</code>, <code className="text-slate-500">station_name</code>, <code className="text-slate-500">city</code>, and <code className="text-slate-500">state</code>.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Code</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">Station Name</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">City</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-widest">State</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {stations.length > 0 ? (
                        stations.map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg font-black text-xs">
                                {s.station_code}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700 text-sm">{s.station_name}</td>
                            <td className="px-6 py-4 text-slate-500 text-sm font-medium">{s.city}</td>
                            <td className="px-6 py-4">
                              <span className="text-slate-600 text-[10px] font-black uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                                {s.state}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-2">
                               <MapPin className="w-10 h-10 text-slate-200" />
                               <p className="text-slate-400 font-bold">No stations found.</p>
                               <p className="text-xs text-slate-300">Run "Bulk Import" to use the JSON editor.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
            <h4 className="font-bold text-lg mb-4">Admin Quick Links</h4>
            <div className="space-y-3">
              <div className="p-3 bg-white/10 rounded-xl text-sm hover:bg-white/20 cursor-pointer transition-all">View All Bookings</div>
              <div className="p-3 bg-white/10 rounded-xl text-sm hover:bg-white/20 cursor-pointer transition-all">Passenger Waitlist</div>
              <div className="p-3 bg-white/10 rounded-xl text-sm hover:bg-white/20 cursor-pointer transition-all">Revenue Analytics</div>
              <div className="p-3 bg-white/10 rounded-xl text-sm hover:bg-white/20 cursor-pointer transition-all">System Health</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

