/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  keyDetails: string[];
  price: string;
  priceLabel: string;
  image: string;
  badge: string;
  badgeType: 'new' | 'verify' | 'off-plan' | 'investment';
  actionLabel: string;
  category: 'buy' | 'rent' | 'invest';
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'Executive Apartments in Kololo & Nakasero',
    subtitle: 'High-end furnished penthouses and executive apartments from top Ugandan developers.',
    keyDetails: [
      'Spectacular Kampala skyline views',
      'Standby backup generator & solar capacity',
      'Secure access with 24/7 manned security'
    ],
    price: 'USD 185,000',
    priceLabel: 'Starting Market Price',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    badge: 'New listing',
    badgeType: 'new',
    actionLabel: 'Browse Penthouses',
    category: 'buy'
  },
  {
    id: 2,
    title: 'Vetted & Registered Plots of Land',
    subtitle: 'Secure titled Mailo plots in Kira, Wakiso, Mukono and Entebbe.',
    keyDetails: [
      '100% verified land registry check',
      'Immediate electricity & water connection',
      'Located in fast-growing secure neighborhoods'
    ],
    price: 'UGX 25,000,000',
    priceLabel: 'Direct Developer Rate',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    badge: 'Verified',
    badgeType: 'verify',
    actionLabel: 'Explore Land Plots',
    category: 'buy'
  },
  {
    id: 3,
    title: 'Kampala Premium High-Rise Investment',
    subtitle: 'Participate early in high-yield commercial and residential co-funded projects.',
    keyDetails: [
      '14.5% target annual net yield',
      'Escrow-backed investment structures',
      'Fully managed hands-free cashflow'
    ],
    price: '14.5% Annual ROI',
    priceLabel: 'Estimated Dividends Yield',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    badge: 'Off-plan',
    badgeType: 'off-plan',
    actionLabel: 'View Investment Shares',
    category: 'invest'
  }
];

interface HeroCarouselProps {
  onExploreClick?: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onExploreClick }) => {
  const collageImages = [slides[0].image, slides[1].image, slides[2].image];

  return (
    <div className="w-full" id="hero-banner">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Left: Bold black headline, Tubayo-style */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight leading-[1.05]">
            Property you can<br />actually trust
          </h1>
          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed max-w-md">
            Realto connects you to verified agencies and developers across Uganda — every deed checked, every listing real, from launch to keys in hand.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-black hover:bg-gray-800 text-white font-bold text-sm rounded-md transition-colors cursor-pointer"
            >
              Start Browsing
            </button>
            <a href="#verified" className="text-sm font-bold text-black underline underline-offset-4 decoration-gray-300 hover:decoration-black transition-colors">
              Why every listing is verified
            </a>
          </div>
        </div>

        {/* Right: Asymmetric photo collage, Tubayo-style, no text overlay */}
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 aspect-[16/7] rounded-lg overflow-hidden bg-gray-100">
            <img src={collageImages[0]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
            <img src={collageImages[1]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
            <img src={collageImages[2]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
          </div>
        </div>

      </div>
    </div>
  );
};
