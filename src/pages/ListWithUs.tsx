import React, { useState } from 'react';
import { ShieldCheck, Zap, Users, LineChart, ChevronDown, Check, ArrowDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PlanCards } from '../components/PlanCards';
import { EarlyAccessBanner } from '../components/EarlyAccessBanner';
import { AgencyAutopilotCTA } from '../components/AgencyAutopilotCTA';

const valueProps = [
  {
    icon: Users,
    title: 'Reach real buyers',
    body: 'Your storefront sits alongside every other verified agency on the marketplace, in front of people actively searching — not cold outreach.',
  },
  {
    icon: ShieldCheck,
    title: 'The verified badge builds trust',
    body: 'Every listing you publish carries the same title-deed and business-registration verification buyers already trust Realto for.',
  },
  {
    icon: Zap,
    title: 'One dashboard, not five spreadsheets',
    body: 'Listings, leads, and viewing requests live in one place instead of scattered across WhatsApp threads and manual notes.',
  },
  {
    icon: LineChart,
    title: "See what's actually working",
    body: 'View and save counts per listing tell you which properties are getting attention, in real time.',
  },
];

const steps = [
  { title: 'Register', body: 'Create your account in minutes — agency or development name, contact details, and a password.' },
  { title: 'Verification', body: 'From your dashboard, submit your business registration and title-deed documentation for review.' },
  { title: 'Go live', body: 'Once approved, your storefront and listings go live on the marketplace, verified badge included.' },
];

const faqs = [
  { q: 'How long does verification take?', a: 'Our team typically completes business registration and title-deed checks within 2 business days of receiving your documents.' },
  { q: "Can I list properties I don't personally own?", a: 'Yes — as a registered agency or developer, you can list properties you have a documented mandate to sell or rent, subject to verification.' },
  { q: 'Is there a limit to how many listings I can publish?', a: 'That depends on your plan. Register your account and your dashboard will show what fits your portfolio.' },
  { q: 'What happens after I register?', a: 'You get access to your dashboard immediately. Submit your trade license and title-deed documentation there, and our East Africa verification team reviews it within 2 business days.' },
];

export const ListWithUs: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const scrollToContent = () => {
    document.getElementById('list-with-us-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 -mt-6">
      {/* Full-screen hero — breaks out of the app's centered max-w container, exactly fills the viewport below the nav */}
      <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen h-[calc(100vh-72px)] flex flex-col overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />

        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 py-8 min-h-0">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50 mb-4">For Agencies &amp; Developers</p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] max-w-3xl">
            List your properties where East Africa is looking to buy.
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-xl mt-5 leading-relaxed">
            A verified storefront, one dashboard for leads and listings, and instant reach to buyers already
            searching Realto — instead of five spreadsheets and a WhatsApp inbox.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-7">
            <button
              onClick={() => navigate('/portal/register')}
              className="px-7 py-3.5 bg-white text-black text-sm font-bold rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Register Your Agency
            </button>
            <Link
              to="/portal/login"
              className="px-7 py-3.5 border border-white/30 text-white text-sm font-bold rounded-md hover:bg-white/10 transition-colors"
            >
              Already registered? Sign in
            </Link>
          </div>

          <div className="flex items-center gap-6 mt-8 text-[11px] text-white/40 font-bold uppercase tracking-wide">
            <span>Verified badge</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>2-day verification</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>No listing caps on Pro+</span>
          </div>
        </div>

        <button
          onClick={scrollToContent}
          aria-label="Scroll to learn more"
          className="relative mb-6 mx-auto text-white/40 hover:text-white/80 transition-colors cursor-pointer animate-bounce shrink-0"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      <div id="list-with-us-content" className="space-y-16 scroll-mt-6">
        {/* Value props */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center">Why choose us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {valueProps.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white border border-gray-200 rounded-lg p-5 space-y-2 shadow-xs">
                  <div className="w-8 h-8 rounded-md bg-black text-white flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{v.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive demo band — full-bleed, breaks out of the centered container like the hero */}
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <AgencyAutopilotCTA onPartnerClick={() => navigate('/portal/register')} />
        </div>

        {/* How it works */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <div key={s.title} className="bg-white border border-gray-200 rounded-lg p-5 space-y-2 shadow-xs">
                <span className="text-[11px] font-black text-gray-300">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-sm font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Plans for every size</h2>
            <p className="text-xs text-gray-500">Register and your dashboard will help you find the right fit — pricing available on request.</p>
          </div>
          <EarlyAccessBanner onGetStarted={() => navigate('/portal/register')} />
          <PlanCards onGetStarted={() => navigate('/portal/register')} />
        </div>

        {/* FAQ */}
        <div className="space-y-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center">Common questions</h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-xs divide-y divide-gray-100">
            {faqs.map((item, idx) => (
              <div key={item.q}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-900">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && <p className="px-6 pb-4 text-[11px] text-gray-600 leading-relaxed">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <div className="bg-black rounded-lg p-8 sm:p-10 text-center space-y-4">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Ready to list on Realto?</h3>
          <p className="text-xs text-white/60 max-w-md mx-auto">Register your agency or development and submit verification documents from your dashboard.</p>
          <button
            onClick={() => navigate('/portal/register')}
            className="px-6 py-3 bg-white text-black text-xs font-bold rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Register Your Agency
          </button>
          <p className="text-[11px] text-white/40">
            Already registered?{' '}
            <Link to="/portal/login" className="underline hover:text-white/70">
              Sign in to your console
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
