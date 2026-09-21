/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, User, Menu, X, Landmark, ChevronDown, Settings, Bookmark, LogOut, UserCircle, HelpCircle, MessageCircle, Mail, UserPlus } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CategoriesSidebar } from './CategoriesSidebar';

export const Navbar: React.FC = () => {
  const { user, handleLogout, setIsLoginModalOpen, setAuthMode, mobileSidebarOpen, setMobileSidebarOpen } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<'all' | 'Kampala' | 'Wakiso' | 'Entebbe' | 'Jinja'>('all');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);

  const districts = [
    { value: 'all', label: 'All Uganda' },
    { value: 'Kampala', label: 'Kampala' },
    { value: 'Wakiso', label: 'Wakiso' },
    { value: 'Entebbe', label: 'Entebbe' },
    { value: 'Jinja', label: 'Jinja' }
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !location.pathname.startsWith('/marketplace')) {
      navigate(`/marketplace?q=${encodeURIComponent(query)}&district=${selectedDistrict}`);
    }
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district as any);
    if (!location.pathname.startsWith('/marketplace')) {
      navigate('/marketplace');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white text-black border-b border-gray-200">
      {/* Top Utility Bar */}
      <div className="bg-gray-50 border-b border-gray-200 text-[11px] py-1.5 px-4 font-semibold text-gray-500 tracking-wide">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 sm:px-10 lg:px-16">
          <span className="hidden sm:inline text-[10px] text-gray-400">Uganda's E-Commerce Real Estate Platform</span>
          <div className="flex items-center gap-5 ml-auto">
            <Link to="/list-with-us" className="hover:text-black transition-colors">List with us</Link>
            <span className="text-gray-300">|</span>
            <Link to="/agencies" className="hover:text-black transition-colors">Realto Verified</Link>
            <span className="text-gray-300">|</span>
            <a href="#insights" className="hover:text-black transition-colors">Realto Insights</a>
          </div>
        </div>
      </div>

      {/* Main Nav Strip */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-3 flex items-center justify-between gap-4">
        {/* Logo & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3 shrink-0 relative">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 text-black hover:bg-gray-100 rounded-md relative z-40"
            id="mobile-menu-toggle"
            title="Browse categories"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <CategoriesSidebar />

          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="bg-black text-white p-1.5 rounded-md font-black flex items-center justify-center">
              <Landmark className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase text-black">
              REALTO
            </span>
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex flex-grow max-w-2xl relative mx-4">
          <div className="relative w-full flex items-center bg-white rounded-md overflow-hidden text-gray-800 border border-gray-300 focus-within:ring-2 focus-within:ring-black/15">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search apartments, ready-to-build plots, developers in Uganda..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none placeholder-gray-400 bg-white"
              />
            </div>

            {/* Quick District Selector */}
            <div className="relative shrink-0 border-l border-gray-200 bg-gray-50 flex items-center">
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="text-[11px] font-bold py-2.5 px-3 bg-transparent text-gray-700 focus:outline-none cursor-pointer pr-5"
              >
                {districts.map((d) => (
                  <option key={d.value} value={d.value} className="text-gray-800">
                    {d.value === 'all' ? '🇺🇬 All Uganda' : d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 text-sm shrink-0">
          {/* Help */}
          <div className="relative">
            <button
              onClick={() => setHelpMenuOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer ${helpMenuOpen ? 'bg-gray-100' : ''}`}
              title="Help & Support"
              id="help-nav-button"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold">Help</span>
            </button>

            {helpMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setHelpMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1.5 z-50 text-gray-800">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-black">Need a hand?</p>
                    <p className="text-[10px] text-gray-400 font-medium">We're here every day, 8am–8pm</p>
                  </div>
                  <a
                    href="https://wa.me/256702111222"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setHelpMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    WhatsApp Support
                  </a>
                  <a
                    href="mailto:support@realto.ug"
                    onClick={() => setHelpMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-gray-400" />
                    Email Support
                  </a>
                </div>
              </>
            )}
          </div>

          {/* User Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={`flex items-center space-x-1.5 hover:bg-gray-100 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${userMenuOpen ? 'bg-gray-100' : ''}`}
                id="user-menu-toggle"
              >
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center font-black text-[11px] shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold truncate max-w-[100px]">{user.name.split(' ')[0]}</span>
                <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-md shadow-lg border border-gray-200 py-1.5 z-50 text-gray-800">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-black truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
                    >
                      <UserCircle className="w-4 h-4 text-gray-400" />
                      My Profile
                    </button>
                    <Link
                      to="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 text-gray-400" />
                      Saved Listings ({user.savedPropertyIds.length})
                    </Link>
                    <button
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 hover:text-black transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAuthMode('login'); setIsLoginModalOpen(true); }}
                className="flex items-center space-x-1.5 border border-gray-300 hover:bg-gray-100 px-3.5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-black"
                id="login-trigger-button"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                onClick={() => { setAuthMode('register'); setIsLoginModalOpen(true); }}
                className="flex items-center space-x-1.5 bg-black hover:bg-gray-800 text-white px-3.5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                id="register-trigger-button"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-6 sm:px-10 pb-3">
        <div className="relative w-full flex items-center bg-white rounded-md overflow-hidden text-gray-800 border border-gray-300">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search plots, apartments..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none placeholder-gray-400 bg-white"
          />
        </div>
      </div>
    </header>
  );
};
