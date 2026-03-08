// Main App Component with Routing
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./admin/Layout/adminLayout";
// import AdminProtectedRoute from "./admin/Layout/adminProtectionRoute"; // Replaced by generic ProtectedRoute
// import AdminLogin from "./admin/pages/adminLogin"; // Replaced by GlobalLogin

/* AUTH */
import GlobalLogin from "./auth/GlobalLogin";
import GlobalRegister from "./auth/GlobalRegister";
import ProtectedRoute from "./auth/ProtectedRoute";

/* WEBSITE */
import LandingPage from "./pages/LandingPage";
import Dashboard from "./Component/Home/Main/Main";
import UserProfile from "./pages/ProfilePage";
import Professional from "./Component/Professional/Professional";
import ServiceDetails from "./Component/ServiceDetails/ServiceDetails";
import Payment from "./Component/Payment/Payment";
import BookingStatus from "./Component/Booking/BookingStatus";
import RateExperience from "./Component/Review/RateExperience";
import MyBookings from "./Component/Booking/MyBookings";
// import ServiceInfo from "./Component/ServiceDetails/ServiceInfo";
import RaiseDispute from "./Component/Booking/RaiseDispute";
import AdminMessage from "./Component/Booking/Message";


/* PROVIDER */
import ProviderLayout from "./provider/Layout/ProviderLayout";
import ProviderDashboard from "./provider/pages/ProviderDashboard";
import ProviderServices from "./provider/pages/ProviderServices";
import ProviderBookings from "./provider/pages/ProviderBookings";
import ProviderBookingDetails from "./provider/pages/ProviderBookingDetails";
import ProviderKYC from "./provider/pages/ProviderKYC";
import ProviderPayments from "./provider/pages/ProviderPayments";
import ProviderReviews from "./provider/pages/ProviderReviews";
import ProviderHelp from "./provider/pages/ProviderHelp";
import ProviderSettings from "./provider/pages/ProviderSettings";

/* ADMIN */
import AdminDashboard from "./admin/pages/mainDashboard";
import Users from "./admin/pages/users";
import KYC from "./admin/pages/KYCverification";
import AdminServices from "./admin/pages/services";
import Bookings from "./admin/pages/bookings";
import Payments from "./admin/pages/payments";
import Disputes from "./admin/pages/disputes";
// import Reports from "./admin/pages/reports";
import Settings from "./admin/pages/settings";

export default function App() {
  // Logic for redirection could be here if needed, but ProtectedRoute handles it.

  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/professional" element={<Professional />} />

      <Route path="/login" element={<GlobalLogin />} />
      <Route path="/register" element={<GlobalRegister />} />
      <Route path="/service" element={<ServiceDetails />} />

      {/* Redirect old admin login to new global login */}
      <Route path="/admin/login" element={<Navigate to="/login?role=admin" replace />} />

      {/* User specific login entry point */}
      <Route path="/user" element={<Navigate to="/login?role=user" replace />} />
      {/* Provider login entry point - redirected by ProtectedRoute if needed, or manual link */}
      {/* <Route path="/provider" element={<Navigate to="/login?role=provider" replace />} /> */}

      {/* USER PROTECTED ROUTES */}
      <Route
        path="/home"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserProfile />
          </ProtectedRoute>
        }
      />

      <Route path="/payment" element={<Payment />} />
      <Route path="/booking-status" element={<BookingStatus />} />
      <Route path="/booking-details/:id" element={<BookingStatus />} />
      <Route path="/rate-experience" element={<RateExperience />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route
        path="/raise-dispute"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <RaiseDispute />
          </ProtectedRoute>
        }
      />

      <Route
        path="/message"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <AdminMessage />
          </ProtectedRoute>
        }
      />

      {/* PUBLIC / USER - PROFESSIONAL LISTING */}
      {/* Assuming 'Professional' is for users to find pros, not for pros themselves */}
      <Route
        path="/professional"
        element={
          <ProtectedRoute allowedRoles={['user', 'provider']}>
            <Professional />
          </ProtectedRoute>
        }
      />

      <Route path="/services/:slug" element={<ServiceDetails />} />

      {/* PROVIDER PROTECTED ROUTES */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/provider/dashboard" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="services" element={<ProviderServices />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="bookings/:id" element={<ProviderBookingDetails />} />
        <Route path="kyc" element={<ProviderKYC />} />
        <Route path="payments" element={<ProviderPayments />} />
        <Route path="reviews" element={<ProviderReviews />} />
        <Route path="help" element={<ProviderHelp />} />
        <Route path="settings" element={<ProviderSettings />} />
      </Route>

      {/* ADMIN PROTECTED ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/login?role=admin" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="kyc" element={<KYC />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="payments" element={<Payments />} />
        <Route path="disputes" element={<Disputes />} />
        {/* <Route path="reports" element={<Reports />} /> */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* PROVIDER PROTECTED ROUTES */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/login?role=provider" replace />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="services" element={<ProviderServices />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="bookings/:id" element={<ProviderBookingDetails />} />
        <Route path="kyc" element={<ProviderKYC />} />
        <Route path="payments" element={<ProviderPayments />} />
        <Route path="reviews" element={<ProviderReviews />} />
        <Route path="help" element={<ProviderHelp />} />
        <Route path="settings" element={<ProviderSettings />} />
      </Route>

    </Routes>
  );
}
