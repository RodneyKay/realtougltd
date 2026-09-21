import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark } from 'lucide-react';

const readout = [
  { label: 'Listings synced live', value: 'Marketplace' },
  { label: 'Leads, viewings & offers', value: 'One inbox' },
  { label: 'Commission tracking', value: 'Per agent' },
  { label: 'KYC verification', value: '~2 business days' },
];

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — brand / value panel */}
      <div className="hidden lg:flex lg:w-[42%] bg-black text-white flex-col justify-between p-10 xl:p-14">
        <Link to="/" className="flex items-center space-x-2 w-fit">
          <Landmark className="w-6 h-6 text-white" />
          <span className="text-lg font-black tracking-tight">REALTO</span>
        </Link>

        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Agency & Developer Portal</p>
            <h1 className="text-3xl xl:text-4xl font-black leading-[1.1] tracking-tight">
              Run your listings, leads, and deals from one console.
            </h1>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm">
              The same verification and marketplace reach Realto buyers already trust — now with the operations
              tooling to back it up.
            </p>
          </div>

          <div className="border border-white/10 rounded-lg divide-y divide-white/10 font-mono text-[11px] max-w-sm">
            {readout.map((r) => (
              <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-white/40">{r.label}</span>
                <span className="text-white font-bold">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-white/30">© {new Date().getFullYear()} Realto. Built for East Africa's real estate market.</p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-8">
          <Link to="/" className="flex lg:hidden items-center space-x-2 w-fit mx-auto mb-2">
            <Landmark className="w-6 h-6 text-black" />
            <span className="text-lg font-black tracking-tight text-gray-900">REALTO</span>
          </Link>

          <div className="space-y-1.5 text-center lg:text-left">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{eyebrow}</p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
