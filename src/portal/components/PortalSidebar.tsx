import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutGrid,
  Building2,
  Users2,
  ShieldCheck,
  CreditCard,
  Landmark,
  Contact,
  Megaphone,
  Inbox,
  CalendarClock,
  ChevronDown,
  FolderKanban,
  Wallet,
  FileText,
  BarChart3,
  GitBranch,
  Settings,
} from 'lucide-react';
import { usePortalAuth } from '../context/PortalAuthContext';
import { useNewEnquiryCount } from '../hooks/useNewEnquiryCount';

/**
 * Set to true to preview the planned modules (shown greyed out with a plan tag).
 * Leave false in production: pages that don't exist yet shouldn't be clickable.
 */
const SHOW_UPCOMING = false;

interface NavChild {
  label: string;
  to: string;
  /** value of the `?tab=` query param this child represents; undefined = the default view */
  tab?: string;
  /** opens something instead of showing a view, so it is never highlighted */
  action?: boolean;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  to: string;
  children?: NavChild[];
  badge?: 'enquiries';
  /** not built yet */
  soon?: boolean;
  /** plan that will include it, shown on upcoming items */
  plan?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', icon: LayoutGrid, to: '/portal/dashboard' },
      {
        label: 'Listings',
        icon: Building2,
        to: '/portal/listings',
        children: [
          { label: 'All properties', to: '/portal/listings' },
          { label: 'Add property', to: '/portal/listings?new=1', action: true },
        ],
      },
      { label: 'Enquiries', icon: Inbox, to: '/portal/enquiries', badge: 'enquiries' },
      { label: 'Leads', icon: Contact, to: '/portal/leads' },
      { label: 'Viewings', icon: CalendarClock, to: '/portal/viewings' },
      {
        label: 'Marketing',
        icon: Megaphone,
        to: '/portal/marketing',
        children: [
          { label: 'Placements', to: '/portal/marketing' },
          { label: 'Campaigns', to: '/portal/marketing?tab=campaigns', tab: 'campaigns' },
          { label: 'Featured', to: '/portal/marketing?tab=featured', tab: 'featured' },
        ],
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Projects', icon: FolderKanban, to: '/portal/projects', soon: true, plan: 'Business+' },
      { label: 'Payments', icon: Wallet, to: '/portal/payments', soon: true, plan: 'Business+' },
      { label: 'Documents', icon: FileText, to: '/portal/documents', soon: true, plan: 'Business+' },
    ],
  },
  {
    title: 'Agency',
    items: [
      { label: 'Team', icon: Users2, to: '/portal/team' },
      { label: 'Branches', icon: GitBranch, to: '/portal/branches', soon: true, plan: 'Business+' },
      { label: 'Verification', icon: ShieldCheck, to: '/portal/verification' },
    ],
  },
  {
    title: 'Insights',
    items: [{ label: 'Analytics', icon: BarChart3, to: '/portal/analytics', soon: true, plan: 'Professional+' }],
  },
  {
    title: 'Account',
    items: [
      { label: 'Plan & billing', icon: CreditCard, to: '/portal/billing' },
      { label: 'Settings', icon: Settings, to: '/portal/settings', soon: true },
    ],
  },
];

/** `soft` = an expanded group whose active child carries the highlight instead. */
const rowClass = (active: boolean, soft = false) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
    active && soft
      ? 'bg-gray-50 text-gray-900'
      : active
        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
  }`;

export const PortalSidebar: React.FC = () => {
  const { agency } = usePortalAuth();
  const location = useLocation();
  const newEnquiries = useNewEnquiryCount(agency?.id);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const params = new URLSearchParams(location.search);
  const currentTab = params.get('tab');

  const childActive = (parentTo: string, child: NavChild) =>
    !child.action && location.pathname === parentTo && (child.tab ?? null) === currentTab;

  const visibleSections = sections
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.soon || SHOW_UPCOMING) }))
    .filter((s) => s.items.length > 0);

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col py-5 px-4 overflow-y-auto">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black tracking-tight text-gray-900 leading-tight">REALTO</p>
          <p className="text-[10px] text-gray-400 leading-tight capitalize truncate">{agency?.business_type ?? 'agency'} portal</p>
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {visibleSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">{section.title}</p>

            {section.items.map((item) => {
              const Icon = item.icon;

              if (item.soon) {
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-gray-300 cursor-not-allowed select-none"
                    title="Coming soon"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wide bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                      {item.plan ?? 'Soon'}
                    </span>
                  </div>
                );
              }

              const inGroup = !!item.children && location.pathname.startsWith(item.to);
              const open = item.children ? (collapsed[item.label] === undefined ? inGroup : !collapsed[item.label]) : false;

              return (
                <div key={item.label}>
                  <div className="relative">
                    <NavLink to={item.to} end={!item.children} className={({ isActive }) => rowClass(isActive, !!item.children && open)}>
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.label}
                      {item.badge === 'enquiries' && newEnquiries > 0 && (
                        <span className="ml-auto text-[10px] font-black bg-black text-white rounded-full min-w-5 h-5 px-1.5 inline-flex items-center justify-center tabular-nums">
                          {newEnquiries > 99 ? '99+' : newEnquiries}
                        </span>
                      )}
                    </NavLink>
                    {item.children && (
                      <button
                        type="button"
                        aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
                        aria-expanded={open}
                        onClick={() => setCollapsed((c) => ({ ...c, [item.label]: open }))}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors ${
                          inGroup && !open ? 'text-white/80 hover:bg-white/20' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? '' : '-rotate-90'}`} />
                      </button>
                    )}
                  </div>

                  {item.children && open && (
                    <div className="mt-1 mb-1 ml-5 pl-3 border-l border-gray-100 space-y-0.5">
                      {item.children.map((child) => {
                        const active = childActive(item.to, child);
                        return (
                          <Link
                            key={child.label}
                            to={child.to}
                            className={`block px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors ${
                              active ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <NavLink
        to="/"
        className="mt-6 flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        ← Back to marketplace
      </NavLink>
    </aside>
  );
};
