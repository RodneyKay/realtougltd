import React from 'react';
import { Heart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAppData } from '../context/DataContext';
import { PropertyCard } from '../components/PropertyCard';

export const Saved: React.FC = () => {
  const { user, handleSaveToggle, setIsLoginModalOpen } = useAppContext();
  const { properties } = useAppData();

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-8 text-center bg-white border border-gray-200 rounded-lg space-y-4 shadow-sm mt-8">
        <Heart className="w-12 h-12 text-gray-300 mx-auto" />
        <h3 className="text-base font-black text-gray-800">Your Watchlist is offline</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          Sign in to keep track of saved properties, record contact diaries with verified agencies, and inspect viewing schedules.
        </p>
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-5 py-2.5 bg-[#000000] hover:bg-[#262626] text-white font-black text-xs uppercase tracking-wider rounded-md shadow-md cursor-pointer transition-all"
        >
          Login Instantly
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in mt-4">
      <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 bg-gradient-to-tr from-gray-700 to-gray-500 text-white font-black text-xl rounded-full flex items-center justify-center shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base font-black text-gray-900 tracking-tight">{user.name}</h2>
            <p className="text-[11px] text-gray-500 font-bold uppercase">{user.email} • {user.phone}</p>
          </div>
        </div>

        <div className="flex gap-4 text-xs font-bold text-gray-500 text-center">
          <div className="px-4 py-2 bg-gray-50 rounded-md border border-gray-100">
            <span className="block text-base font-black text-gray-800">{user.savedPropertyIds.length}</span>
            <span className="text-[9px] uppercase font-bold text-gray-400">Saved Items</span>
          </div>
          <div className="px-4 py-2 bg-gray-50 rounded-md border border-gray-100">
            <span className="block text-base font-black text-gray-800">{user.contactHistory.length}</span>
            <span className="text-[9px] uppercase font-bold text-gray-400">Total Inquiries</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Saved Properties Catalog</h3>
        
        {user.savedPropertyIds.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500">
            No properties saved to your watchlist yet. Tap hearts on search cards to populate.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties
              .filter(p => user.savedPropertyIds.includes(p.id))
              .map(prop => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isSaved={true}
                  onSaveToggle={handleSaveToggle}
                  onClick={(id) => { window.location.href = `/property/${id}`; }}
                />
              ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Contact History & Scheduled Viewings</h3>
        
        {user.contactHistory.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500">
            You have not sent any inquiries to partner agencies yet.
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider text-[10px]">
                    <th className="p-4">Date / Time</th>
                    <th className="p-4">Target Agency</th>
                    <th className="p-4">Associated Listing</th>
                    <th className="p-4">Request Classification</th>
                    <th className="p-4">Message Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {user.contactHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/50">
                      <td className="p-4 whitespace-nowrap font-bold text-gray-900">{rec.date}</td>
                      <td className="p-4 font-bold text-gray-800">{rec.agencyName}</td>
                      <td className="p-4 truncate max-w-[200px]">{rec.propertyName || 'General Inquiry'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          rec.type === 'viewing' 
                            ? 'bg-gray-100 text-gray-900' 
                            : rec.type === 'investment' 
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-gray-100 text-gray-900'
                        }`}>
                          {rec.type === 'viewing' ? 'Viewing Scheduled' : rec.type === 'investment' ? 'Investment Expressed' : 'General Enquiry'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 max-w-xs truncate" title={rec.message}>{rec.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
