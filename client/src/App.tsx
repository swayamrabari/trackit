import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import logo from '../public/trackit.svg';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Verify from './pages/Verify';

// Main Pages
import Home from './pages/Home';
import Budget from './pages/Budget';
import Entries from './pages/Entries';
import Insights from './pages/Insights';

// Components
import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import SidebarNav from './components/SidebarNav';
import { Protected } from './components/Protected';

// Optimized animation variants with snappier custom easing
const pageVariants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    y: 40,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
};

// PageWrapper wraps each route with motion for transitions
const PageWrapper = ({ children }: { children: ReactNode }) => (
  <motion.div
    layout // Framer optimizes layout transitions
    style={{
      width: '100%',
      willChange: 'opacity, transform',
      transform: 'translateZ(0)', // Forces GPU layer
      position: 'relative', // Avoids layout reflows
    }}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

// Handles route transitions with AnimatePresence
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence
      mode="wait"
      initial={false}
      onExitComplete={() => {
        // Reset scroll after exit animation
        const pageContainer = document.querySelector('.page');
        if (pageContainer) {
          pageContainer.scrollTo({ top: 0 });
        }
      }}
    >
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <Home />
            </PageWrapper>
          }
        />
        <Route
          path="/entries"
          element={
            <PageWrapper>
              <Entries />
            </PageWrapper>
          }
        />
        <Route
          path="/insights"
          element={
            <PageWrapper>
              <Insights />
            </PageWrapper>
          }
        />
        <Route
          path="/budget"
          element={
            <PageWrapper>
              <Budget />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

// Layout component for protected pages
function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <SidebarNav />

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Navbar />
        <div className="page px-3 w-full lg:w-full md:px-12 pb-16 flex-1 overflow-y-auto">
          <AnimatedRoutes />
        </div>
        <MobileNavbar />
      </div>
    </div>
  );
}

// Main App component
function App() {
  const { checkAuthStatus, isLoading } = useAuthStore();

  // Check authentication status when app loads - only once
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img src={logo} alt="TrackIt Logo" className="w-20 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />

        {/* Protected routes */}
        <Route element={<Protected />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/entries" element={<Entries />} />
            <Route path="/insights" element={<Insights />} />
          </Route>
        </Route>

        {/* Redirect all other routes to login or home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
