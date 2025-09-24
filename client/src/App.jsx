// File: client/src/App.jsx
import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AboutPage from './pages/About/AboutPage'
import FloorPlanGenerator from './pages/AIBuilders/FloorPlanGenerator'
import MoodboardGenerator from './pages/AIBuilders/MoodboardGenerator'
import AuthPage from './pages/Auth/AuthPage'
import HomePage from './pages/Home/HomePage'

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/'>
            <Route index element={<HomePage />} />
            <Route path='/about' element={<AboutPage />} />
            <Route path='/auth' element={<AuthPage />} />
            <Route path='/moodboard' element={<MoodboardGenerator />} />
            <Route path='/floorplans' element={<FloorPlanGenerator />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
