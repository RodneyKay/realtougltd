import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import PortalApp from './portal/PortalApp.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { DataProvider } from './context/DataContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Agency & developer portal — own auth, own layout, no marketplace chrome */}
        <Route path="/portal/*" element={<PortalApp />} />

        {/* Public marketplace */}
        <Route
          path="/*"
          element={
            <DataProvider>
              <AppProvider>
                <App />
              </AppProvider>
            </DataProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
