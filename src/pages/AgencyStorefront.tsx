import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useAppContext } from '../context/AppContext';
import { useAppData } from '../context/DataContext';

export const AgencyStorefront: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, handleSaveToggle, triggerContactAgency } = useAppContext();
  const { agencies, properties } = useAppData();

  const selectedAgency = agencies.find(a => a.id === id);

  if (!selectedAgency) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Agency not found</h2>
        <Link to="/marketplace" className="text-blue-500 underline mt-4 inline-block">Return to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="agency-storefront-page">
      <Link 
        to="/marketplace"
        className="flex items-center space-x-1 text-xs font-black text-gray-500 hover:text-[#000000] uppercase tracking-wider transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs relative">
        <div className="h-36 w-full relative">
          <img 
            src={selectedAgency.bannerUrl} 
            alt="" 
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="p-6 relative -mt-10 flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <img 
              src={selectedAgency.logoUrl} 
              alt={selectedAgency.name} 
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md z-10"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                  {selectedAgency.name}
                </h1>
                <ShieldCheck className="w-5 h-5 text-gray-700 shrink-0" />
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Official Partner Store • Registered Uganda Developer</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => triggerContactAgency(selectedAgency, undefined, undefined, 'enquiry')}
              className="px-5 py-2.5 bg-[#000000] hover:bg-[#262626] text-white text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-md"
            >
              Direct Message Store
            </button>
            <a 
              href={`https://wa.me/${selectedAgency.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer text-center block"
            >
              WhatsApp Chat
            </a>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-600">
          <div className="md:col-span-2 space-y-1.5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">About the Developer</h4>
            <p className="leading-relaxed font-medium">{selectedAgency.bio}</p>
          </div>
          <div className="space-y-1 bg-gray-50 p-3 rounded-md border border-gray-100">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified Credentials</h4>
            <p className="font-bold text-gray-800">Phone: {selectedAgency.phone}</p>
            <p className="font-bold text-gray-800">Email: {selectedAgency.email}</p>
            <p className="font-bold text-gray-800">License: MoLHUD-Reg#{selectedAgency.id.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Active Catalog ({properties.filter(p => p.agencyId === selectedAgency.id).length} listings)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties
            .filter(p => p.agencyId === selectedAgency.id)
            .map(prop => (
              <PropertyCard
                key={prop.id}
                property={prop}
                isSaved={user ? user.savedPropertyIds.includes(prop.id) : false}
                onSaveToggle={handleSaveToggle}
                onClick={(propId) => { window.location.href = `/property/${propId}`; }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
