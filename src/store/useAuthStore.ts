import { create } from 'zustand';

interface User {
  id: string;
  fullName: string;
  user_name: string;
  email: string;
  email_verified: boolean;
  phone: string;
  phone_verified: boolean;
  role: string;
  aadhaarId?: string;
  aadhaarId_verified: boolean;
}



interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  let initialUser = null;
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      initialUser = JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Failed to parse user from local storage');
  }

  return {
    user: initialUser,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    login: (user, token) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
