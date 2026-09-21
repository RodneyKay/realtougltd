/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Facebook, Instagram, Twitter, Linkedin, MessageCircle, Mail, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200 mt-16">
      {/* Lightweight partner banner — the full interactive pitch lives on /list-with-us */}
      <div className="bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-tight">Are you an agency or developer?</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">See what running your storefront on autopilot looks like.</p>
          </div>
          <Link
            to="/list-with-us"
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white text-black text-[11px] font-bold rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            List With Us <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Link columns */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 text-xs border-b border-gray-200">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-3 pr-4">
          <div className="flex items-center space-x-1.5 text-black font-bold text-sm">
            <Landmark className="w-5 h-5 text-black" />
            <span>Realto Marketplace</span>
          </div>
          <p className="text-gray-500 leading-relaxed">
            Uganda's high-density e-commerce portal for properties. We partner exclusively with certified development groups and accredited real estate brokers to keep our consumer base safe from scams.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-400 hover:text-black transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-black transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="text-gray-400 hover:text-black transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-black transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-black font-bold text-xs uppercase tracking-wide">Marketplace</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link to="/marketplace?category=residential" className="hover:text-black hover:underline transition-colors">Residential Units</Link></li>
            <li><Link to="/marketplace?category=commercial" className="hover:text-black hover:underline transition-colors">Commercial Buildings</Link></li>
            <li><Link to="/marketplace?category=short-stay" className="hover:text-black hover:underline transition-colors">Short-Stay Rentals</Link></li>
            <li><Link to="/investments" className="hover:text-black hover:underline transition-colors">Investment Yields</Link></li>
            <li><Link to="/saved" className="hover:text-black hover:underline transition-colors">Saved Watchlist</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-black font-bold text-xs uppercase tracking-wide">For Agencies</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link to="/list-with-us" className="hover:text-black hover:underline transition-colors">List With Us</Link></li>
            <li><Link to="/agencies" className="hover:text-black hover:underline transition-colors">Verified Agency Directory</Link></li>
            <li><Link to="/portal/login" className="hover:text-black hover:underline transition-colors">Agency & Developer Login</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-black font-bold text-xs uppercase tracking-wide">Support</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link to="/help" className="hover:text-black hover:underline transition-colors">Help Center</Link></li>
            <li><Link to="/contact" className="hover:text-black hover:underline transition-colors">Contact Us</Link></li>
            <li>
              <a href="https://wa.me/256702111222" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-black hover:underline transition-colors">
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </a>
            </li>
            <li>
              <a href="mailto:support@realto.ug" className="flex items-center gap-1.5 hover:text-black hover:underline transition-colors">
                <Mail className="w-3 h-3" /> support@realto.ug
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="text-black font-bold text-xs uppercase tracking-wide">Legal</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link to="/terms" className="hover:text-black hover:underline transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-black hover:underline transition-colors">Privacy Policy</Link></li>
            <li><Link to="/cookies" className="hover:text-black hover:underline transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
        <span>&copy; {new Date().getFullYear()} Realto East Africa. All rights reserved.</span>
        <span className="text-gray-500 normal-case font-semibold tracking-normal">Kampala • Entebbe • Wakiso</span>
      </div>
    </footer>
  );
};
