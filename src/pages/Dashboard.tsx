import { Link } from 'react-router-dom';
import { Search, Train, ShieldCheck, CreditCard } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-6 py-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-700 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Seamless Train Travel
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Book tickets, check schedules, and manage your journey with India's fastest railway network application.
          </p>
          <div className="pt-8">
            <Link
              to="/search"
              className="inline-flex items-center space-x-2 bg-white text-primary hover:bg-slate-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <Search className="w-5 h-5" />
              <span>Find Trains Now</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <Train className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800">Extensive Network</h3>
          <p className="text-slate-600 leading-relaxed">
            Access thousands of trains across the country with real-time availability and schedule updates.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800">Secure Bookings</h3>
          <p className="text-slate-600 leading-relaxed">
            Your transactions and personal data are protected by industry-leading security protocols.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
            <CreditCard className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-slate-800">Instant Refunds</h3>
          <p className="text-slate-600 leading-relaxed">
            Cancel tickets easily and get instant refunds processed directly to your original payment method.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
