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
import StayDetailsPage from './pages/StayDetailsPage';
import RideDetailsPage from './pages/RideDetailsPage';
import StaysPage from './pages/StaysPage';
import RidesPage from './pages/RidesPage';

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
              <Route path="/rides" element={<RidesPage />} />
              <Route path="/stays" element={<StaysPage />} />
              <Route path="/rides/:id" element={<RideDetailsPage />} />
              <Route path="/stays/:id" element={<StayDetailsPage />} />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
