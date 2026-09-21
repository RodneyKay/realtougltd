import React, { useRef, useState } from 'react';
import { Phone, Repeat, Calendar, Table2, BarChart3, Clock, Check } from 'lucide-react';
import { Confetti } from './Confetti';
import { StarfieldParticles } from './StarfieldParticles';

const items = [
  { pain: 'Manually verifying every buyer inquiry', solved: 'Buyer inquiries auto-verified & routed to you', icon: Phone },
  { pain: 'Re-posting the same listing on multiple sites', solved: 'One listing, published everywhere instantly', icon: Repeat },
  { pain: 'Chasing viewing schedules over WhatsApp', solved: 'Viewings booked straight into your calendar', icon: Calendar },
  { pain: 'Tracking leads in a messy spreadsheet', solved: 'Every lead tracked automatically — nothing lost', icon: Table2 },
  { pain: 'No idea which listings are actually getting views', solved: 'Real-time view & save analytics, per listing', icon: BarChart3 },
  { pain: 'Missed leads while out showing another property', solved: 'A 24/7 storefront that never stops working', icon: Clock },
];

export const AgencyAutopilotCTA: React.FC<{ onPartnerClick: () => void }> = ({ onPartnerClick }) => {
  const [autopilot, setAutopilot] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const hideTimeoutRef = useRef<number | null>(null);

  const handleToggle = () => {
    const next = !autopilot;
    setAutopilot(next);

    if (next) {
      setBurstKey((k) => k + 1);
      setConfettiActive(true);
      if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = window.setTimeout(() => setConfettiActive(false), 4000);
    } else {
      setConfettiActive(false);
    }
  };

  return (
    <div
      className={`relative overflow-hidden transition-colors duration-700 ${
        autopilot ? 'bg-gradient-to-br from-[#0b0a1f] via-[#151233] to-[#1b1440]' : 'bg-black'
      }`}
    >
      <StarfieldParticles active={autopilot} />
      <Confetti active={confettiActive} burstKey={burstKey} />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-10 space-y-7">
        {/* Eyebrow + Partner button */}
        <div className="flex items-center justify-between gap-4">
          <span className={`text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${autopilot ? 'text-amber-300/80' : 'text-white/50'}`}>
            For agencies &amp; developers
          </span>
          <button
            onClick={onPartnerClick}
            className="shrink-0 px-5 py-2.5 bg-white text-black text-xs font-bold rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Partner With Us
          </button>
        </div>

        {/* Headline with inline toggle */}
        <div className="text-center space-y-3">
          <h3 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-2xl sm:text-3xl font-black tracking-tight">
            <span className={`transition-colors duration-500 ${autopilot ? 'text-white/40' : 'text-white'}`}>From Workflow</span>

            <button
              role="switch"
              aria-checked={autopilot}
              aria-label="Toggle autopilot mode"
              onClick={handleToggle}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer shrink-0 align-middle ${
                autopilot ? 'bg-amber-300' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                  autopilot ? 'translate-x-6 bg-[#151233]' : 'translate-x-0 bg-white'
                }`}
              />
            </button>

            <span className={`transition-colors duration-500 ${autopilot ? 'text-white' : 'text-white/40'}`}>to Autopilot</span>
          </h3>

          <p className={`text-xs max-w-md mx-auto leading-relaxed transition-colors duration-500 ${autopilot ? 'text-white/70' : 'text-white/50'}`}>
            {autopilot
              ? 'Your storefront is live — verifying leads, booking viewings, and updating listings while you focus on closing deals.'
              : 'One toggle. That\'s all it takes to let Realto handle the busywork while you keep full control of your storefront.'}
          </p>
        </div>

        {/* Checklist */}
        <div className="max-w-xl mx-auto w-full space-y-2">
          {items.map((item, i) => {
            const Icon = item.icon;
            const delay = autopilot ? `${i * 90}ms` : '0ms';
            return (
              <div
                key={item.pain}
                style={{ transitionDelay: delay }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-500 ${
                  autopilot ? 'bg-white/10 border-white/15' : 'bg-white/5 border-white/10'
                }`}
              >
                <span
                  style={{ transitionDelay: delay }}
                  className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-500 ${
                    autopilot ? 'bg-amber-300 text-[#151233]' : 'bg-white/10 text-white/30'
                  }`}
                >
                  {autopilot ? <Check className="w-3 h-3" strokeWidth={3} /> : <Icon className="w-3 h-3" />}
                </span>

                <p
                  style={{ transitionDelay: delay }}
                  className={`flex-1 text-xs font-semibold leading-relaxed transition-colors duration-500 ${
                    autopilot ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {autopilot ? item.solved : item.pain}
                </p>

                <span
                  style={{ transitionDelay: delay }}
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full transition-all duration-500 ${
                    autopilot ? 'bg-amber-300/15 text-amber-300 opacity-100' : 'opacity-0 text-transparent'
                  }`}
                >
                  Complete
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
