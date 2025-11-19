// File: client/src/pages/Profile/Profile.jsx
// ✨ IMPROVED - Compact UI, removed shadows, cleaner design

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
      setIsTablet(width >= 768 && window.innerWidth < 1024);
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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 6000);
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");
    setLoading(true);

    setFieldTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    try {
      if (!passwordForm.currentPassword) {
        const msg = "Current password is required";
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      if (!passwordForm.newPassword) {
        const msg = "New password is required";
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      const strengthErrors = validatePasswordStrength(passwordForm.newPassword);
      if (strengthErrors.length > 0) {
        const msg = `Password: ${strengthErrors[0]}`;
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        const msg = "Passwords do not match";
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        const msg = "Please fix the errors before submitting";
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      const response = await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setFieldTouched({});
      setValidationErrors({});
      setSuccessMessage("Password changed successfully!");
    } catch (error) {
      let errorMsg = "Failed to change password";

      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }

      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ============ Styles (Compact & Clean) ============
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
    borderBottom: `1px solid rgba(147, 124, 96, 0.1)`,
  };

  const mainContentStyle = {
    flex: 1,
    paddingTop: isMobile ? "70px" : isTablet ? "75px" : "80px",
    paddingBottom: "30px",
  };

  const contentWrapperStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: isMobile ? "16px 14px" : isTablet ? "24px 20px" : "32px 24px",
    width: "100%",
    boxSizing: "border-box",
  };

  const headerStyle = {
    marginBottom: isMobile ? "20px" : "28px",
    display: "flex",
    alignItems: "flex-end",
    gap: isMobile ? "12px" : "18px",
    padding: isMobile ? "14px 12px" : isTablet ? "18px 14px" : "20px 16px",
    backgroundColor: "white",
    borderRadius: "10px",
    border: `1px solid rgba(147, 124, 96, 0.1)`,
  };

  const avatarStyle = {
    width: isMobile ? "60px" : isTablet ? "75px" : "90px",
    height: isMobile ? "60px" : isTablet ? "75px" : "90px",
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%)`,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isMobile ? "28px" : "38px",
    fontWeight: "700",
    flexShrink: 0,
  };

  const headerTextStyle = {
    flex: 1,
  };

  const titleStyle = {
    fontSize: isMobile ? "18px" : isTablet ? "22px" : "24px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 4px 0",
  };

  const subtitleStyle = {
    fontSize: isMobile ? "12px" : "13px",
    color: "#666",
    margin: "0",
    fontWeight: "500",
  };

  const statusBadgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "6px 11px",
    backgroundColor: `${BRAND_COLOR}15`,
    color: BRAND_COLOR,
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
    marginTop: "6px",
    border: `1px solid ${BRAND_COLOR}30`,
  };

  const alertStyle = (type) => ({
    padding: isMobile ? "12px 14px" : "14px 16px",
    marginBottom: "18px",
    backgroundColor: type === "success" ? "#f0fdf4" : "#fef2f2",
    color: type === "success" ? "#166534" : "#b91c1c",
    borderRadius: "8px",
    border: `1px solid ${type === "success" ? "#bbf7d0" : "#fecaca"}`,
    fontSize: isMobile ? "12px" : "13px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    boxSizing: "border-box",
    animation: "slideIn 0.3s ease-out",
  });

  const tabContainerStyle = {
    display: "flex",
    gap: isMobile ? "0" : "4px",
    marginBottom: "20px",
    borderBottom: `1px solid rgba(147, 124, 96, 0.1)`,
    overflowX: "auto",
  };

  const tabButtonStyle = (isActive) => ({
    padding: isMobile ? "12px 12px" : isTablet ? "13px 16px" : "13px 18px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: isActive ? "600" : "500",
    color: isActive ? BRAND_COLOR : "#6b7280",
    borderBottom: isActive ? `2px solid ${BRAND_COLOR}` : "none",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    marginBottom: "-1px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  });

  const cardStyle = {
    backgroundColor: "white",
    padding: isMobile ? "18px 14px" : isTablet ? "24px 20px" : "28px 24px",
    borderRadius: "10px",
    border: `1px solid rgba(147, 124, 96, 0.1)`,
  };

  const infoSectionStyle = {
    marginBottom: isMobile ? "24px" : "32px",
    paddingBottom: isMobile ? "20px" : "24px",
    borderBottom: `1px solid rgba(147, 124, 96, 0.08)`,
  };

  const infoSectionLastStyle = {
    marginBottom: "0",
    paddingBottom: "0",
    borderBottom: "none",
  };

  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: isMobile ? "16px" : "20px",
    paddingBottom: isMobile ? "10px" : "12px",
    borderBottom: `1px solid rgba(147, 124, 96, 0.08)`,
  };

  const sectionIconStyle = {
    fontSize: isMobile ? "18px" : "22px",
    color: BRAND_COLOR,
  };

  const infoSectionTitleStyle = {
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "700",
    color: "#1a1a1a",
    textTransform: "uppercase",
    margin: "0",
    letterSpacing: "0.5px",
  };

  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : isTablet
      ? "repeat(2, 1fr)"
      : "repeat(3, 1fr)",
    gap: isMobile ? "12px" : isTablet ? "14px" : "16px",
  };

  const infoItemStyle = {
    display: "flex",
    flexDirection: "column",
    padding: isMobile ? "12px 11px" : "14px 13px",
    backgroundColor: "#faf8f5",
    borderRadius: "8px",
    border: `1px solid rgba(147, 124, 96, 0.08)`,
  };

  const infoLabelStyle = {
    fontSize: isMobile ? "10px" : "11px",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: isMobile ? "6px" : "8px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const infoValueStyle = {
    fontSize: isMobile ? "13px" : "14px",
    color: "#1a1a1a",
    fontWeight: "600",
    wordBreak: "break-word",
    lineHeight: "1.5",
  };

  const roleStatusBadgeStyle = {
    fontSize: isMobile ? "11px" : "12px",
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: isMobile ? "5px 10px" : "6px 11px",
    backgroundColor: BRAND_COLOR,
    borderRadius: "6px",
    fontWeight: "600",
    width: "fit-content",
  };

  const activityItemStyle = {
    padding: isMobile ? "11px 12px" : "13px 14px",
    borderLeft: `3px solid ${BRAND_COLOR}`,
    backgroundColor: "#faf8f5",
    borderRadius: "6px",
    marginBottom: "10px",
  };

  const activityTitleStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 4px 0",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const activityTimeStyle = {
    fontSize: "11px",
    color: "#6b7280",
    margin: "0",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: isMobile ? "10px" : "12px",
    marginTop: isMobile ? "20px" : "24px",
    flexWrap: "wrap",
  };

  const editButtonStyle = {
    padding: isMobile ? "10px 16px" : "10px 22px",
    backgroundColor: BRAND_COLOR,
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
  };

  const cancelButtonStyle = {
    padding: isMobile ? "10px 16px" : "10px 22px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: `1px solid rgba(147, 124, 96, 0.15)`,
    borderRadius: "6px",
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    justifyContent: "center",
  };

  const formGroupStyle = {
    marginBottom: isMobile ? "16px" : "18px",
  };

  const labelStyle = {
    display: "block",
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: "600",
    marginBottom: isMobile ? "6px" : "8px",
    color: "#1a1a1a",
  };

  const inputStyle = (hasError = false) => ({
    width: "100%",
    padding: isMobile ? "9px 11px" : "10px 12px",
    border: `1px solid ${hasError ? "#fecaca" : "rgba(147, 124, 96, 0.2)"}`,
    borderRadius: "6px",
    fontSize: isMobile ? "12px" : "13px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    backgroundColor: hasError ? "#fef2f2" : "#faf8f5",
    color: "#1a1a1a",
    outline: "none",
  });

  const errorTextStyle = {
    fontSize: isMobile ? "11px" : "12px",
    color: "#b91c1c",
    marginTop: "5px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "3px",
  };

  const helperTextStyle = {
    fontSize: isMobile ? "11px" : "12px",
    color: "#6b7280",
    marginTop: "4px",
    fontWeight: "500",
  };

  const passwordInputContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const passwordInputStyle = (hasError = false) => ({
    ...inputStyle(hasError),
    paddingRight: "38px",
  });

  const toggleButtonStyle = {
    position: "absolute",
    right: isMobile ? "10px" : "11px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
  };

  const submitButtonStyle = {
    padding: isMobile ? "10px 16px" : "10px 24px",
    backgroundColor: BRAND_COLOR,
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    opacity: loading ? 0.6 : 1,
    width: isMobile ? "100%" : "auto",
    flex: isMobile ? "1 1 100%" : "0 0 auto",
    display: "flex",
    alignItems: "center",
    gap: "6px",
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
          transform: translateY(-1px);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        input:focus {
          border-color: ${BRAND_COLOR} !important;
          box-shadow: 0 0 0 2px ${BRAND_COLOR}15;
        }

        ::-webkit-scrollbar {
          height: 5px;
        }

        ::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        ::-webkit-scrollbar-thumb {
          background: ${BRAND_COLOR}40;
          border-radius: 3px;
        }
      `}</style>

      <div style={topbarWrapperStyle}>
        <TopBar />
      </div>

      <div style={mainContentStyle}>
        <div style={contentWrapperStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={avatarStyle}>{getInitials(currentUser?.name)}</div>
            <div style={headerTextStyle}>
              <h1 style={titleStyle}>{currentUser?.name || "User Profile"}</h1>
              <p style={subtitleStyle}>{currentUser?.email}</p>
              <div style={statusBadgeStyle}>
                <CheckCircle2 size={12} />
                <span>
                  {currentUser?.role === "admin" ? "Administrator" : "User"}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div style={alertStyle("success")}>
              <CheckCircle2
                size={16}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <div>
                <p style={{ margin: "0", fontWeight: "600" }}>Success!</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
                  {successMessage}
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div style={alertStyle("error")}>
              <AlertCircle
                size={16}
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <div>
                <p style={{ margin: "0", fontWeight: "600" }}>Error!</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px" }}>
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={tabContainerStyle}>
            <button
              onClick={() => {
                setActiveTab("profile");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={tabButtonStyle(activeTab === "profile")}
            >
              <User size={14} />
              Profile
            </button>
            <button
              onClick={() => {
                setActiveTab("security");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={tabButtonStyle(activeTab === "security")}
            >
              <Lock size={14} />
              Security
            </button>
            <button
              onClick={() => {
                setActiveTab("activity");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={tabButtonStyle(activeTab === "activity")}
            >
              <Activity size={14} />
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
                      <User size={18} style={sectionIconStyle} />
                      <h3 style={infoSectionTitleStyle}>Basic Info</h3>
                    </div>
                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <User size={12} /> Full Name
                        </p>
                        <p style={infoValueStyle}>
                          {currentUser?.name || "Not set"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Mail size={12} /> Email
                        </p>
                        <p style={infoValueStyle}>
                          {currentUser?.email || "Not set"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <CheckCircle2 size={12} /> Status
                        </p>
                        <p style={roleStatusBadgeStyle}>
                          <CheckCircle2 size={12} />
                          {currentUser?.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div style={infoSectionStyle}>
                    <div style={sectionHeaderStyle}>
                      <Lock size={18} style={sectionIconStyle} />
                      <h3 style={infoSectionTitleStyle}>Account Details</h3>
                    </div>
                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Fingerprint size={12} /> User ID
                        </p>
                        <p
                          style={{
                            ...infoValueStyle,
                            fontFamily: "monospace",
                            fontSize: "11px",
                          }}
                        >
                          {currentUser?._id?.slice(0, 16) || "N/A"}...
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Crown size={12} /> Role
                        </p>
                        <p style={roleStatusBadgeStyle}>
                          <Crown size={12} />
                          {currentUser?.role === "admin" ? "Admin" : "User"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Calendar size={12} /> Member Since
                        </p>
                        <p style={infoValueStyle}>
                          {formatDate(currentUser?.createdAt)}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <RefreshCw size={12} /> Last Updated
                        </p>
                        <p style={infoValueStyle}>
                          {formatDate(currentUser?.updatedAt)}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <CheckCircle2 size={12} /> Email Verified
                        </p>
                        <p style={roleStatusBadgeStyle}>
                          <CheckCircle2 size={12} />
                          Verified
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>
                          <Clock size={12} /> Last Login
                        </p>
                        <p style={infoValueStyle}>
                          {formatDate(currentUser?.lastLogin)}
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
                      <Edit2 size={14} />
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
                    />
                    {fieldTouched.name && validationErrors.name && (
                      <p style={errorTextStyle}>
                        <AlertCircle size={12} />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div style={formGroupStyle}>
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
                    />
                    {fieldTouched.email && validationErrors.email && (
                      <p style={errorTextStyle}>
                        <AlertCircle size={12} />
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
                      <Save size={14} />
                      {loading || updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={cancelButtonStyle}
                    >
                      <X size={14} />
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
                  <Lock size={18} style={sectionIconStyle} />
                  <h3 style={infoSectionTitleStyle}>Change Password</h3>
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
                      placeholder="Enter current password"
                      style={passwordInputStyle(
                        fieldTouched.currentPassword &&
                          !!validationErrors.currentPassword
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      style={toggleButtonStyle}
                    >
                      {showPasswords.current ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {fieldTouched.currentPassword &&
                    validationErrors.currentPassword && (
                      <p style={errorTextStyle}>
                        <AlertCircle size={12} />
                        {validationErrors.currentPassword}
                      </p>
                    )}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>New Password *</label>
                  <p style={helperTextStyle}>
                    8+ chars, uppercase, lowercase, number
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
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      style={toggleButtonStyle}
                    >
                      {showPasswords.new ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {fieldTouched.newPassword && validationErrors.newPassword && (
                    <p style={errorTextStyle}>
                      <AlertCircle size={12} />
                      {validationErrors.newPassword}
                    </p>
                  )}
                  {passwordForm.newPassword &&
                    !validationErrors.newPassword && (
                      <p style={{ ...helperTextStyle, color: "#16a34a" }}>
                        <CheckCircle2
                          size={12}
                          style={{ display: "inline", marginRight: "3px" }}
                        />
                        Password OK
                      </p>
                    )}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>Confirm Password *</label>
                  <div style={passwordInputContainerStyle}>
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      onBlur={() => handlePasswordTouch("confirmPassword")}
                      placeholder="Confirm new password"
                      style={passwordInputStyle(
                        fieldTouched.confirmPassword &&
                          !!validationErrors.confirmPassword
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      style={toggleButtonStyle}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {fieldTouched.confirmPassword &&
                    validationErrors.confirmPassword && (
                      <p style={errorTextStyle}>
                        <AlertCircle size={12} />
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  {passwordForm.confirmPassword &&
                    passwordForm.newPassword === passwordForm.confirmPassword &&
                    !validationErrors.confirmPassword && (
                      <p style={{ ...helperTextStyle, color: "#16a34a" }}>
                        <CheckCircle2
                          size={12}
                          style={{ display: "inline", marginRight: "3px" }}
                        />
                        Match
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
                    <Lock size={14} />
                    {loading || changePasswordMutation.isPending
                      ? "Changing..."
                      : "Change Password"}
                  </button>
                </div>
              </form>

              {/* Security Info */}
              <div
                style={{
                  ...infoSectionStyle,
                  marginTop: "26px",
                  borderTop: `1px solid rgba(147, 124, 96, 0.08)`,
                  paddingTop: "20px",
                }}
              >
                <div style={sectionHeaderStyle}>
                  <Shield size={18} style={sectionIconStyle} />
                  <h3 style={infoSectionTitleStyle}>Security Info</h3>
                </div>
                <div style={infoGridStyle}>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <Lock size={12} /> Active Sessions
                    </p>
                    <p style={infoValueStyle}>1 Session</p>
                  </div>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <CheckCircle2 size={12} /> Login Alerts
                    </p>
                    <p style={roleStatusBadgeStyle}>
                      <CheckCircle2 size={12} />
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
                <Activity size={18} style={sectionIconStyle} />
                <h3 style={infoSectionTitleStyle}>Activity</h3>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <h4 style={{ ...infoLabelStyle, marginBottom: "14px" }}>
                  Recent Events
                </h4>

                <div style={activityItemStyle}>
                  <p style={activityTitleStyle}>
                    <CheckCircle2 size={14} /> Profile Updated
                  </p>
                  <p style={activityTimeStyle}>Last updated today</p>
                </div>

                <div style={activityItemStyle}>
                  <p style={activityTitleStyle}>
                    <Lock size={14} /> Password Changed
                  </p>
                  <p style={activityTimeStyle}>Last changed 2 months ago</p>
                </div>

                <div style={activityItemStyle}>
                  <p style={activityTitleStyle}>
                    <CheckCircle2 size={14} /> Account Created
                  </p>
                  <p style={activityTimeStyle}>
                    {formatDate(currentUser?.createdAt)}
                  </p>
                </div>
              </div>

              <div
                style={{
                  ...infoSectionStyle,
                  borderTop: `1px solid rgba(147, 124, 96, 0.08)`,
                  paddingTop: "20px",
                  marginBottom: "0",
                  paddingBottom: "0",
                  borderBottom: "none",
                }}
              >
                <h4 style={{ ...infoLabelStyle, marginBottom: "14px" }}>
                  Login Stats
                </h4>
                <div style={infoGridStyle}>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <Clock size={12} /> Last Login
                    </p>
                    <p style={infoValueStyle}>
                      {formatDate(currentUser?.lastLogin)}
                    </p>
                  </div>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <TrendingUp size={12} /> Total Logins
                    </p>
                    <p style={infoValueStyle}>24</p>
                  </div>
                  <div style={infoItemStyle}>
                    <p style={infoLabelStyle}>
                      <AlertCircle size={12} /> Failed Attempts
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

