// File: client/src/components/Layout/Topbar.jsx
import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '../../hooks/useAuth'

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

  const { currentUser } = useSelector((state) => state.user)
  const logoutMutation = useLogout()
  const navigate = useNavigate()

  const dropdownRefs = useRef({})
  const mobileMenuRef = useRef(null)

  const brandColor = '#937c60'
  const brandColorLight = '#a68970'

  // Track scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDropdowns = Object.values(dropdownRefs.current).every(
        (ref) => ref && !ref.contains(event.target)
      )
      const isOutsideMobileMenu =
        !mobileMenuRef.current || !mobileMenuRef.current.contains(event.target)

      if (isOutsideDropdowns && activeDropdown) setActiveDropdown(null)
      if (isOutsideMobileMenu && isMenuOpen) setIsMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdown, isMenuOpen])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleDropdown = (dropdown) =>
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)

  const navItems = [
    { name: 'Home', href: '/' },
    {
      name: 'Design Studio',
      href: '#',
      hasDropdown: true,
      dropdownItems: [
        { name: '3D Visualization', href: '#' },
        { name: 'Floor Plans (2D)', href: '/floorplans' },
        { name: 'Mood Boards', href: '/moodboard' },
      ],
    },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
  ]

  const handleAuthRedirect = (type) => navigate(`/auth?type=${type}`)
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      setActiveDropdown(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Colors for white background
  const textColor = 'text-gray-800'
  const hoverTextColor = 'hover:text-gray-900'
  const hoverBg = 'hover:bg-gray-100'
  const borderColor = 'border-gray-200'
  const dropdownBg = 'bg-white'
  const buttonBg = 'bg-gray-50'

  return (
    <div className='fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4'>
      <div className='max-w-5xl mx-auto'>
        <nav
          ref={mobileMenuRef}
          className={`relative transition-all duration-300 ease-out rounded-full px-6 py-3 ${
            isScrolled
              ? 'bg-white border border-gray-200 shadow-lg'
              : 'bg-white border border-gray-100'
          }`}
        >
          <div className='flex items-center justify-between'>
            {/* Logo */}
            <div className='flex items-center'>
              <div className='relative'>
                <img
                  src='/logo.png'
                  alt='Manāra Logo'
                  className='h-10 w-auto object-contain max-w-none'
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div
                  className='w-8 h-8 rounded-full items-center justify-center hidden'
                  style={{
                    background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                  }}
                >
                  <Sparkles className='w-4 h-4 text-white' />
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className='hidden lg:flex items-center space-x-1'>
              {navItems.map((item, index) => (
                <div key={index} className='relative'>
                  {item.hasDropdown ? (
                    <div
                      className='relative'
                      ref={(el) => (dropdownRefs.current[item.name] = el)}
                    >
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex items-center space-x-1 px-4 py-2 transition-all duration-200 rounded-full group ${textColor} ${hoverTextColor} ${hoverBg}`}
                      >
                        <span className='text-sm font-medium'>{item.name}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {activeDropdown === item.name && (
                        <div
                          className={`absolute top-full mt-2 left-0 min-w-48 border ${borderColor} rounded-2xl shadow-lg overflow-hidden ${dropdownBg}`}
                        >
                          <div className='py-2'>
                            {item.dropdownItems.map((dropdownItem, i) => (
                              <a
                                key={i}
                                href={dropdownItem.href}
                                className={`block px-4 py-2 text-sm transition-all duration-200 ${textColor} ${hoverTextColor} ${hoverBg}`}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className={`px-4 py-2 transition-all duration-200 rounded-full text-sm font-medium ${textColor} ${hoverTextColor} ${hoverBg}`}
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className='flex items-center space-x-3'>
              {currentUser ? (
                <div
                  className='relative hidden lg:block'
                  ref={(el) => (dropdownRefs.current['user'] = el)}
                >
                  <button
                    onClick={() => toggleDropdown('user')}
                    disabled={logoutMutation.isPending}
                    className={`flex items-center space-x-2 px-3 py-2 border ${borderColor} rounded-full transition-all duration-200 group ${buttonBg} ${hoverBg} ${
                      logoutMutation.isPending
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <div className='w-6 h-6 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center'>
                      <User className='w-3 h-3 text-white' />
                    </div>
                    <span className='text-sm text-gray-800 truncate max-w-[120px]'>
                      {currentUser.name || 'User'}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                        activeDropdown === 'user' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {activeDropdown === 'user' && (
                    <div
                      className={`absolute top-full mt-2 right-0 min-w-48 border ${borderColor} rounded-2xl shadow-lg overflow-hidden ${dropdownBg}`}
                    >
                      <div className='py-2'>
                        <div className='px-4 py-2 border-b border-gray-200'>
                          <p className='text-sm font-medium text-gray-900'>
                            {currentUser.name}
                          </p>
                          <p className='text-xs text-gray-600'>
                            {currentUser.email}
                          </p>
                          {currentUser.role === 'admin' && (
                            <span className='inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white'>
                              ADMIN
                            </span>
                          )}
                        </div>
                        <a
                          href='#'
                          className={`flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 ${textColor} ${hoverTextColor} ${hoverBg}`}
                        >
                          <User className='w-4 h-4' />
                          <span>Profile</span>
                        </a>
                        <a
                          href='#'
                          className={`flex items-center space-x-2 px-4 py-2 text-sm transition-all duration-200 ${textColor} ${hoverTextColor} ${hoverBg}`}
                        >
                          <Settings className='w-4 h-4' />
                          <span>Settings</span>
                        </a>
                        <hr className='my-1 border-gray-200' />
                        <button
                          onClick={handleLogout}
                          disabled={logoutMutation.isPending}
                          className='w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 disabled:opacity-50'
                        >
                          {logoutMutation.isPending ? (
                            <>
                              <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                              <span>Signing Out...</span>
                            </>
                          ) : (
                            <>
                              <LogOut className='w-4 h-4' />
                              <span>Sign Out</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='hidden sm:flex items-center space-x-2'>
                  <button
                    onClick={() => handleAuthRedirect('login')}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${textColor} ${hoverTextColor} ${hoverBg}`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleAuthRedirect('signup')}
                    className='px-4 py-2 text-white text-sm font-semibold rounded-full hover:scale-105 transition-all duration-200 shadow-md'
                    style={{
                      background: `linear-gradient(to right, ${brandColor}, ${brandColorLight})`,
                      boxShadow: `0 4px 15px ${brandColor}40`,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = `linear-gradient(to right, ${brandColorLight}, ${brandColor})`
                      e.target.style.boxShadow = `0 6px 20px ${brandColor}50`
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = `linear-gradient(to right, ${brandColor}, ${brandColorLight})`
                      e.target.style.boxShadow = `0 4px 15px ${brandColor}40`
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <button
                onClick={toggleMenu}
                className={`lg:hidden p-2 text-gray-800 hover:text-gray-900 transition-colors duration-200`}
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
              className={`lg:hidden absolute top-full left-0 right-0 mt-2 border ${borderColor} rounded-2xl shadow-lg overflow-hidden ${dropdownBg}`}
            >
              <div className='py-4 px-6 space-y-1'>
                {navItems.map((item, index) => (
                  <div key={index}>
                    {item.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(`mobile-${item.name}`)}
                          className={`flex items-center justify-between w-full px-3 py-2 transition-colors duration-200 rounded-lg ${textColor} ${hoverTextColor} ${hoverBg}`}
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
                            {item.dropdownItems.map((dropdownItem, i) => (
                              <a
                                key={i}
                                href={dropdownItem.href}
                                className={`block px-3 py-2 text-sm transition-colors duration-200 rounded-lg ${textColor} ${hoverTextColor} ${hoverBg}`}
                              >
                                {dropdownItem.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        className={`block px-3 py-2 transition-colors duration-200 rounded-lg ${textColor} ${hoverTextColor} ${hoverBg}`}
                      >
                        {item.name}
                      </a>
                    )}
                  </div>
                ))}

                {currentUser ? (
                  <div className='pt-4 border-t border-gray-200'>
                    <div className='px-3 py-2 mb-2'>
                      <p className='text-sm font-medium text-gray-900'>
                        {currentUser.name}
                      </p>
                      <p className='text-xs text-gray-600'>
                        {currentUser.email}
                      </p>
                    </div>
                    <a
                      href='#'
                      className={`flex items-center space-x-2 px-3 py-2 transition-colors duration-200 rounded-lg ${textColor} ${hoverTextColor} ${hoverBg}`}
                    >
                      <User className='w-4 h-4' />
                      <span>Profile</span>
                    </a>
                    <a
                      href='#'
                      className={`flex items-center space-x-2 px-3 py-2 transition-colors duration-200 rounded-lg ${textColor} ${hoverTextColor} ${hoverBg}`}
                    >
                      <Settings className='w-4 h-4' />
                      <span>Settings</span>
                    </a>
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className='w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 rounded-lg disabled:opacity-50'
                    >
                      {logoutMutation.isPending ? (
                        <>
                          <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                          <span>Signing Out...</span>
                        </>
                      ) : (
                        <>
                          <LogOut className='w-4 h-4' />
                          <span>Sign Out</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className='pt-4 border-t border-gray-200 space-y-2'>
                    <button
                      onClick={() => handleAuthRedirect('login')}
                      className={`w-full px-4 py-3 text-sm font-medium rounded-full transition-all duration-200 border ${borderColor} ${textColor} ${hoverTextColor} ${hoverBg}`}
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => handleAuthRedirect('signup')}
                      className='w-full px-4 py-3 text-white font-semibold rounded-full hover:scale-105 transition-all duration-200'
                      style={{
                        background: `linear-gradient(to right, ${brandColor}, ${brandColorLight})`,
                      }}
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

export default TopBar
