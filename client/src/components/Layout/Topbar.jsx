import { AnimatePresence, motion } from 'framer-motion';
import {
    Banknote,
    ChevronDown,
    LogOut,
    Menu,
    Moon,
    Sun,
    User,
    X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";

const TopBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  const { currentUser } = useSelector((state) => state.user);
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRefs = useRef({});
  const mobileMenuRef = useRef(null);

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Scroll detection for styling changes
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
        { name: "3D Renders", href: "https://manarad-furnara-connect.hf.space" },
        { name: "Floor Plans", href: "/floorplans" },
        { name: "AI Designs", href: "/moodboard" },
      ],
    },
    { name: "Projects", href: "/projects" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
  ];

  const primaryColor = "#8d775e";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-white/10 py-2 shadow-lg dark:shadow-2xl"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <NavLink to="/" className="flex items-center z-50">
            <img 
              src="/logoicon.png" 
              alt="Manara Logo" 
              className="h-9 w-auto object-contain transition-all hover:opacity-80 dark:brightness-110"
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
                      className={`flex items-center gap-1.5 px-4 py-2 text-[15px] font-medium transition-all duration-200 rounded-full ${
                        activeDropdown === item.name 
                        ? "bg-[#8d775e]/5 dark:bg-white/10 text-[#8d775e] dark:text-white ring-1 ring-[#8d775e]/20 dark:ring-white/5" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {item.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 p-1.5 overflow-hidden"
                        >
                          {item.dropdownItems.map((subItem, i) => (
                            subItem.href.startsWith("http") ? (
                              <a
                                key={i}
                                href={subItem.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                              >
                                {subItem.name}
                              </a>
                            ) : (
                              <NavLink
                                key={i}
                                to={subItem.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                              >
                                {subItem.name}
                              </NavLink>
                            )
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `px-4 py-2 text-[15px] font-medium transition-all duration-200 rounded-full ${
                        isActive 
                        ? "text-[#8d775e] bg-[#8d775e]/5 ring-1 ring-[#8d775e]/20 dark:text-white dark:bg-white/10 dark:ring-white/5" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
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
          <div className="flex items-center gap-3 z-50">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors order-first lg:order-none"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {currentUser ? (
              <div
                className="relative"
                ref={(el) => (dropdownRefs.current["user"] = el)}
              >
                <button
                  onClick={() => toggleDropdown("user")}
                  className="flex items-center gap-2 p-1 pr-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full hover:border-[#8d775e]/30 dark:hover:border-white/20 transition-all shadow-sm group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#8d775e] flex items-center justify-center border border-white dark:border-gray-800 shadow-sm text-white">
                    <User size={16} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white hidden md:block">
                    {currentUser.name?.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                </button>

                <AnimatePresence>
                  {activeDropdown === "user" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#0f0f0f] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 overflow-hidden p-1.5"
                    >
                      <div className="px-3 py-3 mb-1 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-[#8d775e] font-bold uppercase tracking-wider mt-0.5">
                          Pro Member
                        </p>
                      </div>

                      <div className="space-y-0.5">
                        <NavLink
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-[14px] font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
                        >
                          <User size={16} className="text-gray-400" /> Profile
                        </NavLink>
                        <NavLink
                          to="/subscription"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-[14px] font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
                        >
                          <Banknote size={16} className="text-gray-400" /> Billing
                        </NavLink>
                        <div className="h-px bg-gray-100 dark:bg-white/10 my-1.5 mx-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-[14px] font-medium text-red-600 dark:text-red-400 transition-all"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAuthRedirect("login")}
                  className="hidden sm:block px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleAuthRedirect("signup")}
                  style={{ backgroundColor: primaryColor }}
                  className="px-6 py-2.5 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all hover:brightness-110 active:scale-95"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-all"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 dark:bg-black/80 backdrop-blur-sm z-[-1]"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navItems.map((item, i) => (
                  <div key={i} className="flex flex-col">
                    {item.hasDropdown ? (
                      <div className="space-y-1">
                        <div className="px-4 py-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2">
                          {item.name}
                        </div>
                        {item.dropdownItems.map((sub, j) => (
                          sub.href.startsWith("http") ? (
                            <a
                              key={j}
                              href={sub.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                            >
                              {sub.name}
                            </a>
                          ) : (
                            <NavLink
                              key={j}
                              to={sub.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                            >
                              {sub.name}
                            </NavLink>
                          )
                        ))}
                      </div>
                    ) : (
                      <NavLink
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="px-4 py-3.5 text-[16px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                      >
                        {item.name}
                      </NavLink>
                    )}
                  </div>
                ))}
                
                {/* Mobile Dark Mode Toggle */}
                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-white/10">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-[16px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all"
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default TopBar;