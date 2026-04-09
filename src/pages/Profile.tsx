import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { api, USER_SERVICE_URL, NOTIFICATION_SERVICE_URL } from '../config/api';


import { useAuthStore } from '../store/useAuthStore';
import { Shield, Mail, Phone, Lock, Key, Fingerprint, Loader2, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuthStore();
    const [aadhaar, setAadhaar] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [mobileOtp, setMobileOtp] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        password: '',
        confirmPassword: '',
    });
    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [mpinData, setMpinData] = useState({
        mpin: '',
        confirmMpin: '',
    });
    const [showMpin, setShowMpin] = useState({
        mpin: false,
        confirm: false
    });
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        user_name: '',
        email: ''
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    React.useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.name || user.fullName || '',
                user_name: user.user_name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    React.useEffect(() => {
        const fetchProfile = async () => {
            setLoading('profile');
            try {
                // Use the api instance so that the Authorization header (interceptor) is included
                const response = await api.get(`${USER_SERVICE_URL}/v1/user/profile`);
                const token = localStorage.getItem('token');
                if (token) {
                    login(response.data.user || response.data, token);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(null);
            }
        };
        fetchProfile();
    }, [login]);



    const handleSetAadhaar = async () => {
        if (aadhaar.length !== 12) {
            toast.error('Aadhaar must be exactly 12 digits');
            return;
        }
        setLoading('aadhaar');
        try {
            await api.patch(`${USER_SERVICE_URL}/v1/user/set-aadhaar`, { aadhaarId: aadhaar });
            toast.success('Aadhaar updated successfully');
            
            // Refresh profile to show verified status
            const response = await api.get(`${USER_SERVICE_URL}/v1/user/profile`);
            const token = localStorage.getItem('token');
            if (token) {
                login(response.data.user || response.data, token);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update Aadhaar');
        } finally {
            setLoading(null);
        }
    };

    const handleSendEmailOtp = async () => {
        setLoading('sendEmail');
        try {
            await api.post(`${NOTIFICATION_SERVICE_URL}/v1/notification/send-email-otp`, { email: user?.email });
            toast.success('OTP sent to your email');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send email OTP');
        } finally {
            setLoading(null);
        }
    };

    const handleVerifyEmailOtp = async () => {
        setLoading('verifyEmail');
        try {
            await api.post(`${USER_SERVICE_URL}/v1/user/verifyEmailOtp_for_true`, {
                email: user?.email,
                otp: emailOtp
            });
            toast.success('Email verified successfully');
            
            // Refresh profile
            const response = await api.get(`${USER_SERVICE_URL}/v1/user/profile`);
            const token = localStorage.getItem('token');
            if (token) {
                login(response.data.user || response.data, token);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid email OTP');
        } finally {
            setLoading(null);
        }
    };

    const handleSendMobileOtp = async () => {
        setLoading('sendMobile');
        try {
            await api.post(`${NOTIFICATION_SERVICE_URL}/v1/notification/send-mobile-otp`, { phone: user?.phone });
            toast.success('OTP sent to your mobile');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send mobile OTP');
        } finally {
            setLoading(null);
        }
    };

    const handleVerifyMobileOtp = async () => {
        setLoading('verifyMobile');
        try {
            await api.post(`${USER_SERVICE_URL}/v1/user/verifyPhoneOtp_for_true`, {
                phone: user?.phone,
                otp: mobileOtp
            });
            toast.success('Mobile verified successfully');

            // Refresh profile
            const response = await api.get(`${USER_SERVICE_URL}/v1/user/profile`);
            const token = localStorage.getItem('token');
            if (token) {
                login(response.data.user || response.data, token);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid mobile OTP');
        } finally {
            setLoading(null);
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordData.password !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading('password');
        try {
            await api.post(`${USER_SERVICE_URL}/v1/user/update-password`, passwordData);
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', password: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(null);
        }
    };

    const handleUpdateMpin = async () => {
        if (mpinData.mpin.length !== 5) {
            toast.error('MPIN must be exactly 5 digits');
            return;
        }
        if (mpinData.mpin !== mpinData.confirmMpin) {
            toast.error('MPINs do not match');
            return;
        }
        setLoading('mpin');
        try {
            await api.post(`${USER_SERVICE_URL}/v1/user/update-mpin`, mpinData);
            toast.success('MPIN updated successfully');
            setMpinData({ mpin: '', confirmMpin: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update MPIN');
        } finally {
            setLoading(null);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading('updateProfile');
        try {
            await api.post(`${USER_SERVICE_URL}/v1/user/update-profile`, profileForm);
            toast.success('Profile updated successfully');
            setIsEditingProfile(false);
            
            // Refresh profile to update global state
            const response = await api.get(`${USER_SERVICE_URL}/v1/user/profile`);
            const token = localStorage.getItem('token');
            if (token) {
                login(response.data.user || response.data, token);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(null);
        }
    };

    if (loading === 'profile' && !user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                           <Shield className="text-primary w-6 h-6" />
                        </div>
                        Profile Settings
                    </h2>
                    {user?.email_verified && user?.phone_verified && user?.aadhaarId_verified && (
                        <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2 text-sm font-bold shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                            <Shield className="w-4 h-4" />
                            Verified Profile
                        </div>
                    )}
                </div>

                {/* NEW: Basic Information Section */}
                <div className="mb-10 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                           Basic Information
                        </h3>
                        {!isEditingProfile ? (
                            <button 
                                onClick={() => setIsEditingProfile(true)}
                                className="text-primary font-black text-sm uppercase tracking-widest hover:underline"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setIsEditingProfile(false)}
                                    className="text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleUpdateProfile}
                                    disabled={loading === 'updateProfile'}
                                    className="bg-primary text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {loading === 'updateProfile' ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Full Name</label>
                            {isEditingProfile ? (
                                <input 
                                    type="text"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-primary/10"
                                    value={profileForm.fullName}
                                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                                />
                            ) : (
                                <p className="px-4 py-3 bg-white rounded-xl font-black text-slate-900 border border-slate-100">{user?.fullName || user?.name || '---'}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Username</label>
                            {isEditingProfile ? (
                                <input 
                                    type="text"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-primary/10"
                                    value={profileForm.user_name}
                                    onChange={(e) => setProfileForm({...profileForm, user_name: e.target.value})}
                                />
                            ) : (
                                <p className="px-4 py-3 bg-white rounded-xl font-black text-slate-900 border border-slate-100">@{user?.user_name || '---'}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">Email Address</label>
                            {isEditingProfile ? (
                                <input 
                                    type="email"
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold outline-none focus:ring-4 focus:ring-primary/10"
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                />
                            ) : (
                                <p className="px-4 py-3 bg-white rounded-xl font-black text-slate-900 border border-slate-100">{user?.email || '---'}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Identity Verification */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-slate-500" />
                            Identity Verification
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar Number</label>
                                <div className="flex gap-2">
                                    {user?.aadhaarId_verified ? (
                                        <div className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> {user.aadhaarId} (Verified)
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                maxLength={12}
                                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                                placeholder="Enter 12 digit Aadhaar"
                                                value={aadhaar}
                                                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                                            />
                                            <button
                                                onClick={handleSetAadhaar}
                                                disabled={loading === 'aadhaar'}
                                                className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            >
                                                {loading === 'aadhaar' ? 'Updating...' : 'Set'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email Verification
                                    </span>
                                    {!user?.email_verified && (
                                        <button
                                            onClick={handleSendEmailOtp}
                                            disabled={loading === 'sendEmail'}
                                            className="text-primary text-sm font-bold hover:underline disabled:opacity-50"
                                        >
                                            Send OTP
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {user?.email_verified ? (
                                        <div className="w-full px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold text-sm flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Verified
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                                                placeholder="Enter Email OTP"
                                                value={emailOtp}
                                                onChange={(e) => setEmailOtp(e.target.value)}
                                            />
                                            <button
                                                onClick={handleVerifyEmailOtp}
                                                disabled={loading === 'verifyEmail'}
                                                className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                            >
                                                Verify
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> Mobile Verification
                                    </span>
                                    {!user?.phone_verified && (
                                        <button
                                            onClick={handleSendMobileOtp}
                                            disabled={loading === 'sendMobile'}
                                            className="text-primary text-sm font-bold hover:underline disabled:opacity-50"
                                        >
                                            Send OTP
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {user?.phone_verified ? (
                                        <div className="w-full px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl font-bold text-sm flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Verified
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="text"
                                                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm"
                                                placeholder="Enter Mobile OTP"
                                                value={mobileOtp}
                                                onChange={(e) => setMobileOtp(e.target.value)}
                                            />
                                            <button
                                                onClick={handleVerifyMobileOtp}
                                                disabled={loading === 'verifyMobile'}
                                                className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                            >
                                                Verify
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-slate-500" />
                            Security Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Key className="w-4 h-4" /> Change Password
                                </h4>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            type={showPass.current ? "text" : "password"}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm pr-10"
                                            placeholder="Current Password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                                        >
                                            {showPass.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPass.new ? "text" : "password"}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm pr-10"
                                            placeholder="New Password"
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                                        >
                                            {showPass.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPass.confirm ? "text" : "password"}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm pr-10"
                                            placeholder="Confirm New Password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                                        >
                                            {showPass.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleUpdatePassword}
                                        disabled={loading === 'password'}
                                        className="w-full bg-slate-900 text-white py-2 rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Set/Update MPIN
                                </h4>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type={showMpin.mpin ? "text" : "password"}
                                            maxLength={5}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-center tracking-[0.5em] pr-10"
                                            placeholder="New 5-digit MPIN"
                                            value={mpinData.mpin}
                                            onChange={(e) => setMpinData({ ...mpinData, mpin: e.target.value.replace(/\D/g, '') })}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowMpin({ ...showMpin, mpin: !showMpin.mpin })}
                                        >
                                            {showMpin.mpin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showMpin.confirm ? "text" : "password"}
                                            maxLength={5}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-center tracking-[0.5em] pr-10"
                                            placeholder="Confirm 5-digit MPIN"
                                            value={mpinData.confirmMpin}
                                            onChange={(e) => setMpinData({ ...mpinData, confirmMpin: e.target.value.replace(/\D/g, '') })}
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                            onClick={() => setShowMpin({ ...showMpin, confirm: !showMpin.confirm })}
                                        >
                                            {showMpin.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleUpdateMpin}
                                        disabled={loading === 'mpin'}
                                        className="w-full bg-primary text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Set MPIN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
