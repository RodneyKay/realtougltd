import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, ShieldCheck, ShieldAlert, ShieldQuestion, Building2 } from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import { tierLabel } from '../lib/portalApi';

const pageTitles: Record<string, string> = {
  '/portal/dashboard': 'Overview',
  '/portal/listings': 'Listings',
  '/portal/leads': 'Leads',
  '/portal/marketing': 'Marketing',
  '/portal/team': 'Team',
  '/portal/verification': 'Verification',
  '/portal/billing': 'Plan & billing',
  '/portal/enquiries': 'Enquiries',
  '/portal/viewings': 'Viewings',
};

const kycDisplay: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  not_submitted: { label: 'Not Verified', icon: ShieldQuestion, className: 'bg-gray-100 text-gray-600' },
  pending: { label: 'Pending', icon: ShieldAlert, className: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'Under Review', icon: ShieldAlert, className: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Verified', icon: ShieldCheck, className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', icon: ShieldAlert, className: 'bg-red-100 text-red-700' },
};

export const PortalTopbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { agency, profile, role, logout } = usePortalAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!agency) return null;
  const kyc = kycDisplay[agency.kyc_status] ?? kycDisplay.not_submitted;
  const KycIcon = kyc.icon;
  const pageTitle = pageTitles[location.pathname] ?? 'Portal';

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login', { replace: true });
  };

  return (
    <header className="h-16 shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-6 sm:px-8">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-md bg-gray-900 text-white flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-900 truncate leading-tight">{agency.name}</p>
          <p className="text-[10px] text-gray-400 leading-tight">{pageTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Link
          to="/portal/billing"
          title="Plan and usage"
          className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          {tierLabel[agency.subscription_tier ?? 'free']} plan
        </Link>
        <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${kyc.className}`}>
          <KycIcon className="w-3 h-3" />
          {kyc.label}
        </span>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
              {(profile?.name ?? '?').charAt(0).toUpperCase()}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
              <div className="px-3.5 py-2 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-900 truncate">{profile?.name}</p>
                <p className="text-[10px] text-gray-400 capitalize">{role?.replace('_', ' ')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
