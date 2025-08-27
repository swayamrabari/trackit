import './App.css';
import Home from './pages/Home';
import { ReactNode } from 'react';
import Budget from './pages/Budget';
import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import { Routes, Route, useLocation } from 'react-router-dom';
import Insights from './pages/Insights';
import Entries from './pages/Entries';
import { AnimatePresence, motion } from 'framer-motion';
import SidebarNav from './components/SidebarNav';

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

// Main App layout
export default function App() {
  return (
    <div className="flex h-screen w-screen">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="page px-3 w-screen lg:w-full md:px-12 pb-16 flex-1 overflow-y-auto">
          <AnimatedRoutes />
        </div>
        <MobileNavbar />
      </div>
    </div>
  );
}
