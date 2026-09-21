import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Heart, MapPin, Bed, Bath, Maximize2, Layers, ShieldCheck } from 'lucide-react';
import { formatPrice, PropertyCard } from '../components/PropertyCard';
import { useAppContext } from '../context/AppContext';
import { useAppData } from '../context/DataContext';

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, handleSaveToggle, triggerContactAgency } = useAppContext();
  const { properties, agencies, loading: dataLoading } = useAppData();
  const [activeDetailImageIndex, setActiveDetailImageIndex] = useState(0);

  const selectedProperty = properties.find((p) => p.id === id);

  if (!selectedProperty) {
    return (
      <div className="text-center py-20">
        {dataLoading ? (
          <h2 className="text-xl font-bold">Loading…</h2>
        ) : (
          <>
            <h2 className="text-xl font-bold">Property not found</h2>
            <Link to="/marketplace" className="text-blue-500 underline mt-4 inline-block">Return to Marketplace</Link>
          </>
        )}
      </div>
    );
  }

  const selectedAgency = agencies.find(a => a.id === selectedProperty.agencyId);

  return (
    <div className="space-y-6 animate-fade-in" id="property-detail-page">
      <Link 
        to="/marketplace"
        className="flex items-center space-x-1 text-xs font-black text-gray-500 hover:text-[#000000] uppercase tracking-wider transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative shadow-xs">
            <div className="aspect-video w-full bg-gray-100 relative">
              <img 
                src={selectedProperty.images[activeDetailImageIndex]} 
                alt={selectedProperty.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />

              <div className="absolute top-4 left-4 flex gap-2">
                {selectedProperty.verified && (
                  <span className="bg-gray-700 text-white font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-sm shadow-md flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Deed Verified Storefront
                  </span>
                )}
                {selectedProperty.label && (
                  <span className="bg-[#000000] text-white font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-sm shadow-md">
                    {selectedProperty.label}
                  </span>
                )}
              </div>

              <button 
                onClick={(e) => handleSaveToggle(selectedProperty.id, e)}
                className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 z-10 cursor-pointer ${
                  user?.savedPropertyIds.includes(selectedProperty.id) ? 'bg-gray-50 text-gray-700' : 'bg-white/90 text-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${user?.savedPropertyIds.includes(selectedProperty.id) ? 'fill-current text-red-500' : ''}`} />
              </button>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto">
              {selectedProperty.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDetailImageIndex(idx)}
                  className={`w-20 h-14 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${idx === activeDetailImageIndex ? 'border-[#000000] scale-95' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-xs">
            <div className="space-y-1.5">
              <span className="px-3 py-0.5 rounded-xs text-[10px] font-black bg-gray-100 text-[#000000] uppercase border border-gray-200 inline-block">
                For {selectedProperty.type}
              </span>
              <h1 className="text-xl md:text-2.5xl font-black text-gray-900 tracking-tight leading-tight">
                {selectedProperty.title}
              </h1>
              <div className="flex items-center text-gray-500 text-xs font-semibold gap-1">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{selectedProperty.location}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[10px] text-gray-900 font-bold uppercase tracking-wider">Market Price</p>
                <p className="text-2.5xl font-black text-[#000000]">
                  {formatPrice(selectedProperty.price, selectedProperty.currency)}
                  {selectedProperty.type === 'rent' && <span className="text-xs font-semibold text-gray-500"> / month</span>}
                </p>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (selectedAgency) triggerContactAgency(selectedAgency, selectedProperty, undefined, 'enquiry');
                  }}
                  className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer"
                >
                  Enquire Now
                </button>
                <button
                  onClick={() => {
                    if (selectedAgency) triggerContactAgency(selectedAgency, selectedProperty, undefined, 'viewing');
                  }}
                  className="px-4 py-2.5 bg-[#000000] hover:bg-[#262626] text-white text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-md"
                >
                  Schedule Viewing
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Bedrooms</span>
                <p className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  <Bed className="w-4.5 h-4.5 text-[#000000]" />
                  {selectedProperty.beds !== null ? `${selectedProperty.beds} Bedrooms` : 'N/A Land'}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Bathrooms</span>
                <p className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  <Bath className="w-4.5 h-4.5 text-[#000000]" />
                  {selectedProperty.baths !== null ? `${selectedProperty.baths} Bathrooms` : 'N/A'}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Built-up Size</span>
                <p className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  <Maximize2 className="w-4.5 h-4.5 text-[#000000]" />
                  {selectedProperty.sizeSqm !== null ? `${selectedProperty.sizeSqm} m²` : 'N/A'}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Plot / Land Area</span>
                <p className="text-sm font-black text-gray-800 flex items-center gap-1.5">
                  <Layers className="w-4.5 h-4.5 text-[#000000]" />
                  {selectedProperty.plotSize || 'Standard Demarcation'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-gray-500 tracking-wide">Property Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {selectedProperty.description}
              </p>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-gray-100">
              <h3 className="text-xs font-black uppercase text-gray-500 tracking-wide">Amenities & Infrastructure</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {selectedProperty.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs font-bold text-gray-700 bg-gray-50 p-2 rounded-sm border border-gray-100">
                    <span className="text-gray-700 bg-gray-100 p-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3 fill-current text-white stroke-gray-700 stroke-2" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {selectedAgency && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 shadow-xs">
              <div className="text-center space-y-2 pb-4 border-b border-gray-100">
                <p className="text-[9px] bg-gray-100 text-gray-900 font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider inline-block">
                  Verified Broker License Verified
                </p>
                <div className="flex justify-center">
                  <img 
                    src={selectedAgency.logoUrl} 
                    alt={selectedAgency.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-sm font-black text-gray-900 flex items-center justify-center gap-1">
                  {selectedAgency.name}
                  <ShieldCheck className="w-4 h-4 text-gray-700" />
                </h3>
                <p className="text-[11px] text-gray-500 font-medium line-clamp-3 leading-relaxed">
                  {selectedAgency.bio}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs py-2 bg-gray-50 rounded-md border border-gray-100">
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Store Listings</span>
                  <span className="text-xs font-black text-gray-800">{selectedAgency.listingsCount} Properties</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase">Vetting Quality</span>
                  <span className="text-xs font-black text-gray-700">100% Secure</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  to={`/agency/${selectedAgency.id}`}
                  className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-[#000000] font-black rounded-md text-xs uppercase tracking-wider transition-colors cursor-pointer border border-gray-200 text-center block"
                >
                  Visit Seller Storefront
                </Link>
                
                <a 
                  href={`https://wa.me/${selectedAgency.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-800 text-white font-black rounded-md text-xs uppercase tracking-wider transition-colors cursor-pointer text-center block"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-xs">
            <h4 className="text-xs font-black uppercase text-gray-500 tracking-wide">Property Map Location</h4>
            <div className="w-full aspect-video rounded-md bg-stone-100 border border-gray-200 overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:12px_12px] opacity-70"></div>
              <div className="text-center z-10 space-y-1 p-4">
                <MapPin className="w-8 h-8 text-[#000000] mx-auto animate-bounce" />
                <p className="text-xs font-black text-gray-800">{selectedProperty.location}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">District Coordinates: {selectedProperty.lat}, {selectedProperty.lng}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Similar listings you might like</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties
            .filter(p => p.id !== selectedProperty.id && (p.district === selectedProperty.district || p.type === selectedProperty.type))
            .slice(0, 3)
            .map(prop => (
              <PropertyCard
                key={prop.id}
                property={prop}
                isSaved={user ? user.savedPropertyIds.includes(prop.id) : false}
                onSaveToggle={handleSaveToggle}
                onClick={(id) => { window.location.href = `/property/${id}`; }}
                onAgencyClick={(agencyId) => { window.location.href = `/agency/${agencyId}`; }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
