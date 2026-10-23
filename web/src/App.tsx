import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { PrototypeDrawer } from './components/PrototypeDrawer';
import { AlertDrawer } from './components/AlertDrawer';
import { Toast } from './components/Toast';

// Modals
import { EditProfileModal, LogoutModal } from './components/Modals/EditProfileModal';
import { ChangeDPModal } from './components/Modals/ChangeDPModal';
import { PCRCertificateModal } from './components/Modals/PCRCertificateModal';
import { AddCaseModal } from './components/Modals/AddCaseModal';
import { AddAuditModal, AuditInspectorModal } from './components/Modals/AddAuditModal';
import { AddVisitorModal } from './components/Modals/AddVisitorModal';
import { EmergencyCallModal } from './components/Modals/EmergencyCallModal';
import { SOPReaderModal } from './components/Modals/SOPReaderModal';
import { AddInventoryModal, IncidentLogModal, PDFExportModal } from './components/Modals/AddInventoryModal';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SurveillanceScreen } from './screens/SurveillanceScreen';
import { FarmHealthScreen } from './screens/FarmHealthScreen';
import { AuditsScreen } from './screens/AuditsScreen';
import { VisitorLogScreen } from './screens/VisitorLogScreen';
import { ChecklistScreen } from './screens/ChecklistScreen';
import { WeatherScreen } from './screens/WeatherScreen';
import { EmergencyScreen } from './screens/EmergencyScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { FarmMapScreen } from './screens/FarmMapScreen';
import { InventoryScreen } from './screens/InventoryScreen';
import { ReportsScreen } from './screens/ReportsScreen';

const MainContent: React.FC = () => {
  const { activeScreen } = useApp();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'surveillance':
        return <SurveillanceScreen />;
      case 'health':
        return <FarmHealthScreen />;
      case 'audits':
        return <AuditsScreen />;
      case 'visitors':
        return <VisitorLogScreen />;
      case 'checklist':
        return <ChecklistScreen />;
      case 'weather':
        return <WeatherScreen />;
      case 'emergency':
        return <EmergencyScreen />;
      case 'training':
        return <TrainingScreen />;
      case 'farm-map':
        return <FarmMapScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'reports':
        return <ReportsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* Sticky Top App Bar */}
      <Navbar />

      {/* Main Body Layout: Sidebar + Full Available Content Area */}
      <div className="flex flex-1 w-full">
        {/* Collapsible Left Sidebar Navigation */}
        <Sidebar />

        {/* Dynamic Center Screen Container with Responsive Padding */}
        <main className="flex-1 min-w-0 w-full p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {renderScreen()}
        </main>
      </div>

      {/* Fixed Bottom 5-Tab Navigation Bar (Mobile / Compact) */}
      <BottomNav />

      {/* Global Drawers & Modals */}
      <PrototypeDrawer />
      <AlertDrawer />
      
      {/* Action Modals */}
      <EditProfileModal />
      <ChangeDPModal />
      <LogoutModal />
      <PCRCertificateModal />
      <AddCaseModal />
      <AddAuditModal />
      <AuditInspectorModal />
      <AddVisitorModal />
      <AddInventoryModal />
      <EmergencyCallModal />
      <SOPReaderModal />
      <IncidentLogModal />
      <PDFExportModal />

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
