import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { TrafficMapPage } from './pages/TrafficMapPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { RouteComparisonPage } from './pages/RouteComparisonPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminPage } from './pages/AdminPage';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { LoginModal } from './components/LoginModal';
import { Incident } from './types';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportCoords, setReportCoords] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const handleOpenReportWithCoords = (coords: { lat: number; lng: number }) => {
    setReportCoords(coords);
    setShowReportModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-100 font-sans selection:bg-accent-primary selection:text-black">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => {
          setReportCoords(undefined);
          setShowReportModal(true);
        }}
        onOpenLoginModal={() => setShowLoginModal(true)}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        )}

        {activeTab === 'map' && (
          <TrafficMapPage
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onOpenReportModalWithCoords={handleOpenReportWithCoords}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onNavigateToMap={() => setActiveTab('map')}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsPage
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        )}

        {activeTab === 'routes' && <RouteComparisonPage />}

        {activeTab === 'analytics' && <AnalyticsPage />}

        {activeTab === 'admin' && <AdminPage />}
      </main>

      {/* Footer (omitted on full-height map page for immersive experience, present everywhere else) */}
      {activeTab !== 'map' && <Footer />}

      {/* Incident Detail / Moderation Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdated={(updated) => setSelectedIncident(updated)}
        />
      )}

      {/* Hazard Report Modal */}
      {showReportModal && (
        <ReportIncidentModal
          initialCoords={reportCoords}
          onClose={() => {
            setShowReportModal(false);
            setReportCoords(undefined);
          }}
          onCreated={(newInc) => {
            setSelectedIncident(newInc);
          }}
        />
      )}

      {/* Login / Register Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
