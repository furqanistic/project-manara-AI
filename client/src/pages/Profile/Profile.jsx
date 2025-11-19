// File: client/src/pages/Profile/Profile.jsx
// ✨ FIXED VERSION - Password change success/error messages now work properly

import TopBar from "@/components/Layout/Topbar";
import React, { useState, useEffect } from "react";
import {
  useCurrentUser,
  useChangePassword,
  useUpdateProfile,
} from "@/hooks/useAuth";
import {
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  BRAND_COLOR_DARK,
} from "@/components/Moodboard/Moodboardconfig";

// Lucide Icons
import {
  User,
  Mail,
  CheckCircle2,
  Lock,
  Fingerprint,
  Crown,
  Calendar,
  RefreshCw,
  Key,
  Clock,
  TrendingUp,
  Shield,
  Activity,
  Eye,
  EyeOff,
  AlertCircle,
  MapPin,
  Edit2,
  Save,
  X,
  LogIn,
} from "lucide-react";

function Profile() {
  // ============ Hooks & State ============
  const currentUser = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  // Profile form states
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Real-time validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});

  // ============ Effects ============
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser]);

  // ✅ FIXED: Better success message handling with longer timeout
  useEffect(() => {
    if (successMessage) {
      console.log("Success message set:", successMessage);
      const timer = setTimeout(() => {
        console.log("Clearing success message");
        setSuccessMessage("");
      }, 4000); // Increased from 3000 to 4000ms
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ✅ FIXED: Better error message handling
  useEffect(() => {
    if (errorMessage) {
      console.log("Error message set:", errorMessage);
      const timer = setTimeout(() => {
        console.log("Clearing error message");
        setErrorMessage("");
      }, 6000); // Increased from 5000 to 6000ms
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // ============ Validation Functions ============
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswordStrength = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("8+ characters required");
    if (!/[A-Z]/.test(password)) errors.push("Need uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("Need lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Need a number");
    return errors;
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case "name":
        if (!value.trim()) {
          errors.name = "Full name is required";
        } else if (value.trim().length < 2) {
          errors.name = "Name must be at least 2 characters";
        } else {
          delete errors.name;
        }
        break;

      case "email":
        if (!value.trim()) {
          errors.email = "Email is required";
        } else if (!validateEmail(value)) {
          errors.email = "Invalid email format";
        } else {
          delete errors.email;
        }
        break;

      case "currentPassword":
        if (!value) {
          errors.currentPassword = "Current password required";
        } else {
          delete errors.currentPassword;
        }
        break;

      case "newPassword":
        if (!value) {
          errors.newPassword = "New password required";
        } else {
          const strengthErrors = validatePasswordStrength(value);
          if (strengthErrors.length > 0) {
            errors.newPassword = strengthErrors[0];
          } else {
            delete errors.newPassword;
          }
        }
        break;

      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Please confirm password";
        } else if (value !== passwordForm.newPassword) {
          errors.confirmPassword = "Passwords do not match";
        } else {
          delete errors.confirmPassword;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
  };

  // ============ Event Handlers ============
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
    validateField(name, value);
  };

  const handleProfileTouch = (name) => {
    setFieldTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
    validateField(name, value);
  };

  const handlePasswordTouch = (name) => {
    setFieldTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setValidationErrors({});
    setFieldTouched({});
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setProfileForm({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    });
    setValidationErrors({});
    setFieldTouched({});
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    setFieldTouched({
      name: true,
      email: true,
    });

    try {
      if (!profileForm.name.trim()) {
        setErrorMessage("Full name is required");
        setLoading(false);
        return;
      }

      if (!profileForm.email.trim()) {
        setErrorMessage("Email is required");
        setLoading(false);
        return;
      }

      if (!validateEmail(profileForm.email)) {
        setErrorMessage("Invalid email format");
        setLoading(false);
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrorMessage("Please fix the errors before submitting");
        setLoading(false);
        return;
      }

      await updateProfileMutation.mutateAsync({
        name: profileForm.name.trim(),
        email: profileForm.email.toLowerCase().trim(),
      });

      setSuccessMessage("Profile updated successfully!");
      setIsEditMode(false);
      setFieldTouched({});
    } catch (error) {
      const errorMsg =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to update profile";
      setErrorMessage(errorMsg);
      console.error("Profile update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Completely rewritten password submit handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages first
    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    // Mark all fields as touched for validation
    setFieldTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    try {
      // ✅ VALIDATION CHECKS
      if (!passwordForm.currentPassword) {
        const msg = "Current password is required";
        setErrorMessage(msg);
        console.error(msg);
        setLoading(false);
        return;
      }

      if (!passwordForm.newPassword) {
        const msg = "New password is required";
        setErrorMessage(msg);
        console.error(msg);
        setLoading(false);
        return;
      }

      const strengthErrors = validatePasswordStrength(passwordForm.newPassword);
      if (strengthErrors.length > 0) {
        const msg = `Password: ${strengthErrors[0]}`;
        setErrorMessage(msg);
        console.error(msg);
        setLoading(false);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        const msg = "Passwords do not match";
        setErrorMessage(msg);
        console.error(msg);
        setLoading(false);
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        const msg = "Please fix the errors before submitting";
        setErrorMessage(msg);
        console.error(msg);
        setLoading(false);
        return;
      }

      // ✅ API CALL - Wait for response
      console.log("Submitting password change...");
      const response = await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      console.log("Password change response:", response);

      // ✅ SUCCESS - Reset form and show message
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFieldTouched({});
      setValidationErrors({});

      const successMsg = "Password changed successfully!";
      console.log("Setting success message:", successMsg);
      setSuccessMessage(successMsg);
    } catch (error) {
      // ✅ ERROR HANDLING
      console.error("Password change error:", error);

      let errorMsg = "Failed to change password";

      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      console.log("Final error message:", errorMsg);
      setErrorMessage(errorMsg);

      // Don't reset form on error - user might want to retry
    } finally {
      setLoading(false);
      console.log("Loading state set to false");
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ============ Utility Functions ============
  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const getStatusBadge = (role) => {
    if (role === "admin") return { text: "Administrator", color: "#e74c3c" };
    return { text: "User", color: "#3498db" };
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============ Enhanced Styles ============
  const pageContainerStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: `linear-gradient(135deg, #faf8f5 0%, #f5f1ed 100%)`,
  };

  const topbarWrapperStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    backgroundColor: "white",
    boxShadow: "0 2px 12px rgba(147, 124, 96, 0.08)",
    backdropFilter: "blur(10px)",
  };

  const mainContentStyle = {
    flex: 1,
    paddingTop: isMobile ? "80px" : isTablet ? "90px" : "100px",
    paddingBottom: "40px",
  };

  const contentWrapperStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: isMobile ? "20px 16px" : isTablet ? "32px 28px" : "48px 40px",
    width: "100%",
    boxSizing: "border-box",
  };

  const headerStyle = {
    marginBottom: isMobile ? "36px" : "48px",
    display: "flex",
    alignItems: "flex-end",
    gap: isMobile ? "16px" : "28px",
    padding: isMobile ? "24px 16px" : isTablet ? "32px 24px" : "40px 32px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(147, 124, 96, 0.12)",
    border: `1px solid rgba(147, 124, 96, 0.08)`,
  };

  const avatarStyle = {
    width: isMobile ? "80px" : isTablet ? "100px" : "120px",
    height: isMobile ? "80px" : isTablet ? "100px" : "120px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%)`,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "40px" : "52px",
    fontWeight: "700",
    boxShadow: `0 8px 28px rgba(147, 124, 96, 0.2)`,
    flexShrink: 0,
  };

  const headerTextStyle = {
    flex: 1,
  };

  const titleStyle = {
    fontSize: isMobile ? "26px" : isTablet ? "30px" : "36px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  };

  const subtitleStyle = {
    fontSize: isMobile ? "13px" : "14px",
    color: "#666",
    margin: "0 0 14px 0",
    fontWeight: "500",
  };

  const statusBadgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    backgroundColor: `${BRAND_COLOR}15`,
    color: BRAND_COLOR,
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    border: `1px solid ${BRAND_COLOR}30`,
  };

  // ✅ IMPROVED: Better alert styling
  const alertStyle = (type) => ({
    padding: isMobile ? "14px 16px" : "16px 20px",
    marginBottom: "24px",
    backgroundColor: type === "success" ? "#f0fdf4" : "#fef2f2",
    color: type === "success" ? "#166534" : "#b91c1c",
    borderRadius: "10px",
    border: `2px solid ${type === "success" ? "#86efac" : "#fecaca"}`,
    fontSize: isMobile ? "13px" : "14px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    boxSizing: "border-box",
    animation: "slideIn 0.3s ease-out",
    boxShadow:
      type === "success"
        ? "0 4px 12px rgba(22, 163, 74, 0.15)"
        : "0 4px 12px rgba(185, 28, 28, 0.15)",
  });

  const tabContainerStyle = {
    display: "flex",
    gap: isMobile ? "0" : "8px",
    marginBottom: "28px",
    borderBottom: `2px solid ${BRAND_COLOR}20`,
    overflowX: "auto",
    scrollBehavior: "smooth",
  };

  const tabButtonStyle = (isActive) => ({
    padding: isMobile ? "14px 14px" : isTablet ? "16px 20px" : "16px 24px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: isActive ? "600" : "500",
    color: isActive ? BRAND_COLOR : "#6b7280",
    borderBottom: isActive ? `3px solid ${BRAND_COLOR}` : "none",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
    marginBottom: "-2px",
    position: "relative",
    opacity: isActive ? 1 : 0.7,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });

  const cardStyle = {
    backgroundColor: "white",
    padding: isMobile ? "24px 18px" : isTablet ? "32px 28px" : "40px 36px",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(147, 124, 96, 0.1)",
    border: `1px solid rgba(147, 124, 96, 0.06)`,
  };

  const infoSectionStyle = {
    marginBottom: isMobile ? "36px" : "48px",
    paddingBottom: isMobile ? "28px" : "36px",
    borderBottom: `1px solid ${BRAND_COLOR}12`,
  };

  const infoSectionLastStyle = {
    marginBottom: "0",
    paddingBottom: "0",
    borderBottom: "none",
  };

  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: isMobile ? "24px" : "32px",
    paddingBottom: isMobile ? "16px" : "20px",
    borderBottom: `2px solid ${BRAND_COLOR}15`,
  };

  const sectionIconStyle = {
    fontSize: isMobile ? "22px" : "28px",
    display: "flex",
    alignItems: "center",
    color: BRAND_COLOR,
  };

  const infoSectionTitleStyle = {
    fontSize: isMobile ? "15px" : "16px",
    fontWeight: "700",
    color: "#1a1a1a",
    textTransform: "uppercase",
    margin: "0",
    letterSpacing: "1px",
  };

  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : isTablet
      ? "repeat(2, 1fr)"
      : "repeat(3, 1fr)",
    gap: isMobile ? "16px" : isTablet ? "20px" : "24px",
  };

  const infoItemStyle = {
    display: "flex",
    flexDirection: "column",
    padding: isMobile ? "16px 14px" : "20px 18px",
    backgroundColor: "#faf8f5",
    borderRadius: "12px",
    border: `1px solid ${BRAND_COLOR}15`,
    transition: "all 0.3s ease",
    cursor: "default",
  };

  const infoLabelStyle = {
    fontSize: isMobile ? "11px" : "12px",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: isMobile ? "10px" : "12px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const infoValueStyle = {
    fontSize: isMobile ? "15px" : "16px",
    color: "#1a1a1a",
    fontWeight: "600",
    wordBreak: "break-word",
    lineHeight: "1.6",
  };

  const roleStatusBadgeStyle = {
    fontSize: isMobile ? "12px" : "13px",
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: isMobile ? "6px 12px" : "8px 14px",
    backgroundColor: BRAND_COLOR,
    borderRadius: "8px",
    textTransform: "capitalize",
    fontWeight: "600",
    width: "fit-content",
  };

  const activityItemStyle = {
    padding: isMobile ? "14px" : "18px",
    borderLeft: `4px solid ${BRAND_COLOR}`,
    backgroundColor: "#faf8f5",
    borderRadius: "8px",
    marginBottom: "14px",
    transition: "all 0.3s ease",
  };

  const activityTitleStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 6px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const activityTimeStyle = {
    fontSize: "12px",
    color: "#6b7280",
    margin: "0",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: isMobile ? "12px" : "16px",
    marginTop: isMobile ? "28px" : "36px",
    flexWrap: "wrap",
  };

  const editButtonStyle = {
    padding: isMobile ? "11px 20px" : "12px 28px",
    backgroundColor: BRAND_COLOR,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: `0 4px 12px rgba(147, 124, 96, 0.15)`,
    flex: isMobile ? "1 1 auto" : "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
  };

  const cancelButtonStyle = {
    padding: isMobile ? "11px 20px" : "12px 28px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: `1px solid ${BRAND_COLOR}30`,
    borderRadius: "8px",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
  };

  const formGroupStyle = {
    marginBottom: isMobile ? "20px" : "24px",
  };

  const formGroupLastStyle = {
    marginBottom: isMobile ? "20px" : "24px",
  };

  const labelStyle = {
    display: "block",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "600",
    marginBottom: isMobile ? "8px" : "10px",
    color: "#1a1a1a",
  };

  const inputStyle = (hasError = false) => ({
    width: "100%",
    padding: isMobile ? "11px 13px" : "12px 14px",
    border: `2px solid ${hasError ? "#fecaca" : `${BRAND_COLOR}30`}`,
    borderRadius: "8px",
    fontSize: isMobile ? "13px" : "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    backgroundColor: hasError ? "#fef2f2" : "#faf8f5",
    color: "#1a1a1a",
    outline: "none",
  });

  const errorTextStyle = {
    fontSize: isMobile ? "12px" : "13px",
    color: "#b91c1c",
    marginTop: "6px",
    marginBottom: "8px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const helperTextStyle = {
    fontSize: isMobile ? "12px" : "13px",
    color: "#6b7280",
    marginTop: "6px",
    fontWeight: "500",
  };

  const passwordInputContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const passwordInputStyle = (hasError = false) => ({
    ...inputStyle(hasError),
    paddingRight: "44px",
  });

  const toggleButtonStyle = {
    position: "absolute",
    right: isMobile ? "12px" : "14px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
  };

  const submitButtonStyle = {
    padding: isMobile ? "11px 20px" : "12px 32px",
    backgroundColor: BRAND_COLOR,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: loading ? 0.6 : 1,
    width: isMobile ? "100%" : "auto",
    boxShadow: `0 4px 12px rgba(147, 124, 96, 0.15)`,
    flex: isMobile ? "1 1 100%" : "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
  };

  // ============ Render ============
  return (
    <div style={pageContainerStyle}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(147, 124, 96, 0.18);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        input:focus {
          border-color: ${BRAND_COLOR} !important;
          box-shadow: 0 0 0 3px ${BRAND_COLOR}20;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        ::-webkit-scrollbar-thumb {
          background: ${BRAND_COLOR}40;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${BRAND_COLOR}60;
        }
      `}</style>

      <div style={topbarWrapperStyle}>
        <TopBar />
      </div>

      <div style={mainContentStyle}>
        <div style={contentWrapperStyle}>
          {/* Enhanced Header with Avatar */}
          <div style={headerStyle}>
            <div style={avatarStyle}>{getInitials(currentUser?.name)}</div>
            <div style={headerTextStyle}>
              <h1 style={titleStyle}>{currentUser?.name || "User Profile"}</h1>
              <p style={subtitleStyle}>{currentUser?.email}</p>
              <div style={statusBadgeStyle}>
                <CheckCircle2 size={14} />
                <span>{getStatusBadge(currentUser?.role).text}</span>
              </div>
            </div>
          </div>

          {/* ✅ ALERTS - Now display consistently */}
          {successMessage && (
            <div style={alertStyle("success")}>
              <CheckCircle2
                size={20}
                style={{ marginTop: "0px", flexShrink: 0 }}
              />
              <div>
                <p style={{ margin: "0", fontWeight: "600" }}>Success!</p>
                <p style={{ margin: "4px 0 0 0" }}>{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div style={alertStyle("error")}>
              <AlertCircle
                size={20}
                style={{ marginTop: "0px", flexShrink: 0 }}
              />
              <div>
                <p style={{ margin: "0", fontWeight: "600" }}>Error!</p>
                <p style={{ margin: "4px 0 0 0" }}>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Enhanced Tabs */}
          <div style={tabContainerStyle}>
            <button
              onClick={() => {
                setActiveTab("profile");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={tabButtonStyle(activeTab === "profile")}
              title="View profile information"
            >
              <User size={16} />
              Profile Info
            </button>
            <button
              onClick={() => {
                setActiveTab("security");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={tabButtonStyle(activeTab === "security")}
              title="Manage security settings"
            >
              <Lock size={16} />
              Security
            </button>
            <button
              onClick={() => {
                setActiveTab("activity");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={tabButtonStyle(activeTab === "activity")}
              title="View activity history"
            >
              <Activity size={16} />
              Activity
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div style={cardStyle}>
              {!isEditMode ? (
                <>
                  {/* Basic Information */}
                  <div style={infoSectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <User
                        size={isMobile ? 22 : 28}
                        style={sectionIconStyle}
                      />
                      <h3 style={infoSectionTitleStyle}>Basic Information</h3>
                    </div>
                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <User size={14} /> Full Name
                        </p>
                        <p style={infoValueStyle}>
                          {currentUser?.name || "Not set"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Mail size={14} /> Email Address
                        </p>
                        <p style={infoValueStyle}>
                          {currentUser?.email || "Not set"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <CheckCircle2 size={14} /> Account Status
                        </p>
                        <p style={roleStatusBadgeStyle}>
                          <CheckCircle2 size={14} />
                          {currentUser?.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div style={infoSectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <Lock
                        size={isMobile ? 22 : 28}
                        style={sectionIconStyle}
                      />
                      <h3 style={infoSectionTitleStyle}>Account Details</h3>
                    </div>
                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Fingerprint size={14} /> User ID
                        </p>
                        <p
                          style={{
                            ...infoValueStyle,
                            fontFamily: "monospace",
                            fontSize: isMobile ? "12px" : "13px",
                          }}
                        >
                          {currentUser?._id?.slice(0, 16) || "N/A"}...
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Crown size={14} /> Role
                        </p>
                        <p style={roleStatusBadgeStyle}>
                          <Crown size={14} />
                          {currentUser?.role === "admin"
                            ? "Administrator"
                            : "User"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <CheckCircle2 size={14} /> Email Verification
                        </p>
                        <p style={roleStatusBadgeStyle}>
                          <CheckCircle2 size={14} />
                          Verified
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Calendar size={14} /> Member Since
                        </p>
                        <p style={infoValueStyle}>
                          {currentUser?.createdAt
                            ? new Date(
                                currentUser.createdAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <RefreshCw size={14} /> Last Updated
                        </p>
                        <p style={infoValueStyle}>
                          {currentUser?.updatedAt
                            ? new Date(
                                currentUser.updatedAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Key size={14} /> 2FA Status
                        </p>
                        <p style={roleStatusBadgeStyle}>Disabled</p>
                      </div>
                    </div>
                  </div>

                  {/* Last Login Information */}
                  <div style={{ ...infoSectionStyle, ...infoSectionLastStyle }}>
                    <div style={sectionHeaderStyle}>
                      <LogIn
                        size={isMobile ? 22 : 28}
                        style={sectionIconStyle}
                      />
                      <h3 style={infoSectionTitleStyle}>Last Login</h3>
                    </div>
                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Clock size={14} /> Last Access
                        </p>
                        <p style={infoValueStyle}>
                          {currentUser?.lastLogin
                            ? new Date(currentUser.lastLogin).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : "Never"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <TrendingUp size={14} /> Access Frequency
                        </p>
                        <p style={infoValueStyle}>Regular</p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <CheckCircle2 size={14} /> Session Status
                        </p>
                        <p style={roleStatusBadgeStyle}>
                          <CheckCircle2 size={14} />
                          Active
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div style={buttonGroupStyle}>
                    <button
                      onClick={handleEditClick}
                      style={editButtonStyle}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = BRAND_COLOR_DARK)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = BRAND_COLOR)
                      }
                    >
                      <Edit2 size={16} />
                      Edit Profile
                    </button>
                  </div>
                </>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleProfileSubmit}>
                  <div style={formGroupStyle}>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      onBlur={() => handleProfileTouch("name")}
                      placeholder="Enter your full name"
                      style={inputStyle(
                        fieldTouched.name && !!validationErrors.name
                      )}
                      onFocus={(e) =>
                        (e.target.style.borderColor = BRAND_COLOR)
                      }
                    />
                    {fieldTouched.name && validationErrors.name && (
                      <p style={errorTextStyle}>
                        <AlertCircle size={14} />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div style={formGroupLastStyle}>
                    <label style={labelStyle}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      onBlur={() => handleProfileTouch("email")}
                      placeholder="Enter your email address"
                      style={inputStyle(
                        fieldTouched.email && !!validationErrors.email
                      )}
                      onFocus={(e) =>
                        (e.target.style.borderColor = BRAND_COLOR)
                      }
                    />
                    {fieldTouched.email && validationErrors.email && (
                      <p style={errorTextStyle}>
                        <AlertCircle size={14} />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div style={buttonGroupStyle}>
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        updateProfileMutation.isPending ||
                        Object.keys(validationErrors).length > 0
                      }
                      style={submitButtonStyle}
                      onMouseEnter={(e) =>
                        !loading &&
                        (e.target.style.backgroundColor = BRAND_COLOR_DARK)
                      }
                      onMouseLeave={(e) =>
                        !loading &&
                        (e.target.style.backgroundColor = BRAND_COLOR)
                      }
                    >
                      <Save size={16} />
                      {loading || updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={cancelButtonStyle}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = `${BRAND_COLOR}15`)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#f3f4f6")
                      }
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div style={cardStyle}>
              <form onSubmit={handlePasswordSubmit}>
                <div style={sectionHeaderStyle}>
                  <Lock size={isMobile ? 22 : 28} style={sectionIconStyle} />
                  <h3 style={infoSectionTitleStyle}>Change Your Password</h3>
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Current Password *</label>
                  <div style={passwordInputContainerStyle}>
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      onBlur={() => handlePasswordTouch("currentPassword")}
                      placeholder="Enter your current password"
                      style={passwordInputStyle(
                        fieldTouched.currentPassword &&
                          !!validationErrors.currentPassword
                      )}
                      onFocus={(e) =>
                        (e.target.style.borderColor = BRAND_COLOR)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      style={toggleButtonStyle}
                      title="Toggle password visibility"
                    >
                      {showPasswords.current ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {fieldTouched.currentPassword &&
                    validationErrors.currentPassword && (
                      <p style={errorTextStyle}>
                        <AlertCircle size={14} />
                        {validationErrors.currentPassword}
                      </p>
                    )}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>New Password *</label>
                  <p style={{ ...helperTextStyle, marginTop: "0" }}>
                    Must contain: 8+ characters, uppercase, lowercase, number
                  </p>
                  <div style={passwordInputContainerStyle}>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      onBlur={() => handlePasswordTouch("newPassword")}
                      placeholder="Enter new password"
                      style={passwordInputStyle(
                        fieldTouched.newPassword &&
                          !!validationErrors.newPassword
                      )}
                      onFocus={(e) =>
                        (e.target.style.borderColor = BRAND_COLOR)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      style={toggleButtonStyle}
                      title="Toggle password visibility"
                    >
                      {showPasswords.new ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {fieldTouched.newPassword && validationErrors.newPassword && (
                    <p style={errorTextStyle}>
                      <AlertCircle size={14} />
                      {validationErrors.newPassword}
                    </p>
                  )}
                  {passwordForm.newPassword &&
                    !validationErrors.newPassword && (
                      <p style={{ ...helperTextStyle, color: "#16a34a" }}>
                        <CheckCircle2
                          size={14}
                          style={{ display: "inline", marginRight: "4px" }}
                        />
                        Password strength OK
                      </p>
                    )}
                </div>

                <div style={formGroupLastStyle}>
                  <label style={labelStyle}>Confirm New Password *</label>
                  <div style={passwordInputContainerStyle}>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      onBlur={() => handlePasswordTouch("confirmPassword")}
                      placeholder="Confirm your new password"
                      style={passwordInputStyle(
                        fieldTouched.confirmPassword &&
                          !!validationErrors.confirmPassword
                      )}
                      onFocus={(e) =>
                        (e.target.style.borderColor = BRAND_COLOR)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      style={toggleButtonStyle}
                      title="Toggle password visibility"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {fieldTouched.confirmPassword &&
                    validationErrors.confirmPassword && (
                      <p style={errorTextStyle}>
                        <AlertCircle size={14} />
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  {passwordForm.confirmPassword &&
                    passwordForm.newPassword === passwordForm.confirmPassword &&
                    !validationErrors.confirmPassword && (
                      <p style={{ ...helperTextStyle, color: "#16a34a" }}>
                        <CheckCircle2
                          size={14}
                          style={{ display: "inline", marginRight: "4px" }}
                        />
                        Passwords match
                      </p>
                    )}
                </div>

                <div style={buttonGroupStyle}>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      changePasswordMutation.isPending ||
                      Object.keys(validationErrors).length > 0
                    }
                    style={submitButtonStyle}
                    onMouseEnter={(e) =>
                      !loading &&
                      (e.target.style.backgroundColor = BRAND_COLOR_DARK)
                    }
                    onMouseLeave={(e) =>
                      !loading && (e.target.style.backgroundColor = BRAND_COLOR)
                    }
                  >
                    <Lock size={16} />
                    {loading || changePasswordMutation.isPending
                      ? "Changing..."
                      : "Change Password"}
                  </button>
                </div>
              </form>

              {/* Security Settings */}
              <div style={{ ...infoSectionStyle, marginTop: "40px" }}>
                <div style={sectionHeaderStyle}>
                  <Shield size={isMobile ? 22 : 28} style={sectionIconStyle} />
                  <h3 style={infoSectionTitleStyle}>Security Settings</h3>
                </div>
                <div style={infoGridStyle}>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <Key size={14} /> Two-Factor Auth
                    </p>
                    <p
                      style={{
                        ...roleStatusBadgeStyle,
                        backgroundColor: "#f3f4f6",
                        color: "#6b7280",
                      }}
                    >
                      Not Enabled
                    </p>
                  </div>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <Lock size={14} /> Active Sessions
                    </p>
                    <p style={infoValueStyle}>1 Session</p>
                  </div>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <CheckCircle2 size={14} /> Login Alerts
                    </p>
                    <p
                      style={{
                        ...roleStatusBadgeStyle,
                        backgroundColor: "#16a34a",
                      }}
                    >
                      <CheckCircle2 size={14} />
                      Enabled
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <Activity size={isMobile ? 22 : 28} style={sectionIconStyle} />
                <h3 style={infoSectionTitleStyle}>Account Activity</h3>
              </div>

              <div style={{ marginBottom: "36px" }}>
                <h4 style={{ ...infoLabelStyle, marginBottom: "20px" }}>
                  Recent Activity
                </h4>

                <div style={activityItemStyle}>
                  <p style={activityTitleStyle}>
                    <CheckCircle2 size={16} /> Profile Updated
                  </p>
                  <p style={activityTimeStyle}>Last updated today</p>
                </div>

                <div style={activityItemStyle}>
                  <p style={activityTitleStyle}>
                    <Lock size={16} /> Password Changed
                  </p>
                  <p style={activityTimeStyle}>Last changed 2 months ago</p>
                </div>

                <div style={activityItemStyle}>
                  <p style={activityTitleStyle}>
                    <CheckCircle2 size={16} /> Account Created
                  </p>
                  <p style={activityTimeStyle}>
                    {formatDate(currentUser?.createdAt)}
                  </p>
                </div>
              </div>

              <div style={infoSectionStyle}>
                <h4 style={{ ...infoLabelStyle, marginBottom: "20px" }}>
                  Login History
                </h4>
                <div style={infoGridStyle}>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <Clock size={14} /> Last Login
                    </p>
                    <p style={infoValueStyle}>
                      {formatDate(currentUser?.lastLogin)}
                    </p>
                  </div>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <TrendingUp size={14} /> Total Logins
                    </p>
                    <p style={infoValueStyle}>24</p>
                  </div>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <AlertCircle size={14} /> Failed Attempts
                    </p>
                    <p style={infoValueStyle}>0</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
