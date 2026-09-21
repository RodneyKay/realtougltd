import React, { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';
import { useAppData } from '../context/DataContext';
import { Link } from 'react-router-dom';

export const AgenciesDirectory: React.FC = () => {
  const { agencies } = useAppData();
  const [agencySearchQuery, setAgencySearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Verified Real Estate Partners</h2>
          <p className="text-xs text-gray-500 font-medium">Shop directly from official developers and registered real estate agencies in East Africa. No broker fees, no middle-men.</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search partner store or developer name..."
            value={agencySearchQuery || ''}
            onChange={(e) => setAgencySearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-md text-gray-800 bg-stone-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies
          .filter((agency) => 
            !agencySearchQuery || agency.name.toLowerCase().includes(agencySearchQuery.toLowerCase())
          )
          .map((agency) => (
            <Link 
              key={agency.id}
              to={`/agency/${agency.id}`}
              className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:shadow-lg hover:border-gray-200 transition-all cursor-pointer group relative block"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <img 
                    src={agency.logoUrl} 
                    alt={agency.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 shrink-0"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-gray-900 flex items-center gap-1 group-hover:text-[#000000] transition-colors">
                      {agency.name}
                      <ShieldCheck className="w-4 h-4 text-gray-700 shrink-0" />
                    </h3>
                    <span className="inline-flex bg-gray-50 border border-gray-100 text-[9px] font-bold uppercase text-gray-800 px-2 py-0.5 rounded-sm">
                      Verified Partner
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
                  {agency.bio}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
                  <div className="bg-stone-50 p-2 rounded-sm border border-stone-100">
                    <span className="block text-[9px] text-gray-400 font-bold uppercase">Store Inventory</span>
                    <span className="font-black text-gray-800">{agency.listingsCount} Listings</span>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-sm border border-stone-100">
                    <span className="block text-[9px] text-gray-400 font-bold uppercase">Primary Market</span>
                    <span className="font-black text-gray-800">Kampala & Wakiso</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#000000] border-t border-stone-100 mt-4">
                <span className="group-hover:underline">Explore Official Storefront →</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MoLHUD Reg. Approved</span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};
