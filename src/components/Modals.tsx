/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle2, User, Phone, Mail, Calendar, Clock, Sparkles } from 'lucide-react';
import { Agency, Property, InvestmentOpportunity } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  agency: Agency;
  property?: Property;
  investment?: InvestmentOpportunity;
  onSubmit: (details: { name: string; email: string; phone: string; message: string; type: 'viewing' | 'enquiry' | 'investment'; scheduledAt?: string }) => Promise<void>;
  initialType?: 'viewing' | 'enquiry' | 'investment';
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  agency,
  property,
  investment,
  onSubmit,
  initialType = 'enquiry'
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    property 
      ? `Hello, I am interested in "${property.title}" located in ${property.location}. Please provide more details.` 
      : investment 
        ? `Hello, I want to express my interest in the investment opportunity for "${property?.title || 'Investment'}" with projected ROI of ${investment.projectedRoi}%.`
        : `Hello ${agency.name}, I would like to get in touch regarding your active listings on Realto.`
  );
  const [type, setType] = useState<'viewing' | 'enquiry' | 'investment'>(initialType);
  const [viewingDate, setViewingDate] = useState('');
  const [viewingTime, setViewingTime] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || submitting) return;
    setSubmitError(null);

    let fullMessage = message;
    let scheduledAt: string | undefined;
    if (type === 'viewing') {
      fullMessage = `[Viewing Scheduled for ${viewingDate} at ${viewingTime}] - ${message}`;
      if (viewingDate && viewingTime) {
        scheduledAt = new Date(`${viewingDate}T${viewingTime}`).toISOString();
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name,
        email,
        phone,
        message: fullMessage,
        type,
        scheduledAt,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'We could not send your request. Please try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
      // Reset
      setName('');
      setEmail('');
      setPhone('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100" id="contact-agency-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {type === 'viewing' ? 'Schedule a Viewing' : type === 'investment' ? 'Express Interest' : 'Contact Verified Agency'}
            </h3>
            <p className="text-xs text-gray-500">Direct connection via Realto Marketplace</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            id="close-contact-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-gray-100 text-gray-700 rounded-full">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Inquiry Sent Successfully!</h4>
            <p className="text-sm text-gray-600 max-w-sm">
              We have dispatched your request directly to <strong>{agency.name}</strong>. An agent will contact you shortly via phone or WhatsApp.
            </p>
            <p className="text-xs text-gray-400">Your interaction has been saved to your Contact History.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Agency/Listing Context */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <img 
                src={agency.logoUrl} 
                alt={agency.name} 
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 font-semibold uppercase tracking-wider">Agent Representative</p>
                <p className="text-sm font-bold text-gray-900 truncate">{agency.name}</p>
                {property && (
                  <p className="text-xs text-gray-600 truncate">Re: {property.title}</p>
                )}
              </div>
            </div>

            {/* Type selector if both possible */}
            {property && property.type !== 'invest' && (
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType('enquiry')}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${type === 'enquiry' ? 'bg-white text-[#000000] shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  General Enquiry
                </button>
                <button
                  type="button"
                  onClick={() => setType('viewing')}
                  className={`py-2 text-xs font-bold rounded-md transition-all ${type === 'viewing' ? 'bg-white text-[#000000] shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Schedule Viewing
                </button>
              </div>
            )}

            {/* Date/Time for Viewing */}
            {type === 'viewing' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={viewingDate}
                      onChange={(e) => setViewingDate(e.target.value)}
                      className="w-full pl-9 pr-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="time"
                      required
                      value={viewingTime}
                      onChange={(e) => setViewingTime(e.target.value)}
                      className="w-full pl-9 pr-2 py-1.5 text-xs bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Input fields */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Your Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Phone / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+256 700 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Message</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the developer/agency what you are looking for..."
                  className="w-full p-3 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000] resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            {submitError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#000000] hover:bg-[#262626] text-white font-bold rounded-md shadow-sm transition-all focus:outline-none cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{submitting ? 'Sending…' : 'Send Marketplace Request'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

interface LoginModalProps {
  isOpen: boolean;
  mode?: 'login' | 'register';
  onSwitchMode?: (mode: 'login' | 'register') => void;
  onClose: () => void;
  onLogin: (details: { email: string; password: string }) => Promise<void>;
  onRegister: (details: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  authError?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, mode = 'login', onSwitchMode, onClose, onLogin, onRegister, authError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (isRegister && (!name || !email || !password)) {
      setLocalError('Name, email, and password are required.');
      return;
    }
    if (!isRegister && (!email || !password)) {
      setLocalError('Email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        await onRegister({ name, email, phone: phone || '', password });
      } else {
        await onLogin({ email, password });
      }
    } catch {
      // authError from context already surfaces the message; nothing else to do here.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#000000]" />
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h3>
            <p className="text-xs text-gray-500">Your East Africa real-estate gateway</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login / Register toggle */}
        <div className="flex mx-6 mt-4 bg-gray-100 rounded-md p-1">
          <button
            type="button"
            onClick={() => onSwitchMode && onSwitchMode('login')}
            className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${!isRegister ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode && onSwitchMode('register')}
            className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${isRegister ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ronald Kayonde"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. ronald@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Password</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
            />
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Phone (Optional)</label>
              <input
                type="tel"
                placeholder="+256 701 555 555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#000000] focus:border-[#000000]"
              />
            </div>
          )}

          {(localError || authError) && (
            <p className="text-xs text-red-600 font-medium">{localError || authError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-[#000000] hover:bg-[#262626] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-md shadow-xs transition-all cursor-pointer"
          >
            {submitting ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
          <p className="text-[10px] text-center text-gray-400">
            Real account — your email and password are checked against Realto's live database.
          </p>
        </form>
      </div>
    </div>
  );
};
