import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [isLightBackground, setIsLightBackground] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      // Detect background color by checking the element behind the navbar
      const element = document.elementFromPoint(window.innerWidth / 2, 80)
      if (element) {
        const styles = window.getComputedStyle(element)
        const bgColor = styles.backgroundColor
        const computedColor = styles.getPropertyValue('background-color')

        // Simple heuristic: if background is light (white, light gray, etc.)
        const isLight =
          bgColor === 'rgb(255, 255, 255)' ||
          bgColor === 'rgba(255, 255, 255, 1)' ||
          computedColor.includes('255, 255, 255') ||
          element.closest('.bg-white') ||
          element.closest('[class*="bg-gray-1"]') ||
          element.closest('[class*="bg-slate-1"]')

        setIsLightBackground(isLight)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  const navItems = [
    { name: 'Home', href: '#' },
    {
      name: 'Design Studio',
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        { name: 'AI Design Copilot', href: '#' },
        { name: '3D Visualization', href: '#' },
        { name: 'Floor Plans (2D)', href: '#' },
        { name: 'Mood Boards', href: '#' },
      ],
    },
    { name: 'Projects', href: '#' },
    { name: 'Marketplace', href: '#' },
    { name: 'Resources', href: '#' },
  ]

  return (
    <div className='fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4'>
      <div className='max-w-6xl mx-auto'>
        <nav
          className={`relative transition-all duration-300 ease-out rounded-full px-6 py-3 ${
            isLightBackground
              ? isScrolled
                ? 'bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-2xl shadow-black/10'
                : 'bg-white/70 backdrop-blur-2xl border border-gray-200/30 shadow-lg'
              : isScrolled
              ? 'bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl'
              : 'bg-black/20 backdrop-blur-2xl border border-white/10'
          }`}
        >
          {/* Glassy highlight effect */}
          <div
            className={`absolute inset-x-0 top-0 h-px rounded-full ${
              isLightBackground
                ? 'bg-gradient-to-r from-transparent via-gray-300/50 to-transparent'
                : 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
            }`}
          ></div>

          <div className='flex items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center'>
              <div className='relative'>
                <img
                  src='logo.png'
                  alt='Manāra Logo'
                  className='h-10 w-auto object-contain max-w-none'
                  onError={(e) => {
                    // Fallback to gradient logo if image fails to load
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className='w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full items-center justify-center hidden'>
                  <Sparkles className='w-4 h-4 text-black' />
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden lg:flex items-center space-x-1'>
              {navItems.map((item, index) => (
                <div key={index} className='relative'>
                  {item.hasDropdown ? (
                    <div className='relative'>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex items-center space-x-1 px-4 py-2 transition-all duration-200 rounded-full group ${
                          isLightBackground
                            ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span className='text-sm font-medium'>{item.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown */}
                      {activeDropdown === item.name && (
                        <div
                          className={`absolute top-full mt-2 left-0 min-w-48 backdrop-blur-2xl border rounded-2xl shadow-2xl overflow-hidden ${
                            isLightBackground
                              ? 'bg-white/90 border-gray-200/50'
                              : 'bg-black/80 border-white/20'
                          }`}
                        >
                          <div
                            className={`absolute inset-x-0 top-0 h-px ${
                              isLightBackground
                                ? 'bg-gradient-to-r from-transparent via-gray-300/50 to-transparent'
                                : 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
                            }`}
                          ></div>
                          <div className='py-2'>
                            {item.dropdownItems.map(
                              (dropdownItem, dropdownIndex) => (
                                <a
                                  key={dropdownIndex}
                                  href={dropdownItem.href}
                                  className={`block px-4 py-2 text-sm transition-all duration-200 ${
                                    isLightBackground
                                      ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                                  }`}
                                >
                                  {dropdownItem.name}
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className={`px-4 py-2 transition-all duration-200 rounded-full text-sm font-medium ${
                        isLightBackground
                          ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className='flex items-center space-x-3'>
              {/* User Menu - Desktop */}
              <div className='relative hidden lg:block'>
                <button
                  onClick={() => toggleDropdown('user')}
                  className={`flex items-center space-x-2 px-3 py-2 border rounded-full transition-all duration-200 group ${
                    isLightBackground
                      ? 'bg-gray-50/50 hover:bg-gray-100/70 border-gray-200/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/20'
                  }`}
                >
                  <div className='w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center'>
                    <User className='w-3 h-3 text-white' />
                  </div>
                  <span
                    className={`text-sm group-hover:text-current transition-colors ${
                      isLightBackground ? 'text-gray-700' : 'text-gray-300'
                    }`}
                  >
                    Account
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isLightBackground ? 'text-gray-500' : 'text-gray-400'
                    } ${activeDropdown === 'user' ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* User Dropdown */}
                {activeDropdown === 'user' && (
                  <div
                    className={`absolute top-full mt-2 right-0 min-w-48 backdrop-blur-2xl border rounded-2xl shadow-2xl overflow-hidden ${
                      isLightBackground
                        ? 'bg-white/90 border-gray-200/50'
                        : 'bg-black/80 border-white/20'
                    }`}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-px ${
                        isLightBackground
                          ? 'bg-gradient-to-r from-transparent via-gray-300/50 to-transparent'
                          : 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
                      }`}
                    ></div>
                    <div className='py-2'>
                      <a
                        href='#'
                        className={`flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 ${
                          isLightBackground
                            ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <User className='w-4 h-4' />
                        <span>Profile</span>
                      </a>
                      <a
                        href='#'
                        className={`flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 ${
                          isLightBackground
                            ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Settings className='w-4 h-4' />
                        <span>Settings</span>
                      </a>
                      <hr
                        className={`my-1 ${
                          isLightBackground
                            ? 'border-gray-200/50'
                            : 'border-white/10'
                        }`}
                      />
                      <a
                        href='#'
                        className='flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all duration-200'
                      >
                        <LogOut className='w-4 h-4' />
                        <span>Sign Out</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button className='hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-full hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-amber-500/25'>
                <span className='text-sm'>Start Designing</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMenu}
                className={`lg:hidden p-2 transition-colors duration-200 ${
                  isLightBackground
                    ? 'text-gray-700 hover:text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {isMenuOpen ? (
                  <X className='w-5 h-5' />
                ) : (
                  <Menu className='w-5 h-5' />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div
              className={`lg:hidden absolute top-full left-0 right-0 mt-2 backdrop-blur-2xl border rounded-2xl shadow-2xl overflow-hidden ${
                isLightBackground
                  ? 'bg-white/90 border-gray-200/50'
                  : 'bg-black/80 border-white/20'
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-px ${
                  isLightBackground
                    ? 'bg-gradient-to-r from-transparent via-gray-300/50 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-white/30 to-transparent'
                }`}
              ></div>
              <div className='py-4 px-6 space-y-1'>
                {navItems.map((item, index) => (
                  <div key={index}>
                    {item.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(`mobile-${item.name}`)}
                          className={`flex items-center justify-between w-full px-3 py-2 transition-colors duration-200 rounded-lg ${
                            isLightBackground
                              ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span>{item.name}</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              activeDropdown === `mobile-${item.name}`
                                ? 'rotate-180'
                                : ''
                            }`}
                          />
                        </button>
                        {activeDropdown === `mobile-${item.name}` && (
                          <div className='mt-1 ml-4 space-y-1'>
                            {item.dropdownItems.map(
                              (dropdownItem, dropdownIndex) => (
                                <a
                                  key={dropdownIndex}
                                  href={dropdownItem.href}
                                  className={`block px-3 py-2 text-sm transition-colors duration-200 rounded-lg ${
                                    isLightBackground
                                      ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                                  }`}
                                >
                                  {dropdownItem.name}
                                </a>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        className={`block px-3 py-2 transition-colors duration-200 rounded-lg ${
                          isLightBackground
                            ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {item.name}
                      </a>
                    )}
                  </div>
                ))}

                {/* Mobile CTA */}
                <div
                  className={`pt-4 border-t ${
                    isLightBackground ? 'border-gray-200/50' : 'border-white/10'
                  }`}
                >
                  <button className='w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-full hover:scale-105 transition-all duration-200'>
                    Start Designing
                  </button>
                </div>

                {/* Mobile User Options */}
                <div className='pt-2 space-y-1'>
                  <a
                    href='#'
                    className={`flex items-center space-x-2 px-3 py-2 transition-colors duration-200 rounded-lg ${
                      isLightBackground
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <User className='w-4 h-4' />
                    <span>Profile</span>
                  </a>
                  <a
                    href='#'
                    className={`flex items-center space-x-2 px-3 py-2 transition-colors duration-200 rounded-lg ${
                      isLightBackground
                        ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Settings className='w-4 h-4' />
                    <span>Settings</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Backdrop blur enhancement */}
          <div
            className={`absolute inset-0 -z-10 rounded-full blur-3xl opacity-50 ${
              isLightBackground
                ? 'bg-gradient-to-r from-gray-100/30 via-white/50 to-gray-100/30'
                : 'bg-gradient-to-r from-white/5 via-white/10 to-white/5'
            }`}
          ></div>
        </nav>
      </div>
    </div>
  )
}

export default TopBar
