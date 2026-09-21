import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroCarousel } from '../components/HeroCarousel';
import { PropertyCard } from '../components/PropertyCard';
import { MessageSquare, Calendar, Building2, MapPin, Home as HomeIcon, Clock, TrendingUp, ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAppData } from '../context/DataContext';

const categoryTiles = [
  { label: 'Residential Units', to: '/marketplace?category=residential', icon: HomeIcon, match: (p: { isCommercial?: boolean; isShortStay?: boolean }) => !p.isCommercial && !p.isShortStay },
  { label: 'Commercial Buildings', to: '/marketplace?category=commercial', icon: Building2, match: (p: { isCommercial?: boolean }) => !!p.isCommercial },
  { label: 'Short-Stay Rentals', to: '/marketplace?category=short-stay', icon: Clock, match: (p: { isShortStay?: boolean }) => !!p.isShortStay },
  { label: 'Investment Yields', to: '/investments', icon: TrendingUp, match: (p: { type: string }) => p.type === 'invest' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, handleSaveToggle } = useAppContext();
  const { properties, agencies, loading } = useAppData();

  const featured = properties.filter((p) => p.label === 'Featured').slice(0, 3);
  // "Popular" is a real signal (view count from the DB), not a fabricated recommendation.
  const popular = [...properties].sort((a, b) => b.views - a.views).slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in mt-8 w-full">
      <HeroCarousel onExploreClick={() => navigate('/marketplace')} />

      {/* Quick-Action Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50/75 border border-gray-100 rounded-lg p-4 flex flex-col justify-between min-h-[110px] shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-gray-900 font-bold">
              <MessageSquare className="w-4 h-4 text-gray-700" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Chat to an Agency</h4>
            </div>
            <p className="text-[11px] text-gray-800 font-medium leading-relaxed">
              Instant WhatsApp chat with Uganda's leading verified property developers.
            </p>
          </div>
          <a href="https://wa.me/256702111222" target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase text-[#000000] tracking-wider underline mt-3 inline-block">
            Start a WhatsApp Chat →
          </a>
        </div>

        <div className="bg-gray-50/75 border border-gray-100 rounded-lg p-4 flex flex-col justify-between min-h-[110px] shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-gray-900 font-bold">
              <Calendar className="w-4 h-4 text-gray-700" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">Schedule a Viewing</h4>
            </div>
            <p className="text-[11px] text-gray-800 font-medium leading-relaxed">
              Book a free guided tour of any verified property before you make a decision.
            </p>
          </div>
          <Link to="/marketplace" className="text-[10px] font-black uppercase text-[#000000] tracking-wider underline mt-3 inline-block">
            Browse and Book →
          </Link>
        </div>

        <div className="bg-gray-50/75 border border-gray-100 rounded-lg p-4 flex flex-col justify-between min-h-[110px] shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-gray-900 font-bold">
              <Building2 className="w-4 h-4 text-gray-700" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">New Developments</h4>
            </div>
            <p className="text-[11px] text-gray-800 font-medium leading-relaxed">
              Discover off-plan investments and brand new apartment blocks coming soon.
            </p>
          </div>
          <Link to="/investments" className="text-[10px] font-black uppercase text-[#000000] tracking-wider underline mt-3 inline-block">
            Explore Off-Plan →
          </Link>
        </div>
      </div>

      {/* Browse by Category */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Browse by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categoryTiles.map((tile) => {
            const Icon = tile.icon;
            const count = properties.filter((p) => tile.match(p as never)).length;
            return (
              <Link
                key={tile.label}
                to={tile.to}
                className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center text-center gap-2 hover:shadow-lg hover:border-gray-300 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-black" />
                </div>
                <h4 className="text-xs font-bold text-gray-900">{tile.label}</h4>
                {!loading && <p className="text-[10px] text-gray-400 font-semibold">{count} listing{count === 1 ? '' : 's'}</p>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Listings */}
      {(loading || featured.length > 0) && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Featured Listings</h3>
            <Link to="/marketplace" className="text-[10px] font-black uppercase text-gray-500 hover:text-black tracking-wider flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isSaved={user ? user.savedPropertyIds.includes(prop.id) : false}
                  onSaveToggle={handleSaveToggle}
                  onClick={(id) => navigate(`/property/${id}`)}
                  onAgencyClick={(agencyId) => navigate(`/agency/${agencyId}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular Right Now — ranked by real view counts, not a fabricated recommendation engine */}
      {(loading || popular.length > 0) && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-black" />
            <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">Popular Right Now</h3>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-56 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popular.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  isSaved={user ? user.savedPropertyIds.includes(prop.id) : false}
                  onSaveToggle={handleSaveToggle}
                  onClick={(id) => navigate(`/property/${id}`)}
                  onAgencyClick={(agencyId) => navigate(`/agency/${agencyId}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trust Badges */}
      <div className="border-t border-gray-100 pt-6 mt-8 flex flex-wrap justify-center items-center gap-6 text-[10px] text-gray-400 font-bold uppercase text-center">
        <span className="flex items-center space-x-1.5"><MapPin className="w-3 h-3 text-gray-400" /><span>{properties.length}+ Verified Kampala Listings</span></span>
        <span className="flex items-center space-x-1.5"><span className="w-3 h-3 border border-gray-400 rounded-full flex items-center justify-center text-[7px] font-black">✓</span><span>{agencies.length} Genuine Partner Developers</span></span>
        <span className="flex items-center space-x-1.5"><Building2 className="w-3 h-3 text-gray-400" /><span>Secure Escrow Protection</span></span>
      </div>
    </div>
  );
};
