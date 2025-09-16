// File: client/src/pages/Home/HomePage.jsx
import HeroSection from '@/components/Home/HeroSection'
import ImageCollageSection from '@/components/Home/ImageCollageSection'
import TopBar from '@/components/Layout/Topbar'

import React from 'react'

const HomePage = () => {
  return (
    <>
      <TopBar />
      <HeroSection />
      <ImageCollageSection />
    </>
  )
}

export default HomePage
