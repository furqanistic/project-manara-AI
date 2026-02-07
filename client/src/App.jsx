// File: project-manara-AI/client/src/App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { Provider, useSelector } from 'react-redux'
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import OnboardingModal from './components/Auth/OnboardingModal'
import ScrollToTop from './components/Layout/ScrollToTop'
import { MoodboardHistoryDetails } from './components/Moodboard/MoodboardHistoryDetails'
import AboutPage from './pages/About/AboutPage'
import FloorPlanGenerator from './pages/AIBuilders/FloorPlanGenerator'
import MoodboardGenerator from './pages/AIBuilders/MoodboardGenerator'
import ThreedGenerator from './pages/AIBuilders/ThreedGenerator'
import AuthPage from './pages/Auth/AuthPage'
import HomePage from './pages/Home/HomePage'
import PricingPage from './pages/Pricing/PricingPage'
import Profile from './pages/Profile/Profile'
import SubscriptionPage from './pages/Profile/SubscriptionPage'
import ProjectsPage from './pages/Projects/ProjectsPage'
import { persistor, store } from './redux/store'

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0,
    },
  },
})

// Inline protected route wrapper
const RequireAuth = ({ children, requireAdmin = false }) => {
  const { currentUser } = useSelector((state) => state.user)
  const location = useLocation()

  useEffect(() => {
    if (!currentUser) {
      toast.dismiss('auth-error'); // Dismiss any existing auth errors
      toast.error('Please create an account or log in to access this feature.', {
        id: 'auth-error',
        duration: 4000,
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to='/auth?type=login' state={{ from: location }} replace />
  }

  if (requireAdmin && currentUser?.role !== 'admin') {
    return <Navigate to='/' replace />
  }

  return children
}

const OnboardingWrapper = () => {
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();
    
    // Check if the user has completed the NEW 10-step onboarding
    // We check for the 'identity' field which is unique to the new form
    const isNewOnboardingComplete = currentUser?.isOnboarded && currentUser?.onboardingData?.identity;
    
    // Debug logging for troubleshooting
    useEffect(() => {
        if (currentUser) {
            console.log('Onboarding Check:', {
                user: currentUser.email,
                isOnboarded: currentUser.isOnboarded,
                hasNewData: !!currentUser?.onboardingData?.identity,
                path: location.pathname
            });
        }
    }, [currentUser, location.pathname]);
    
    // Don't show if not logged in or already fully onboarded with the new data
    if (!currentUser || isNewOnboardingComplete) {
        return null;
    }

    // Don't show on auth page
    if (location.pathname === '/auth') {
        return null;
    }
    
    return (
        <React.Suspense fallback={null}>
            <OnboardingModal />
        </React.Suspense>
    );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes - wrap with RequireAuth */}
        <Route
          path="/visualizer"
          element={
            <RequireAuth>
              <ThreedGenerator />
            </RequireAuth>
          }
        />
        <Route
          path="/visualizer/:id"
          element={
            <RequireAuth>
              <ThreedGenerator />
            </RequireAuth>
          }
        />
        <Route
          path="/moodboard"
          element={
            <RequireAuth>
              <MoodboardGenerator />
            </RequireAuth>
          }
        />
        <Route
          path="/floorplans"
          element={
            <RequireAuth>
              <FloorPlanGenerator />
            </RequireAuth>
          }
        />
        <Route
          path="/floorplans/:id"
          element={
            <RequireAuth>
              <FloorPlanGenerator />
            </RequireAuth>
          }
        />
        <Route
          path="/projects"
          element={
            <RequireAuth>
              <ProjectsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/moodboards/:id"
          element={
            <RequireAuth>
              <MoodboardHistoryDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/subscription"
          element={
            <RequireAuth>
              <SubscriptionPage />
            </RequireAuth>
          }
        />

        {/* Example admin-only route */}
        {/* <Route
          path="/admin"
          element={
            <RequireAuth requireAdmin={true}>
              <AdminPanel />
            </RequireAuth>
          }
        /> */}
      </Route>
    </Routes>
  );
}

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ScrollToTop />
            <OnboardingWrapper />
            <Toaster
              position="top-center"
              toastOptions={{
                className: '',
                style: {
                  border: '1px solid rgba(141, 119, 94, 0.1)',
                  padding: '12px 20px',
                  color: '#1f2937',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '100px',
                  boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                  fontSize: '14px',
                  fontWeight: '600',
                  letterSpacing: '-0.01em',
                },
                success: {
                  iconTheme: {
                    primary: '#8d775e',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                  style: {
                    border: '1px solid rgba(239, 68, 68, 0.1)',
                    background: 'rgba(254, 242, 242, 0.95)',
                    color: '#991b1b',
                  },
                },
              }}
            />
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
