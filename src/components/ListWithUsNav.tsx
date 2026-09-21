import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, LogIn, UserPlus } from 'lucide-react';

export const ListWithUsNav: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 h-[72px] bg-black text-white">
      <div className="h-full w-full px-6 sm:px-10 lg:px-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <div className="bg-white text-black p-1.5 rounded-md font-black flex items-center justify-center">
            <Landmark className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">REALTO</span>
          <span className="hidden sm:inline-block text-[10px] font-bold text-white/40 uppercase tracking-widest border-l border-white/20 pl-2 ml-1">
            For Agencies &amp; Developers
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/"
            className="hidden sm:inline text-[11px] font-bold text-white/50 hover:text-white transition-colors mr-2"
          >
            Buying or renting? Browse the marketplace
          </Link>
          <Link
            to="/portal/login"
            className="flex items-center gap-1.5 border border-white/25 hover:bg-white/10 px-3.5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </Link>
          <Link
            to="/portal/register"
            className="flex items-center gap-1.5 bg-white text-black hover:bg-gray-100 px-3.5 py-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
