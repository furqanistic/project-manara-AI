import { useCredits } from "@/hooks/useCredits";
import { stripeService } from "@/services/stripeService";
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  User,
  X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { useLogout } from "../../hooks/useAuth";

const TopBar = () => {
  const MotionDiv = motion.div;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showStudioAuthModal, setShowStudioAuthModal] = useState(false);
  const [mobileStudioOpen, setMobileStudioOpen] = useState(false);
  const [planLabel, setPlanLabel] = useState("No Active Plan");

  const { currentUser } = useSelector((state) => state.user);
  const { creditBalance } = useCredits();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const avatarUrl = currentUser?.onboardingData?.avatar?.url;
  const avatarName = currentUser?.onboardingData?.avatar?.name;

  const dropdownRefs = useRef({});
  const mobileMenuRef = useRef(null);

  // Lock body scroll when the mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMenuOpen]);

  useEffect(() => {
    let isMounted = true;

    const loadBillingStatus = async () => {
      if (!currentUser) {
        if (isMounted) setPlanLabel("No Active Plan");
        return;
      }

      try {
        const response = await stripeService.getBillingStatus();
        const subscription = response?.data?.subscription || {};
        const activeName = subscription?.planName || "No Active Plan";
        const scheduledName = subscription?.scheduledPlanName || null;
        const nextLabel = scheduledName
          ? `${activeName}`
          : activeName;

        if (isMounted) setPlanLabel(nextLabel);
      } catch {
        if (isMounted) {
          setPlanLabel("No Active Plan");
        }
      }
    };

    loadBillingStatus();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setMobileStudioOpen(false);
  };
  const toggleDropdown = (dropdown) =>
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);

  const handleAuthRedirect = (type) => navigate(`/auth?type=${type}`);
  const handleStudioAuthAction = (type) => {
    setShowStudioAuthModal(false);
    navigate(`/auth?type=${type}`);
  };
  const handleStudioNavigation = (event) => {
    if (currentUser) {
      setActiveDropdown(null);
      setIsMenuOpen(false);
      return;
    }

    event.preventDefault();
    setActiveDropdown(null);
    setIsMenuOpen(false);
    setShowStudioAuthModal(true);
  };
  const handleProtectedNavigation = (event, href) => {
    if (href !== "/projects") return;
    if (currentUser) {
      setIsMenuOpen(false);
      return;
    }

    event.preventDefault();
    setActiveDropdown(null);
    setIsMenuOpen(false);
    setShowStudioAuthModal(true);
  };
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setActiveDropdown(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const handleCreditsNavigation = () => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
    navigate("/subscription");
  };

  const navItems = [
    { name: "Home", href: "/", number: "01" },
    {
      name: "Studio",
      href: "#",
      number: "02",
      hasDropdown: true,
      dropdownItems: [
        { name: "3D Renders", href: "/visualizer", desc: "Photorealistic interiors from any photo.", state: { fromStudio: true, reset: true } },
        { name: "Floor Plans", href: "/floorplans", desc: "Precise layouts drawn to scale.", state: { fromStudio: true, reset: true } },
        { name: "AI Designs", href: "/moodboard", desc: "Curated furniture and finishes.", state: { fromStudio: true, reset: true } },
      ],
    },
    { name: "Projects", href: "/projects", number: "03" },
    ...(currentUser?.role === "admin"
      ? [{ name: "Admin", href: "/admin", number: "04" }]
      : []),
    { name: "Pricing", href: "/pricing", number: "05" },
    { name: "About", href: "/about", number: "06" },
  ].filter(Boolean);

  const renderStudioItem = (sub, subIndex, onNavigate, containerClass, dark = false) =>
    sub.href.startsWith("http") ? (
      <a
        key={subIndex}
        href={sub.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={containerClass}
      >
        <span
          className={`block text-[13px] font-medium leading-tight ${
            dark ? "text-ivory" : "text-gray-700"
          }`}
        >
          {sub.name}
        </span>
        {sub.desc && (
          <span
            className={`mt-0.5 block text-[11px] font-normal leading-snug ${
              dark ? "text-ivory/50" : "text-gray-400"
            }`}
          >
            {sub.desc}
          </span>
        )}
      </a>
    ) : (
      <NavLink
        key={subIndex}
        to={sub.href}
        state={sub.state}
        onClick={onNavigate}
        className={containerClass}
      >
        <span
          className={`block text-[13px] font-medium leading-tight ${
            dark ? "text-ivory" : "text-gray-700"
          }`}
        >
          {sub.name}
        </span>
        {sub.desc && (
          <span
            className={`mt-0.5 block text-[11px] font-normal leading-snug ${
              dark ? "text-ivory/50" : "text-gray-400"
            }`}
          >
            {sub.desc}
          </span>
        )}
      </NavLink>
    );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? "bg-ivory/90 backdrop-blur-xl border-b border-beige/80 py-2.5 shadow-[0_20px_50px_-25px_rgba(23,22,20,0.25)]"
          : "bg-transparent py-4"
      } ${isMenuOpen ? "lg:border-none" : ""}`}
    >
      <div className={`${isScrolled ? "max-w-[1600px]" : "max-w-[1600px]"} mx-auto px-5 lg:px-8`}>
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <NavLink to="/" className="flex items-center z-[60]">
            <img
              src="/logoicon.png"
              alt="Manara Logo"
              className="h-8 lg:h-9 w-auto object-contain transition-all hover:opacity-80"
            />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <div ref={(el) => (dropdownRefs.current[item.name] = el)}>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className={`flex items-center gap-1.5 text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                        activeDropdown === item.name
                          ? "text-[#8d775e]"
                          : "text-gray-600 hover:text-[#8d775e]"
                      }`}
                    >
                      {item.name}
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-300 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-3 w-56 bg-ivory border border-beige rounded-xl shadow-[0_30px_70px_-30px_rgba(23,22,20,0.35)] p-1.5"
                        >
                          {item.dropdownItems.map((subItem, i) =>
                            renderStudioItem(
                               subItem,
                               i,
                               () => setActiveDropdown(null),
                               "flex flex-col items-start px-3.5 py-2.5 rounded-lg transition-all hover:bg-white/70"
                             )
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    onClick={(event) => handleProtectedNavigation(event, item.href)}
                    className={({ isActive }) =>
                      `text-[13px] font-medium tracking-wide transition-colors duration-200 ${
                        isActive ? "text-[#8d775e]" : "text-gray-600 hover:text-[#8d775e]"
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
          <div className="flex items-center gap-2.5 lg:gap-4 z-[60]">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={handleCreditsNavigation}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#8d775e]/5 text-[#8d775e] ring-1 ring-[#8d775e]/20 hover:bg-[#8d775e]/10 transition-colors"
                  aria-label="Open subscription"
                >
                  <Banknote size={13} />
                  <span className="text-[11px] font-bold tracking-wide">{creditBalance} credits</span>
                </button>
                <div
                  className="relative"
                  ref={(el) => (dropdownRefs.current["user"] = el)}
                >
                  <button
                    onClick={() => toggleDropdown("user")}
                    className="flex items-center gap-2 p-1 pr-2.5 border border-beige bg-white/70 rounded-full hover:border-[#8d775e]/40 transition-all group"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#8d775e] flex items-center justify-center border border-white shadow-sm text-white overflow-hidden">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="User avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={13} />
                      )}
                    </div>
                    <span className="text-[13px] font-semibold text-gray-800 hidden md:block group-hover:text-[#8d775e]">
                      {currentUser.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={13} className="text-gray-400 group-hover:text-[#8d775e]" />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === "user" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-3 w-64 bg-ivory border border-beige rounded-xl shadow-[0_30px_70px_-30px_rgba(23,22,20,0.35)] overflow-hidden p-1.5"
                      >
                        <div className="px-3 py-3 mb-1 bg-white/70 rounded-xl">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {currentUser.name}
                          </p>
                          {avatarName && (
                            <p className="text-[11px] text-gray-500 mt-1 truncate">
                              Avatar: {avatarName}
                            </p>
                          )}
                          <p className="text-[10px] text-[#8d775e] font-bold uppercase tracking-wider mt-0.5">
                            {planLabel}
                          </p>
                          <p className="text-[11px] text-gray-600 mt-1">
                            Credits: <span className="font-bold text-[#8d775e]">{creditBalance}</span>
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <NavLink
                            to="/profile"
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-medium text-gray-600 hover:text-[#8d775e] hover:bg-white/70 transition-all"
                          >
                            <User size={15} className="text-gray-400" /> Profile
                          </NavLink>
                          <NavLink
                            to="/subscription"
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-medium text-gray-600 hover:text-[#8d775e] hover:bg-white/70 transition-all"
                          >
                            <Banknote size={15} className="text-gray-400" /> Billing
                          </NavLink>
                          <div className="h-px bg-beige my-1.5 mx-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-medium text-red-600 hover:bg-red-50 transition-all"
                          >
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={() => handleAuthRedirect("login")}
                  className="text-[13px] font-medium text-gray-600 hover:text-[#8d775e] transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleAuthRedirect("signup")}
                  className="px-5 py-2.5 bg-charcoal text-ivory rounded-full text-[13px] font-semibold tracking-wide hover:bg-[#8d775e] transition-colors duration-300"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className={`lg:hidden relative z-[60] h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                isMenuOpen
                  ? "border-ivory/20 bg-white/10 text-ivory"
                  : "border-beige bg-white/70 text-charcoal"
              }`}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Mobile Full-Screen Menu ===== */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden fixed inset-0 z-[55] bg-charcoal text-ivory flex flex-col overflow-y-auto"
          >
            {/* Ambient glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#8d775e]/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-56 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full px-7 pt-6 pb-10">
              {/* Top row */}
              <div className="flex items-center justify-between mb-10">
                <p className="label-arch-light">{isMenuOpen ? "Menu" : "Manāra"}</p>
                <button
                  onClick={toggleMenu}
                  aria-label="Close menu"
                  className="h-11 w-11 rounded-full border border-ivory/15 text-ivory flex items-center justify-center hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav list */}
              <nav className="flex-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ delay: 0.12 + index * 0.05, duration: 0.5 }}
                    className="border-b border-ivory/10"
                  >
                    {item.hasDropdown ? (
                      <div>
                        <button
                          onClick={() => setMobileStudioOpen((prev) => !prev)}
                          className="w-full flex items-center justify-between py-4 text-left group"
                        >
                          <span className="flex items-baseline gap-4 font-serif text-4xl text-ivory transition-colors duration-300 group-hover:text-[#c3a886]">
                            <span className="font-sans text-[10px] tracking-[0.3em] text-[#c3a886]">
                              {item.number}
                            </span>
                            {item.name}
                          </span>
                          <ChevronRight
                            size={20}
                            className={`text-[#c3a886] transition-transform duration-300 ${
                              mobileStudioOpen ? "rotate-90" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {mobileStudioOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pb-5 flex flex-col gap-1">
                                {item.dropdownItems.map((sub, j) =>
                                  renderStudioItem(
                                    sub,
                                    j,
                                    handleStudioNavigation,
                                    "flex flex-col items-start py-2.5 pl-16 transition-colors",
                                    true
                                  )
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <NavLink
                        to={item.href}
                        onClick={(event) => handleProtectedNavigation(event, item.href)}
                        className="group py-4 flex items-baseline gap-4 font-serif text-4xl text-ivory transition-colors duration-300 hover:text-[#c3a886]"
                      >
                        <span className="italic text-[10px] tracking-[0.3em] text-[#c3a886]">
                          {item.number}
                        </span>
                        {item.name}
                      </NavLink>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* Footer actions */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-10 space-y-4"
              >
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleCreditsNavigation}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#8d775e]/15 text-[#c3a886] ring-1 ring-[#8d775e]/30"
                      >
                        <Banknote size={14} />
                        <span className="text-xs font-bold tracking-wide">{creditBalance} credits</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-ivory/20 text-ivory/80 text-xs font-semibold tracking-wide hover:bg-ivory/5 transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleAuthRedirect("signup")}
                      className="group w-full h-[52px] rounded-xl bg-[#8d775e] text-white text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all hover:bg-[#a08163] active:scale-[0.99]"
                    >
                      Get Started
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                      onClick={() => handleAuthRedirect("login")}
                      className="w-full h-[52px] rounded-xl border border-ivory/25 text-ivory text-sm font-semibold tracking-wide hover:bg-ivory/5 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                )}

                <p className="pt-2 text-center label-meta text-ivory/40">
                  Manāra — AI Property Marketing Workspace
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {createPortal(
        <AnimatePresence>
          {showStudioAuthModal && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowStudioAuthModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              <MotionDiv
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md rounded-2xl bg-ivory border border-beige shadow-2xl p-6 sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#8d775e]/10 text-[#8d775e] flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8d775e]">
                        Account Access
                      </p>
                      <h3 className="font-serif text-2xl font-normal text-charcoal">
                        Account required
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStudioAuthModal(false)}
                    className="p-2 rounded-xl hover:bg-white/70 transition-all"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>

                <p className="mt-4 text-sm text-stone leading-relaxed">
                  To use these AI tools and access projects, you need an account. Create one or log in to continue.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleStudioAuthAction("signup")}
                    className="flex-1 h-[50px] rounded-xl bg-charcoal text-ivory text-sm font-semibold tracking-wide hover:bg-[#8d775e] transition-colors"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => handleStudioAuthAction("login")}
                    className="flex-1 h-[50px] rounded-xl border border-charcoal/25 text-charcoal text-sm font-semibold tracking-wide hover:bg-white transition-colors"
                  >
                    Log In
                  </button>
                </div>
              </MotionDiv>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};

export default TopBar;