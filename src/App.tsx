/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { ListWithUsNav } from './components/ListWithUsNav';
import { Footer } from './components/Footer';
import { ContactModal, LoginModal } from './components/Modals';

import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { PropertyDetails } from './pages/PropertyDetails';
import { AgencyStorefront } from './pages/AgencyStorefront';
import { AgenciesDirectory } from './pages/AgenciesDirectory';
import { Investments } from './pages/Investments';
import { Saved } from './pages/Saved';
import { HelpCenter } from './pages/HelpCenter';
import { ContactUs } from './pages/ContactUs';
import { LegalPage } from './pages/LegalPage';
import { ListWithUs } from './pages/ListWithUs';

import { useAppContext } from './context/AppContext';

// Context-aware modal wrappers — no prop drilling
const ConnectedContactModal: React.FC = () => {
  const {
    isContactModalOpen,
    setIsContactModalOpen,
    activeContactAgency,
    activeContactProperty,
    activeContactInvestment,
    contactInitialMode,
    handleContactSubmit,
  } = useAppContext();

  if (!isContactModalOpen || !activeContactAgency) return null;

  return (
    <ContactModal
      isOpen={isContactModalOpen}
      onClose={() => setIsContactModalOpen(false)}
      agency={activeContactAgency}
      property={activeContactProperty ?? undefined}
      investment={activeContactInvestment ?? undefined}
      initialType={contactInitialMode}
      onSubmit={handleContactSubmit}
    />
  );
};

const ConnectedLoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, authMode, setAuthMode, handleLogin, handleRegister, authError } = useAppContext();

  if (!isLoginModalOpen) return null;

  return (
    <LoginModal
      isOpen={isLoginModalOpen}
      onClose={() => setIsLoginModalOpen(false)}
      mode={authMode}
      onSwitchMode={setAuthMode}
      onLogin={handleLogin}
      onRegister={handleRegister}
      authError={authError}
    />
  );
};

export default function App() {
  const location = useLocation();
  const isListWithUs = location.pathname === '/list-with-us';

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {isListWithUs ? <ListWithUsNav /> : <Navbar />}

      <main className="flex-grow max-w-6xl w-full mx-auto px-6 sm:px-10 lg:px-16 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/agency/:id" element={<AgencyStorefront />} />
          <Route path="/agencies" element={<AgenciesDirectory />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/list-with-us" element={<ListWithUs />} />
          <Route path="/partners" element={<Navigate to="/list-with-us" replace />} />
          <Route path="/terms" element={<LegalPage page="terms" />} />
          <Route path="/privacy" element={<LegalPage page="privacy" />} />
          <Route path="/cookies" element={<LegalPage page="cookies" />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Modals */}
      <ConnectedContactModal />
      <ConnectedLoginModal />
    </div>
  );
}
