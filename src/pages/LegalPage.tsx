import React from 'react';
import { AlertTriangle } from 'lucide-react';

const content: Record<'terms' | 'privacy' | 'cookies', { title: string; sections: { heading: string; body: string }[] }> = {
  terms: {
    title: 'Terms of Service',
    sections: [
      { heading: '1. Acceptance of Terms', body: 'By accessing or using the Realto marketplace, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.' },
      { heading: '2. Marketplace Role', body: 'Realto is a consumer-facing listings marketplace. Listings are published exclusively by verified agencies and developers who have completed our deed and business registration checks. Realto does not itself own, sell, or lease any property listed on the platform.' },
      { heading: '3. Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.' },
      { heading: '4. Listing Accuracy', body: 'While every listing undergoes a verification check before publication, Realto does not guarantee the continued accuracy of price, availability, or condition after publication. Always confirm details directly with the listing agency before making a commitment.' },
      { heading: '5. Limitation of Liability', body: 'Realto is not a party to any transaction between a buyer/renter and an agency, and is not liable for disputes, losses, or damages arising from such transactions.' },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { heading: '1. Information We Collect', body: 'We collect account information you provide (name, email, phone), your saved properties, and messages you send to agencies through the platform.' },
      { heading: '2. How We Use It', body: 'Your information is used to operate your account, connect you with agencies you contact, and improve the marketplace experience.' },
      { heading: '3. Sharing', body: 'When you contact an agency about a listing or schedule a viewing, your name, email, and phone number are shared with that agency so they can respond to you.' },
      { heading: '4. Data Retention', body: 'Account data is retained for as long as your account is active. You may request deletion of your account and associated data at any time.' },
      { heading: '5. Your Rights', body: 'You may access, correct, or delete your personal information by contacting support@realto.ug.' },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    sections: [
      { heading: '1. What Cookies We Use', body: 'Realto uses essential cookies to keep you signed in and remember your session. We do not currently use third-party advertising or tracking cookies.' },
      { heading: '2. Managing Cookies', body: 'You can control or delete cookies through your browser settings. Disabling essential cookies may prevent you from staying signed in.' },
    ],
  },
};

export const LegalPage: React.FC<{ page: 'terms' | 'privacy' | 'cookies' }> = ({ page }) => {
  const { title, sections } = content[page];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 text-amber-800">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          This is placeholder template content for demo purposes — not reviewed or approved legal text. Have a lawyer review and adapt this before using it in a real product.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{title}</h2>
          <p className="text-[11px] text-gray-400 font-semibold mt-1">Last updated: August 2026</p>
        </div>

        <div className="space-y-5">
          {sections.map((s) => (
            <div key={s.heading} className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-900">{s.heading}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
