/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { WalletProvider } from './context/WalletContext';
import UnifiedDashboard from './pages/UnifiedDashboard';
import BookRide from './pages/BookRide';
import BrowseStays from './pages/BrowseStays';
import BookExpress from './pages/BookExpress';
import MiniAppContainer from './pages/MiniAppContainer';
import Signup from './pages/Signup';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import PaymentReturn from './pages/PaymentReturn';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <WalletProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<UnifiedDashboard />} />
              <Route path="/book-ride" element={<BookRide />} />
              <Route path="/browse-stays" element={<BrowseStays />} />
              <Route path="/book-express" element={<BookExpress />} />
              <Route path="/miniapp/:appId" element={<MiniAppContainer />} />
              <Route path="/payment/return" element={<PaymentReturn />} />
              {/* Placeholder routes for links in the dashboard */}
              <Route path="/rides" element={<div className="p-8 text-white">All Rides Page</div>} />
              <Route path="/stays" element={<div className="p-8 text-white">All Stays Page</div>} />
              <Route path="/rides/:id" element={<div className="p-8 text-white">Ride Details Page</div>} />
              <Route path="/stays/:id" element={<div className="p-8 text-white">Stay Details Page</div>} />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
