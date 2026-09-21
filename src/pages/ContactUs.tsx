import React from 'react';
import { Mail, MessageCircle, Phone, MapPin } from 'lucide-react';

export const ContactUs: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs space-y-2 text-center">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Contact Realto</h2>
        <p className="text-xs text-gray-500 font-medium">
          For questions about a specific listing, use the "Contact Agency" button on that property instead — it goes directly to the agency handling it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="https://wa.me/256702111222"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center gap-2 hover:shadow-lg transition-all"
        >
          <MessageCircle className="w-6 h-6 text-black" />
          <h4 className="text-xs font-bold text-gray-900">WhatsApp</h4>
          <p className="text-[11px] text-gray-500">+256 702 111 222</p>
        </a>
        <a
          href="mailto:support@realto.ug"
          className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center gap-2 hover:shadow-lg transition-all"
        >
          <Mail className="w-6 h-6 text-black" />
          <h4 className="text-xs font-bold text-gray-900">Email</h4>
          <p className="text-[11px] text-gray-500">support@realto.ug</p>
        </a>
        <a
          href="tel:+256702111222"
          className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col items-center text-center gap-2 hover:shadow-lg transition-all"
        >
          <Phone className="w-6 h-6 text-black" />
          <h4 className="text-xs font-bold text-gray-900">Call Us</h4>
          <p className="text-[11px] text-gray-500">+256 702 111 222</p>
        </a>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-xs flex items-start gap-3">
        <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-gray-900">Head Office</h4>
          <p className="text-xs text-gray-500 mt-1">Kampala, Uganda — serving Kampala, Entebbe, and Wakiso.</p>
        </div>
      </div>
    </div>
  );
};
