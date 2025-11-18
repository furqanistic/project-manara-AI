import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import { Provider, useSelector } from 'react-redux'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import AboutPage from './pages/About/AboutPage'
import FloorPlanGenerator from './pages/AIBuilders/FloorPlanGenerator'
import MoodboardGenerator from './pages/AIBuilders/MoodboardGenerator'
import AuthPage from './pages/Auth/AuthPage'
import HomePage from './pages/Home/HomePage'
import PricingPage from './pages/Pricing/PricingPage'
import { persistor, store } from './redux/store'
import Profile from './pages/Profile/Profile'

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

  if (!currentUser) {
    return <Navigate to='/auth?type=login' state={{ from: location }} replace />
  }

  if (requireAdmin && currentUser?.role !== 'admin') {
    return <Navigate to='/' replace />
  }

  return children
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/'>
        <Route index element={<HomePage />} />
        <Route path='/about' element={<AboutPage />} />
        <Route path='/pricing' element={<PricingPage />} />
        <Route path='/auth' element={<AuthPage />} />

        {/* Protected routes - wrap with RequireAuth */}
        <Route
          path='/moodboard'
          element={
            <RequireAuth>
              <MoodboardGenerator />
            </RequireAuth>
          }
        />
        <Route
          path='/floorplans'
          element={
            <RequireAuth>
              <FloorPlanGenerator />
            </RequireAuth>
          }
        />
        <Route path='/profile' element={
          <RequireAuth>
            <Profile />
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
  )
}

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Toaster position='top-center' />
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
