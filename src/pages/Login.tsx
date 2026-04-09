import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api, USER_SERVICE_URL } from '../config/api';

const Login = () => {
  const [method, setMethod] = useState<'password' | 'otp' | 'mpin'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMpin, setShowMpin] = useState(false);
  const [otp, setOtp] = useState('');
  const [mpin, setMpin] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(`${USER_SERVICE_URL}/v1/user/login`, { email, password });
      const { token, user } = response.data;
      login(user, token);
      toast.success('Successfully logged in');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await api.post(`${USER_SERVICE_URL}/v1/user/email-otp-login`, { email });
      setOtpSent(true);
      toast.success('OTP sent to email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(`${USER_SERVICE_URL}/v1/user/verify-email-otp-login`, { email, otp });
      const { token, user } = response.data;
      login(user, token);
      toast.success('Successfully logged in with OTP');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleMpinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // The backend mpin-login expects phone and mpin
      const response = await api.post(`${USER_SERVICE_URL}/v1/user/mpin-login`, { phone: email, mpin });
      const { token, user } = response.data;
      login(user, token);
      toast.success('Successfully logged in with MPIN');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid MPIN');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Welcome Back
          </h2>
          <div className="flex justify-center mt-6 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setMethod('password')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'password' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Password
            </button>
            <button
              onClick={() => setMethod('otp')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'otp' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              OTP
            </button>
            <button
              onClick={() => setMethod('mpin')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${method === 'mpin' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              MPIN
            </button>
          </div>
        </div>

        {method === 'password' && (
          <form className="mt-8 space-y-6" onSubmit={handlePasswordLogin}>
            <div className="space-y-4">
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-700 transition-all shadow-md"
            >
              {loading ? 'Please wait...' : 'Sign In'}
            </button>
          </form>
        )}

        {method === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleOtpLogin}>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !email}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Send OTP
                </button>
              </div>
              {otpSent && (
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              )}
            </div>
            {otpSent && (
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-700 transition-all shadow-md"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            )}
          </form>
        )}

        {method === 'mpin' && (
          <form className="mt-8 space-y-6" onSubmit={handleMpinLogin}>
            <div className="space-y-4">
              <input
                type="tel"
                required
                className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
                placeholder="Phone number (+91...)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input
                  type={showMpin ? "text" : "password"}
                  maxLength={5}
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm text-center tracking-[1em] font-bold"
                  placeholder="*****"
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowMpin(!showMpin)}
                >
                  {showMpin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-700 transition-all shadow-md"
            >
              {loading ? 'Signing in...' : 'Sign In with MPIN'}
            </button>
          </form>
        )}

        <div className="text-center text-sm">
          <span className="text-slate-600">Don't have an account? </span>
          <Link to="/register" className="font-bold text-primary hover:text-blue-700 transition-colors">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};


export default Login;
