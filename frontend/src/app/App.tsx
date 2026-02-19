import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Banner } from './components/Banner';
import { ToastStack } from './components/ToastStack';
import landingBg from '../assets/landing-bg.png';

// Auth pages
import { LoginPage } from './pages/LoginPage';
import { PasswordResetPage } from './pages/PasswordResetPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageFlights } from './pages/admin/ManageFlights';
import { ManagePassengers } from './pages/admin/ManagePassengers';
import { ManageStaff } from './pages/admin/ManageStaff';
import { AdminMessages } from './pages/admin/AdminMessages';

// Airline Staff pages
import { AirlineDashboard } from './pages/airline/AirlineDashboard';
import { CheckInPassenger } from './pages/airline/CheckInPassenger';
import { AirlineMessages } from './pages/airline/AirlineMessages';

// Gate Staff pages
import { GateDashboard } from './pages/gate/GateDashboard';
import { BoardPassenger } from './pages/gate/BoardPassenger';
import { FlightDeparture } from './pages/gate/FlightDeparture';
import { GateMessages } from './pages/gate/GateMessages';

// Ground Staff pages
import { GroundDashboard } from './pages/ground/GroundDashboard';
import { UpdateBags } from './pages/ground/UpdateBags';
import { LoadBags } from './pages/ground/LoadBags';
import { GroundMessages } from './pages/ground/GroundMessages';

// Passenger pages
import { TrackBags } from './pages/passenger/TrackBags';
import { GateInfo } from './pages/passenger/GateInfo';

function Router() {
  const { currentUser } = useApp();
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(window.location.hash.slice(1));
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // If not logged in, show auth pages
  if (!currentUser) {
    if (currentPage === 'password-reset') {
      return <PasswordResetPage />;
    }
    return <LoginPage />;
  }

  // Route mapping
  const routes: Record<string, React.ReactNode> = {
    // Admin
    'admin-dashboard': <AdminDashboard />,
    'admin-flights': <ManageFlights />,
    'admin-passengers': <ManagePassengers />,
    'admin-staff': <ManageStaff />,
    'admin-messages': <AdminMessages />,
    
    // Airline Staff
    'airline-dashboard': <AirlineDashboard />,
    'airline-checkin': <CheckInPassenger />,
    
    'airline-messages': <AirlineMessages />,
    
    // Gate Staff
    'gate-dashboard': <GateDashboard />,
    'gate-boarding': <BoardPassenger />,
    'gate-departure': <FlightDeparture />,
    'gate-messages': <GateMessages />,
    
    // Ground Staff
    'ground-dashboard': <GroundDashboard />,
    'ground-bags': <UpdateBags />,
    'ground-load': <LoadBags />,
    'ground-messages': <GroundMessages />,
    
    // Passenger
    'passenger-track': <TrackBags />,
    'passenger-gate': <GateInfo />,
  };

  const defaultRouteByRole: Record<string, string> = {
    admin: 'admin-dashboard',
    airline: 'airline-dashboard',
    gate: 'gate-dashboard',
    ground: 'ground-dashboard',
    passenger: 'passenger-track',
  };

  const component = routes[currentPage] || routes[defaultRouteByRole[currentUser.role]];

  return (
    <Layout>
      {component}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
}

function InnerApp() {
  const { currentUser } = useApp();

  const landing = !currentUser;

  return (
    <div className={landing ? 'app-landing-root' : undefined} style={landing ? { backgroundImage: `url(${landingBg})` } : undefined}>
      {landing && <div className="app-landing__overlay" />}
      <Banner />
      <ToastStack />
      <Router />
    </div>
  );
}
