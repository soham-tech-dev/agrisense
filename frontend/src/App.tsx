import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Farm } from './pages/Farm';
import { SettingsPage } from './pages/Settings';
import { WeatherPage } from './pages/WeatherPage';
import { MarketPage } from './pages/MarketPage';
import { DiseasePage } from './pages/DiseasePage';
import { DiseaseResultPage } from './pages/DiseaseResultPage';
import { DiseaseHistoryPage } from './pages/DiseaseHistoryPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { CropCalendarPage } from './pages/CropCalendarPage';
import { SavedAdvicePage } from './pages/SavedAdvicePage';
import { ResourcesPage } from './pages/ResourcesPage';
import { LoadingState } from './components/common/LoadingState';
import { FirebaseErrorBoundary } from './components/common/FirebaseErrorBoundary';

// Admin imports
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminDiseasePage } from './pages/admin/AdminDiseasePage';
import { AdminKnowledgePage } from './pages/admin/AdminKnowledgePage';
import { AdminFeedbackPage } from './pages/admin/AdminFeedbackPage';
import { AdminModelPage } from './pages/admin/AdminModelPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

/**
 * ProtectedRoute — allows authenticated users directly into the dashboard app.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, firebaseUser } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message={t('common.loading', 'Loading...')} />;
  }

  // No user at all → redirect to login
  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * PublicOnlyRoute — redirects already-authenticated users away from auth pages to /dashboard.
 */
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#052013] via-[#0a3320] to-[#0f4a2e]">
        <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
      
      {/* Protected Routes inside AppShell */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppShell>
              <Profile />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/farm"
        element={
          <ProtectedRoute>
            <AppShell>
              <Farm />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell>
              <SettingsPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Disease Routes */}
      <Route
        path="/disease"
        element={
          <ProtectedRoute>
            <AppShell>
              <DiseasePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/disease/result/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <DiseaseResultPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/disease/history"
        element={
          <ProtectedRoute>
            <AppShell>
              <DiseaseHistoryPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crop-health"
        element={
          <ProtectedRoute>
            <AppShell>
              <DiseasePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor"
        element={
          <ProtectedRoute>
            <AppShell>
              <AdvisorPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/advisor/:conversationId"
        element={
          <ProtectedRoute>
            <AppShell>
              <AdvisorPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/weather"
        element={
          <ProtectedRoute>
            <AppShell>
              <WeatherPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <AppShell>
              <MarketPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <AppShell>
              <CropCalendarPage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-advice"
        element={
          <ProtectedRoute>
            <AppShell>
              <SavedAdvicePage />
            </AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <AppShell>
              <ResourcesPage />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Admin Portal Protected Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="disease" element={<AdminDiseasePage />} />
          <Route path="knowledge" element={<AdminKnowledgePage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
          <Route path="model" element={<AdminModelPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <FirebaseErrorBoundary>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
      </FirebaseErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
