import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Building2, Clock, Users, TrendingUp, Heart, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface NavItem {
  label: string;
  path: string;
  category?: string; // for /marketplace links — compared against the ?category= query param
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Residential Units', path: '/marketplace', category: 'residential', icon: <HomeIcon className="w-4 h-4" /> },
  { label: 'Commercial Buildings', path: '/marketplace', category: 'commercial', icon: <Building2 className="w-4 h-4" /> },
  { label: 'Short-Stay Rentals', path: '/marketplace', category: 'short-stay', icon: <Clock className="w-4 h-4" /> },
  { label: 'Verified Agencies', path: '/agencies', icon: <Users className="w-4 h-4" /> },
  { label: 'Investment Yields', path: '/investments', icon: <TrendingUp className="w-4 h-4" /> },
  { label: 'Saved Watchlist', path: '/saved', icon: <Heart className="w-4 h-4" /> },
];

/**
 * Anchored dropdown (not a full-screen drawer) — rendered inside a
 * `relative`-positioned wrapper right next to the hamburger trigger in
 * Navbar, so it appears just below the button rather than covering the
 * header. The backdrop sits at a lower z-index than the header so the
 * header (including the toggle/X button) always stays clickable on top.
 *
 * Active state is computed manually (rather than via NavLink's built-in
 * isActive) because NavLink only compares pathname, not query strings — and
 * every /marketplace?category=X link shares the same pathname, which would
 * make all of them show as "active" simultaneously.
 */
export const CategoriesSidebar: React.FC = () => {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useAppContext();
  const location = useLocation();

  if (!mobileSidebarOpen) return null;

  const activeCategory = new URLSearchParams(location.search).get('category');

  const isItemActive = (item: NavItem) => {
    if (location.pathname !== item.path) return false;
    if (item.category) return activeCategory === item.category;
    return true;
  };

  return (
    <>
      <div
        onClick={() => setMobileSidebarOpen(false)}
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 animate-fade-in"
      />
      <aside className="absolute top-full left-0 mt-2 z-40 w-64 max-h-[75vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-2xl p-2 animate-fade-in">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = isItemActive(item);
            const to = item.category ? `${item.path}?category=${item.category}` : item.path;
            return (
              <Link
                key={item.label}
                to={to}
                onClick={() => setMobileSidebarOpen(false)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#000000]/10 text-[#000000]'
                    : 'text-gray-700 hover:bg-stone-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`${isActive ? 'text-[#000000]' : 'text-slate-400'}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3 h-3 opacity-50" />
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};
