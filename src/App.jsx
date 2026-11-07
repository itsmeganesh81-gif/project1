import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Toast from './components/common/Toast';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ReceiverDashboard from './pages/ReceiverDashboard';
import DonorDashboard from './pages/DonorDashboard';
import FindDonors from './pages/FindDonors';
import MapPage from './pages/MapPage';
import DonorProfile from './pages/DonorProfile';
import Leaderboard from './pages/Leaderboard';
import Rewards from './pages/Rewards';
import Requests from './pages/Requests';
import Profile from './pages/Profile';
import RecurringTransfusions from './pages/RecurringTransfusions';
import RareBloodNetwork from './pages/RareBloodNetwork';
import BloodBankDashboard from './pages/BloodBankDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import SurplusBoard from './pages/SurplusBoard';
import ReviewsAndSupport from './pages/ReviewsAndSupport';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <LanguageProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/find-donors" element={<FindDonors />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/donors/:id" element={<DonorProfile />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/recurring-transfusions" element={<RecurringTransfusions />} />
                  <Route path="/rare-network" element={<RareBloodNetwork />} />
                  <Route path="/blood-bank" element={<BloodBankDashboard />} />
                  <Route path="/hospital" element={<HospitalDashboard />} />
                  <Route path="/volunteers" element={<VolunteerDashboard />} />
                  <Route path="/surplus-board" element={<SurplusBoard />} />
                  <Route path="/reviews" element={<ReviewsAndSupport />} />
                  <Route path="/support" element={<ReviewsAndSupport />} />

                {/* Protected Routes */}
                <Route
                  path="/receiver-dashboard"
                  element={
                    <ProtectedRoute>
                      <ReceiverDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor-dashboard"
                  element={
                    <ProtectedRoute>
                      <DonorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/requests"
                  element={
                    <ProtectedRoute>
                      <Requests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donation-history"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <Toast />
          </div>
          </LanguageProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
