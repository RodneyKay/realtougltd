import React, { useState } from 'react';
import { ShieldCheck, Zap, Users, LineChart, ChevronDown, Check } from 'lucide-react';
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
    title: 'See what\'s actually working',
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
  { q: 'Can I list properties I don\'t personally own?', a: 'Yes — as a registered agency or developer, you can list properties you have a documented mandate to sell or rent, subject to verification.' },
  { q: 'Is there a limit to how many listings I can publish?', a: 'That depends on your plan. Register your account and your dashboard will show what fits your portfolio.' },
  { q: 'What happens after I register?', a: 'You get access to your dashboard immediately. Submit your trade license and title-deed documentation there, and our East Africa verification team reviews it within 2 business days.' },
];

export const Partners: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-16">
      {/* Hero — the interactive autopilot CTA */}
      <div className="rounded-lg overflow-hidden">
        <AgencyAutopilotCTA onPartnerClick={() => navigate('/portal/register')} />
      </div>

      {/* Value props */}
      <div className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Why agencies partner with Realto</h2>
          <p className="text-xs text-gray-500">Uganda's high-density e-commerce portal for properties, built for the agencies and developers who publish to it.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {valueProps.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="bg-white border border-gray-200 rounded-lg p-5 space-y-2 shadow-xs">
                <Icon className="w-5 h-5 text-black" />
                <h4 className="text-xs font-bold text-gray-900">{v.title}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">{v.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.title} className="space-y-2 text-center sm:text-left">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-black mx-auto sm:mx-0">
                {i + 1}
              </div>
              <h4 className="text-xs font-bold text-gray-900">{s.title}</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Plans for every size</h2>
          <p className="text-xs text-gray-500">Reach out and our team will help you find the right fit — pricing available on request.</p>
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
  );
};
