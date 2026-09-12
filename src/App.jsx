import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavouritesProvider } from './context/FavouritesContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CompareFloatingBanner from './components/CompareFloatingBanner';

import LoginPage from './pages/LoginPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import RentalsPage from './pages/RentalsPage';
import ProjectsPage from './pages/ProjectsPage';
import FavouritesPage from './pages/FavouritesPage';
import InsightsPage from './pages/InsightsPage';
import ComparePage from './pages/ComparePage';

export default function App() {
  return (
    <BrowserRouter>
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
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
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

                {/* Default Redirection */}
                <Route path="/" element={<Navigate to="/listings" replace />} />
                <Route path="*" element={<Navigate to="/listings" replace />} />
              </Routes>

              {/* Global Floating Compare Banner (shown when >= 1 property selected) */}
              <CompareFloatingBanner />
            </div>
          </CompareProvider>
        </FavouritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
