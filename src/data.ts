/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Property, Agency, InvestmentOpportunity } from './types';

export const agencies: Agency[] = [
  {
    id: 'agency-1',
    name: 'Kampala Premier Homes',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=120&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    bio: 'Uganda\'s leading luxury boutique real estate agency, specializing in premium residential sales and rentals in Kololo, Nakasero, Muyenga, and Lubowa. Registered & certified.',
    verified: true,
    phone: '+256 702 111 222',
    whatsapp: '+256702111222',
    email: 'info@kampalapremier.co.ug',
    listingsCount: 6
  },
  {
    id: 'agency-2',
    name: 'Victoria Lakeview Developers',
    logoUrl: 'https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&w=120&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    bio: 'Pioneers in premium waterfront living in Munyonyo and Entebbe. Delivering top-tier apartments and gated communities with unmatched quality and high rental yields.',
    verified: true,
    phone: '+256 772 444 555',
    whatsapp: '+256772444555',
    email: 'sales@victorialakeview.com',
    listingsCount: 4
  },
  {
    id: 'agency-3',
    name: 'Equator Land & Estates',
    logoUrl: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=120&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    bio: 'Your trusted partner for verified, titled land plots, affordable multi-family houses, and fast-growing development opportunities across Kira, Wakiso, Mukono, and Jinja.',
    verified: true,
    phone: '+256 752 888 999',
    whatsapp: '+256752888999',
    email: 'contact@equatorlands.co.ug',
    listingsCount: 5
  }
];

export const properties: Property[] = [
  {
    id: 'prop-1',
    title: 'Executive 3 Bedroom Penthouse with Lake View',
    type: 'buy',
    price: 185000,
    currency: 'USD',
    location: 'Munyonyo, near Speke Resort',
    district: 'Kampala',
    lat: 0.2411,
    lng: 32.6174,
    beds: 3,
    baths: 4,
    sizeSqm: 240,
    plotSize: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Breathtaking 3-bedroom, 4-bathroom luxury penthouse offering panoramic views of Lake Victoria. Features include standard infinity pool access, floor-to-ceiling glass windows, biometric access control, executive finishes, and 24/7 armed security. Located just 2 minutes from Speke Resort Munyonyo.',
    amenities: ['Lake View', 'Swimming Pool', '24/7 Security', 'Gym', 'High-Speed Lift', 'Standby Generator', 'Biometric Access'],
    agencyId: 'agency-2',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Flash Deal',
    views: 1240
  },
  {
    id: 'prop-2',
    title: 'Modern 2 Bedroom Serviced Apartment',
    type: 'rent',
    price: 3200000, // UGX
    currency: 'UGX',
    location: 'Bukoto Street, Bukoto',
    district: 'Kampala',
    lat: 0.3475,
    lng: 32.5961,
    beds: 2,
    baths: 2,
    sizeSqm: 110,
    plotSize: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502005229762-fc1b2b812ca5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Fully furnished and serviced 2-bedroom apartment located in the lively Bukoto neighborhood. Monthly rent includes high-speed fiber internet, housekeeping 3 times a week, water, and full security. Power is paid separately via Yaka prepay meter. Perfect for expats and corporate professionals.',
    amenities: ['Furnished', 'Serviced', 'Fiber Internet', 'Housekeeping', 'CCTV Cameras', 'Yaka Meter', 'Ample Parking'],
    agencyId: 'agency-1',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Price Reduced',
    views: 890
  },
  {
    id: 'prop-3',
    title: 'Luxurious 5 Bedroom Mansion with Pool',
    type: 'buy',
    price: 520000, // USD
    currency: 'USD',
    location: 'Hilltop Muyenga, Kampala',
    district: 'Kampala',
    lat: 0.2986,
    lng: 32.6078,
    beds: 5,
    baths: 6,
    sizeSqm: 550,
    plotSize: '25 Decimals (Titled)',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Perched on the prestigious hills of Muyenga, this architecturally stunning 5-bedroom home offers panoramic Kampala city skyline views. It boasts a private swimming pool, custom mahogany wood fittings, a master suite with walk-in closet and jacuzzi, two self-contained boy quarters, a mature tropical garden, and double garage.',
    amenities: ['Private Pool', 'City View', 'Jacuzzi', 'Mature Garden', 'Boys Quarters', 'Titled Mailo Land', 'Solar Power Backup'],
    agencyId: 'agency-1',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Hot Deal',
    views: 3120
  },
  {
    id: 'prop-4',
    title: 'Titled Residential Land Plot (50ft x 100ft)',
    type: 'buy',
    price: 78000000, // UGX
    currency: 'UGX',
    location: 'Kira Town, near Kampala Northern Bypass',
    district: 'Wakiso',
    lat: 0.3951,
    lng: 32.6394,
    beds: null,
    baths: null,
    sizeSqm: 465,
    plotSize: '50ft x 100ft (11.5 Decimals)',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A prime, flat, ready-to-build dry land plot in Kira Town. Features immediate access to electricity and municipal water lines. Neighborhood is upscale and secure with newly paved tarmac access roads. Titled Mailo land with clean ownership documents ready for transfer.',
    amenities: ['Titled Mailo Land', 'Water Connection Ready', 'Electricity Grid Ready', 'Tarmac Road Access', 'Gated Neighborhood'],
    agencyId: 'agency-3',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'New',
    views: 1450
  },
  {
    id: 'prop-5',
    title: 'Upmarket 1 Bedroom Studio Loft',
    type: 'rent',
    price: 1500000, // UGX
    currency: 'UGX',
    location: 'Luthuli Avenue, Bugolobi',
    district: 'Kampala',
    lat: 0.3168,
    lng: 32.6105,
    beds: 1,
    baths: 1.5,
    sizeSqm: 65,
    plotSize: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Industrial-chic 1-bedroom loft apartment on Luthuli Avenue, Bugolobi. Super close to Village Mall and top restaurants. The apartment has brick accent walls, high ceilings, large windows, a guest washroom, private balcony, and high-quality built-in gas stove. Ideal for single professionals.',
    amenities: ['Balcony', 'Gas Stove Built-in', 'Gated Access', 'Borehole Water', 'Walk to Mall', 'Backup Power'],
    agencyId: 'agency-1',
    agentId: null,
    status: 'available',
    verified: false,
    label: 'Just Listed',
    views: 520
  },
  {
    id: 'prop-6',
    title: 'The Heights Kololo - Luxury 2BR Off-Plan Investment',
    type: 'invest',
    price: 125000, // USD
    currency: 'USD',
    location: 'Summit View Road, Kololo',
    district: 'Kampala',
    lat: 0.3341,
    lng: 32.5898,
    beds: 2,
    baths: 2,
    sizeSqm: 105,
    plotSize: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An premium investment opportunity to purchase off-plan 2-bedroom units in Kololo summit. Backed by guaranteed 14.5% annual ROI rental yield upon completion. Staged flexible payment schedules over 18 months. Developed by Kampala Premier Group.',
    amenities: ['14.5% Rental Yield', 'Kololo Summit Location', 'Escrow Account', 'Rooftop Lounge', 'Flexible Payment Plan', 'Swimming Pool'],
    agencyId: 'agency-1',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Off-Plan',
    views: 2450
  },
  {
    id: 'prop-7',
    title: 'Premium Multi-Family Block of 4 Units',
    type: 'buy',
    price: 650000000, // UGX
    currency: 'UGX',
    location: 'Namugongo, near Basilica',
    district: 'Wakiso',
    lat: 0.3888,
    lng: 32.6510,
    beds: 8, // 4 apartments x 2 bedrooms each
    baths: 8,
    sizeSqm: 480,
    plotSize: '15 Decimals Titled',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Excellent rental income generator. Contains 4 fully finished, modern units (each 2 beds, 2 baths). Currently generating a total monthly rent of UGX 5,200,000 (average UGX 1,300,000 per unit). 100% occupancy history. Separated power and water meters for every unit. Security guard house and paved compound.',
    amenities: ['Instant Rental Income', 'Separate Water/Yaka Meters', 'Paved Compound', 'Security Post', 'Titled Mailo', 'High Occupancy History'],
    agencyId: 'agency-3',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'High Yield',
    views: 1890
  },
  {
    id: 'prop-8',
    title: 'Victoria Marina Lakeside 1BR Fractional Deal',
    type: 'invest',
    price: 15000, // USD
    currency: 'USD',
    location: 'Munyonyo Waterfront, Kampala',
    district: 'Kampala',
    lat: 0.2398,
    lng: 32.6185,
    beds: 1,
    baths: 1,
    sizeSqm: 55,
    plotSize: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Co-own a premium lakeview hotel apartment inside Victoria Marina. Fractionalized ownership lets you buy a 1/10th share of a fully-managed luxury hotel suite. Earn monthly dividends from pooled room revenues with zero maintenance effort. Projected ROI is 12% USD annual yield.',
    amenities: ['12% USD Yield', 'Waterfront Location', 'Fully Managed Asset', 'Hotel Revenue Pool', 'Yearly Free Stays'],
    agencyId: 'agency-2',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Fractional',
    views: 3110
  },
  {
    id: 'prop-9',
    title: '4-Storey Commercial Building on Kampala Road',
    type: 'buy',
    price: 1200000000, // UGX 1.2 Billion
    currency: 'UGX',
    location: 'Kampala Road, Central Business District',
    district: 'Kampala',
    lat: 0.3136,
    lng: 32.5812,
    beds: null,
    baths: 8,
    sizeSqm: 850,
    plotSize: '10 Decimals Leasehold',
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High traffic commercial building situated directly along Kampala Road. Outstanding visibility. Perfect for retail outlets, bank branches, insurance head offices, or corporate clinics. The ground floor holds 4 prime shops, and upper floors have open-plan offices. Full commercial license and fire safety certified.',
    amenities: ['CBD Location', 'Tarmac Main Road', 'High Foot Traffic', 'Fire Safety Certified', 'Leasehold Title', 'Underground Parking'],
    agencyId: 'agency-3',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Commercial',
    views: 1980,
    isCommercial: true
  },
  {
    id: 'prop-10',
    title: 'Entebbe Lakeside Estate Fractional Plots',
    type: 'invest',
    price: 25000000, // UGX
    currency: 'UGX',
    location: 'Kigungu, Entebbe',
    district: 'Entebbe',
    lat: 0.0450,
    lng: 32.4410,
    beds: null,
    baths: null,
    sizeSqm: 200,
    plotSize: '2.5 Decimals Shared Block',
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Invest in premium Entebbe land plots with a collective investment structure. Land value is projected to double in 3 years due to Entebbe Expressway expansion and eco-tourism growth. High liquidity exit options managed directly by Equator Lands.',
    amenities: ['High Land Appreciation', 'Expressway Access', 'Titled Collective Registry', 'Fenced Boundary', 'Waterfront Access'],
    agencyId: 'agency-3',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Land Investment',
    views: 1110
  },
  {
    id: 'prop-11',
    title: 'Modern Office Space in Nakasero Business District',
    type: 'rent',
    price: 4500000, // UGX
    currency: 'UGX',
    location: 'Nakasero Hill, Kampala',
    district: 'Kampala',
    lat: 0.3245,
    lng: 32.5785,
    beds: null,
    baths: 2,
    sizeSqm: 150,
    plotSize: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'High-end fully partitioned office space ready for occupancy in Nakasero. Features central air-conditioning, backup generator, high-speed elevators, 3 reserved parking spots, and professional reception desk services.',
    amenities: ['Air Conditioning', 'Standby Generator', 'High-Speed Lift', 'Fiber Internet', 'Reserved Parking', '24/7 Access'],
    agencyId: 'agency-1',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Commercial',
    views: 740,
    isCommercial: true
  },
  {
    id: 'prop-12',
    title: 'Spacious Industrial Warehouse with Loading Dock',
    type: 'buy',
    price: 380000, // USD
    currency: 'USD',
    location: 'Industrial Area, Kampala',
    district: 'Kampala',
    lat: 0.3120,
    lng: 32.5995,
    beds: null,
    baths: 4,
    sizeSqm: 1200,
    plotSize: '0.5 Acres (Titled)',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'A heavy-duty 1200 Sqm warehouse in Kampala Industrial Area. Offers reinforced concrete floors, 8m ceiling height, multiple 3-phase electricity meters, secure boundary walls, and double wide loading docks for heavy trucks.',
    amenities: ['3-Phase Power', 'Loading Dock', 'High Ceiling', 'Container Access', 'Secure Perimeter', 'Titled Mailo Land'],
    agencyId: 'agency-3',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Commercial',
    views: 450,
    isCommercial: true
  },
  {
    id: 'prop-13',
    title: 'Luxury Short-stay Penthouse on Kololo Hill',
    type: 'rent',
    price: 150, // USD per night
    currency: 'USD',
    location: 'Kololo Hill Road, Kampala',
    district: 'Kampala',
    lat: 0.3298,
    lng: 32.5912,
    beds: 1,
    baths: 1,
    sizeSqm: 85,
    plotSize: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Stunning fully furnished 1-bedroom short-stay penthouse offering executive level comfort. Ideal for international tourists or business executives. Monthly bookings receive a 25% discount. Includes standard smart TV, private balcony, pool, and daily housekeeping.',
    amenities: ['Furnished', 'Daily Housekeeping', 'Rooftop Pool', 'Smart TV', 'Fiber Internet', '24/7 Security'],
    agencyId: 'agency-1',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Short-stay',
    views: 1840,
    isShortStay: true,
    pricePeriod: 'night'
  },
  {
    id: 'prop-14',
    title: 'Victoria Lakeside Cozy Short-stay Cottage',
    type: 'rent',
    price: 350000, // UGX per night
    currency: 'UGX',
    location: 'Waterfront Road, Entebbe',
    district: 'Entebbe',
    lat: 0.0410,
    lng: 32.4550,
    beds: 2,
    baths: 2,
    sizeSqm: 110,
    plotSize: 'N/A',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'An idyllic weekend escape. Enjoy the gentle sound of waves from the veranda of this newly furnished lakeside cottage. Featuring high-grade appliances, organic cotton sheets, private BBQ grill pit, and secure fenced compound.',
    amenities: ['Lake View', 'Private BBQ Pit', 'Furnished', 'Smart TV', 'Chef Service Optional', 'Gated Access'],
    agencyId: 'agency-2',
    agentId: null,
    status: 'available',
    verified: true,
    label: 'Short-stay',
    views: 2150,
    isShortStay: true,
    pricePeriod: 'night'
  }
];

export const investmentOpportunities: InvestmentOpportunity[] = [
  {
    id: 'invest-1',
    propertyId: 'prop-6',
    projectedRoi: 14.5,
    minInvestment: 12500,
    minInvestmentCurrency: 'USD',
    fundingProgressPct: 78,
    completionDate: 'Dec 2027',
    opportunityType: 'off-plan',
    investorsCount: 42,
    targetFunding: '$1,200,000'
  },
  {
    id: 'invest-2',
    propertyId: 'prop-8',
    projectedRoi: 12.0,
    minInvestment: 5000,
    minInvestmentCurrency: 'USD',
    fundingProgressPct: 92,
    completionDate: 'Ready',
    opportunityType: 'fractional',
    investorsCount: 118,
    targetFunding: '$600,000'
  },
  {
    id: 'invest-3',
    propertyId: 'prop-10',
    projectedRoi: 18.2,
    minInvestment: 10000000, // 10m UGX
    minInvestmentCurrency: 'UGX',
    fundingProgressPct: 45,
    completionDate: 'Jun 2028',
    opportunityType: 'land',
    investorsCount: 31,
    targetFunding: 'UGX 800,000,000'
  }
];
