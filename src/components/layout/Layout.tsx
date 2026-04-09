import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Train, User, LogOut } from 'lucide-react';

const Layout = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <Train className="h-8 w-8" />
                <span className="font-bold text-xl tracking-tight">IRTC Services</span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-4">
                <Link to="/search" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Search Trains
                </Link>
                <Link to="/pnr-status" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  PNR Status
                </Link>
                {isAuthenticated && (
                  <Link to="/bookings" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    My Bookings
                  </Link>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link to="/admin" className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center space-x-2 text-sm hover:underline">
                    <User className="h-4 w-4" />
                    <span>{user?.fullName}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 hover:bg-primary-foreground/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-x-2">
                  <Link
                    to="/login"
                    className="hover:bg-primary-foreground/10 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-primary hover:bg-slate-100 px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
