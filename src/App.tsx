/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import QuranPage from './pages/QuranPage';
import SurahPage from './pages/SurahPage';
import PrayerTimesPage from './pages/PrayerTimesPage';
import QiblaPage from './pages/QiblaPage';
import ProfilePage from './pages/ProfilePage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';

// Layouts
import MainLayout from './layouts/MainLayout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();
  
  if (!initialized || loading) return <div className="h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-emerald"></div>
  </div>;
  
  if (!user) return <Navigate to="/auth" />;
  
  return <>{children}</>;
}

export default function App() {
  const { initialize } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initialize();
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:chatId" element={<ChatPage />} />
          <Route path="quran" element={<QuranPage />} />
          <Route path="quran/:surahId" element={<SurahPage />} />
          <Route path="prayer-times" element={<PrayerTimesPage />} />
          <Route path="qibla" element={<QiblaPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/:id" element={<CollectionDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
