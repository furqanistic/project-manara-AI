import { AnimatePresence, motion } from 'framer-motion';
import {
  Banknote,
  ChevronDown,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { currentUser } = useSelector((state) => state.user);
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const dropdownRefs = useRef({});
  const mobileMenuRef = useRef(null);

  // Scroll detection for styling changes
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDropdowns = Object.values(dropdownRefs.current).every(
        (ref) => ref && !ref.contains(event.target)
      );
      const isOutsideMobileMenu =
        !mobileMenuRef.current || !mobileMenuRef.current.contains(event.target);

      if (isOutsideDropdowns && activeDropdown) setActiveDropdown(null);
      if (isOutsideMobileMenu && isMenuOpen) setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown, isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = (dropdown) =>
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);

  const handleAuthRedirect = (type) => navigate(`/auth?type=${type}`);
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setActiveDropdown(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: "Home", href: "/" },
    {
      name: "Studio",
      href: "#",
      hasDropdown: true,
      dropdownItems: [
        { name: "3D Visualization", href: "/visualizer" },
        { name: "Floor Plans (2D)", href: "/floorplans" },
        { name: "Mood Boards", href: "/moodboard" },
      ],
    },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm"
          : "bg-white/90 backdrop-blur-md md:bg-transparent py-4 md:py-6"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <NavLink to="/" className="flex items-center gap-2 group z-50">
            <img 
              src="/logoicon.png" 
              alt="Manara Logo" 
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <div key={index} className="relative group">
                {item.hasDropdown ? (
                  <div ref={(el) => (dropdownRefs.current[item.name] = el)}>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-black/5"
                    >
                      {item.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-1.5 overflow-hidden"
                        >
                          {item.dropdownItems.map((subItem, i) => (
                            <NavLink
                              key={i}
                              to={subItem.href}
                              onClick={() => setActiveDropdown(null)}
                              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              {subItem.name}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `px-4 py-2 text-sm font-medium transition-colors rounded-full hover:bg-black/5 ${
                        isActive ? "text-gray-900 font-semibold" : "text-gray-600 hover:text-gray-900"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 z-50">
            {currentUser ? (
              <div
                className="relative"
                ref={(el) => (dropdownRefs.current["user"] = el)}
              >
                <button
                  onClick={() => toggleDropdown("user")}
                  className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-all hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-white shadow-inner">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 max-w-[100px] truncate hidden md:block">
                    {currentUser.name?.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                <AnimatePresence>
                  {activeDropdown === "user" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden p-2"
                    >
                      <div className="px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                        <p className="text-sm font-bold text-gray-900">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500 font-medium truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <NavLink
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                        >
                          <User size={16} className="text-gray-400" /> Profile
                        </NavLink>
                        <NavLink
                          to="/subscription"
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                        >
                          <Banknote size={16} className="text-gray-400" /> Subscription
                        </NavLink>
                        <div className="h-px bg-gray-100 my-1 mx-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-50 text-sm font-medium text-red-600 transition-colors text-left"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleAuthRedirect("login")}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-900 hover:text-black transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleAuthRedirect("signup")}
                  className="px-6 py-2.5 bg-[#1a1a1a] hover:bg-black text-white rounded-full text-sm font-bold shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button - Keeping it simple */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2.5 text-gray-900 bg-white/50 backdrop-blur-md rounded-full border border-gray-200"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Full Screen */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-6 py-8 space-y-8 h-[80vh] overflow-y-auto">
              <div className="space-y-6">
                {navItems.map((item, i) => (
                  <div key={i} className="space-y-4">
                    {item.hasDropdown ? (
                      <div className="space-y-3">
                        <div className="text-2xl font-bold text-gray-900 tracking-tight">
                          {item.name}
                        </div>
                        <div className="pl-4 space-y-3 border-l-2 border-gray-100">
                          {item.dropdownItems.map((sub, j) => (
                            <NavLink
                              key={j}
                              to={sub.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="block text-lg text-gray-500 font-medium py-1"
                            >
                              {sub.name}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <NavLink
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-2xl font-bold text-gray-900 tracking-tight"
                      >
                        {item.name}
                      </NavLink>
                    )}
                  </div>
                ))}
              </div>

              {!currentUser && (
                <div className="pt-8 border-t border-gray-100 grid gap-4">
                  <button
                    onClick={() => {
                      handleAuthRedirect("login");
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-4 rounded-xl border border-gray-200 font-bold text-lg text-gray-900"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      handleAuthRedirect("signup");
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default TopBar;