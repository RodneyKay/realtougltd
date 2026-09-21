import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does Realto verify a listing?',
    a: 'Every plot, apartment, or commercial offering is checked against physical land registers and cadastral maps to confirm authentic title deed ownership before it goes live on the marketplace.',
  },
  {
    q: 'Can I list a property directly as a landlord?',
    a: 'No — Realto is consumer-facing only. Listings are published exclusively by verified agencies and developers who have completed our deed and company registry audits. If you\'re an agency or developer, see "Partner with us" in the footer.',
  },
  {
    q: 'How do I schedule a property viewing?',
    a: 'Open any listing and select "Schedule a Viewing" to pick a date and time. The agency handling that listing receives your request directly.',
  },
  {
    q: 'Is there a fee to browse or save properties?',
    a: 'Browsing, saving properties to your watchlist, and contacting agencies is completely free for buyers and renters.',
  },
  {
    q: 'What does the "verified" badge mean?',
    a: 'A verified badge means the listing or agency has passed our title-deed and business registration checks. Unverified listings are not permitted on the platform.',
  },
];

export const HelpCenter: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-2 text-center">
        <HelpCircle className="w-8 h-8 text-black mx-auto" />
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Help Center</h2>
        <p className="text-xs text-gray-500 font-medium">Answers to common questions about buying, renting, and investing on Realto.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-xs divide-y divide-gray-100">
        {faqs.map((item, idx) => (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
            >
              <span className="text-sm font-bold text-gray-900">{item.q}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <p className="px-6 pb-4 text-xs text-gray-600 leading-relaxed">{item.a}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-gray-900">Still need help?</h4>
          <p className="text-xs text-gray-500">Our support team responds within one business day.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/256702111222"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-bold rounded-md hover:bg-gray-800 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <a
            href="mailto:support@realto.ug"
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-xs font-bold rounded-md hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </a>
        </div>
      </div>
    </div>
  );
};
