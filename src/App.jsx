import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavouritesProvider } from './context/FavouritesContext';
import { CompareProvider } from './context/CompareContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CompareFloatingBanner from './components/CompareFloatingBanner';

import LoginPage from './pages/LoginPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import RentalsPage from './pages/RentalsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import RentalDetailPage from './pages/RentalDetailPage';
import FavouritesPage from './pages/FavouritesPage';
import InsightsPage from './pages/InsightsPage';
import ComparePage from './pages/ComparePage';
import LandingPage from './pages/LandingPage';

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <FavouritesProvider>
            <CompareProvider>
              <div className="app-container">
              <Navbar />
              <Routes>
                {/* Public Auth Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Core Application Routes */}
                <Route
                  path="/listings"
                  element={
                    <ProtectedRoute>
                      <ListingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listings/:id"
                  element={
                    <ProtectedRoute>
                      <ListingDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/compare"
                  element={
                    <ProtectedRoute>
                      <ComparePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rentals"
                  element={
                    <ProtectedRoute>
                      <RentalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rentals/:id"
                  element={
                    <ProtectedRoute>
                      <RentalDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/:id"
                  element={
                    <ProtectedRoute>
                      <ProjectDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <ProtectedRoute>
                      <FavouritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/insights"
                  element={
                    <ProtectedRoute>
                      <InsightsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Unbiased Landing Gateway for Buy, Rent, and Builder Projects */}
                <Route path="/" element={<LandingPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Global Floating Compare Banner (shown when >= 1 property selected) */}
              <CompareFloatingBanner />
            </div>
          </CompareProvider>
        </FavouritesProvider>
      </AuthProvider>
    </ThemeProvider>
  </HashRouter>
);
}
