// File: client/src/pages/Profile/Profile.jsx
/**
 * User Profile Page - Professional Version (FIXED)
 * ✅ Improved Profile Information section UI
 * ✅ Fixed responsive design for all devices
 * ✅ Better form layout and validation display
 */

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

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
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

  // Real-time field validation
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

    // Mark all fields as touched for validation
    setFieldTouched({
      name: true,
      email: true,
    });

    try {
      // Final validation before submit
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
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Mark all fields as touched
    setFieldTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    try {
      if (!passwordForm.currentPassword) {
        setErrorMessage("Current password is required");
        setLoading(false);
        return;
      }

      if (!passwordForm.newPassword) {
        setErrorMessage("New password is required");
        setLoading(false);
        return;
      }

      const strengthErrors = validatePasswordStrength(passwordForm.newPassword);
      if (strengthErrors.length > 0) {
        setErrorMessage(`Password: ${strengthErrors[0]}`);
        setLoading(false);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setErrorMessage("Passwords do not match");
        setLoading(false);
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrorMessage("Please fix the errors before submitting");
        setLoading(false);
        return;
      }

      await changePasswordMutation.mutateAsync({
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
      setSuccessMessage("Password changed successfully!");
    } catch (error) {
      const errorMsg =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to change password";
      setErrorMessage(errorMsg);
      console.error("Password change error:", error);
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

  // ============ Styles ============
  const pageContainerStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
  };

  const topbarWrapperStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
    backgroundColor: "white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };

  const mainContentStyle = {
    flex: 1,
    paddingTop: isMobile ? "80px" : isTablet ? "90px" : "100px",
    paddingBottom: "40px",
  };

  const contentWrapperStyle = {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: isMobile ? "16px 12px" : isTablet ? "30px 24px" : "40px 32px",
    width: "100%",
    boxSizing: "border-box",
  };

  const headerStyle = {
    marginBottom: isMobile ? "30px" : "40px",
  };

  const titleStyle = {
    fontSize: isMobile ? "26px" : isTablet ? "28px" : "32px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px",
  };

  const subtitleStyle = {
    fontSize: isMobile ? "13px" : "14px",
    color: "#666",
    margin: 0,
    fontWeight: "400",
  };

  const alertStyle = (type) => ({
    padding: isMobile ? "12px 14px" : "14px 16px",
    marginBottom: "20px",
    backgroundColor: type === "success" ? "#d4edda" : "#f8d7da",
    color: type === "success" ? "#155724" : "#721c24",
    borderRadius: "8px",
    border: `1px solid ${type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
    fontSize: isMobile ? "13px" : "14px",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    boxSizing: "border-box",
  });

  const tabContainerStyle = {
    display: "flex",
    gap: isMobile ? "8px" : "0",
    marginBottom: "25px",
    borderBottom: "2px solid #e0e0e0",
    overflowX: "auto",
    scrollBehavior: "smooth",
  };

  const tabButtonStyle = (isActive) => ({
    padding: isMobile ? "12px 14px" : isTablet ? "14px 20px" : "14px 24px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: isActive ? "600" : "500",
    color: isActive ? BRAND_COLOR : "#666",
    borderBottom: isActive ? `3px solid ${BRAND_COLOR}` : "none",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    marginBottom: "-2px",
    position: "relative",
  });

  const cardStyle = {
    backgroundColor: "white",
    padding: isMobile ? "20px 16px" : isTablet ? "28px 24px" : "32px 28px",
    borderRadius: "10px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #f0f0f0",
  };

  // ✅ IMPROVED: Better info section styles
  const infoSectionStyle = {
    marginBottom: isMobile ? "28px" : "36px",
    paddingBottom: isMobile ? "20px" : "28px",
    borderBottom: "1px solid #e8e8e8",
  };

  const infoSectionTitleStyle = {
    fontSize: isMobile ? "12px" : "13px",
    fontWeight: "700",
    color: "#444",
    textTransform: "uppercase",
    marginBottom: isMobile ? "16px" : "18px",
    letterSpacing: "1px",
  };

  // ✅ IMPROVED: Responsive grid layout
  const infoGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : isTablet
      ? "repeat(2, 1fr)"
      : "repeat(2, 1fr)",
    gap: isMobile ? "18px" : isTablet ? "20px" : "24px",
  };

  const infoItemStyle = {
    display: "flex",
    flexDirection: "column",
    padding: isMobile ? "12px 0" : "14px 0",
  };

  const infoLabelStyle = {
    fontSize: isMobile ? "11px" : "12px",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: isMobile ? "6px" : "8px",
    fontWeight: "700",
    letterSpacing: "0.5px",
  };

  const infoValueStyle = {
    fontSize: isMobile ? "15px" : "16px",
    color: "#222",
    fontWeight: "500",
    wordBreak: "break-word",
    lineHeight: "1.5",
  };

  const roleBadgeStyle = {
    fontSize: isMobile ? "12px" : "13px",
    color: "white",
    display: "inline-block",
    padding: isMobile ? "5px 10px" : "6px 12px",
    backgroundColor: BRAND_COLOR,
    borderRadius: "6px",
    textTransform: "capitalize",
    fontWeight: "600",
    width: "fit-content",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: isMobile ? "10px" : "12px",
    marginTop: isMobile ? "24px" : "28px",
    flexWrap: "wrap",
  };

  const editButtonStyle = {
    padding: isMobile ? "10px 18px" : "11px 22px",
    backgroundColor: BRAND_COLOR,
    color: "white",
    border: "none",
    borderRadius: "7px",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
  };

  const cancelButtonStyle = {
    padding: isMobile ? "10px 18px" : "11px 22px",
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "7px",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    flex: isMobile ? "1 1 auto" : "0 0 auto",
  };

  const formGroupStyle = {
    marginBottom: isMobile ? "18px" : "20px",
  };

  const formGroupLastStyle = {
    marginBottom: isMobile ? "18px" : "24px",
  };

  const labelStyle = {
    display: "block",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "600",
    marginBottom: isMobile ? "7px" : "8px",
    color: "#333",
  };

  const inputStyle = (hasError = false) => ({
    width: "100%",
    padding: isMobile ? "10px 11px" : "11px 12px",
    border: `2px solid ${hasError ? "#f5c6cb" : "#ddd"}`,
    borderRadius: "7px",
    fontSize: isMobile ? "13px" : "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    backgroundColor: hasError ? "#fff8f9" : "#fff",
  });

  const errorTextStyle = {
    fontSize: isMobile ? "11px" : "12px",
    color: "#721c24",
    marginTop: "5px",
    marginBottom: "8px",
    fontWeight: "500",
  };

  const helperTextStyle = {
    fontSize: isMobile ? "11px" : "12px",
    color: "#666",
    marginTop: "5px",
    fontWeight: "500",
  };

  const passwordInputContainerStyle = {
    position: "relative",
    display: "flex",
    alignItems: "center",
  };

  const passwordInputStyle = (hasError = false) => ({
    ...inputStyle(hasError),
    paddingRight: "40px",
  });

  const toggleButtonStyle = {
    position: "absolute",
    right: isMobile ? "10px" : "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: isMobile ? "16px" : "18px",
    color: "#666",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
  };

  const submitButtonStyle = {
    padding: isMobile ? "10px 18px" : "11px 26px",
    backgroundColor: BRAND_COLOR,
    color: "white",
    border: "none",
    borderRadius: "7px",
    fontSize: isMobile ? "13px" : "14px",
    fontWeight: "600",
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    opacity: loading ? 0.6 : 1,
    width: isMobile ? "100%" : "auto",
    flex: isMobile ? "1 1 100%" : "0 0 auto",
  };

  // ============ Render ============
  return (
    <div style={pageContainerStyle}>
      <div style={topbarWrapperStyle}>
        <TopBar />
      </div>

      <div style={mainContentStyle}>
        <div style={contentWrapperStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <h1 style={titleStyle}>My Profile</h1>
            <p style={subtitleStyle}>
              Manage your account settings and security preferences
            </p>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div style={alertStyle("success")}>
              <span style={{ fontSize: "18px", marginTop: "2px" }}>✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={alertStyle("error")}>
              <span style={{ fontSize: "18px", marginTop: "2px" }}>✕</span>
              <span>{errorMessage}</span>
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
              Profile Information
            </button>
            <button
              onClick={() => {
                setActiveTab("password");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={tabButtonStyle(activeTab === "password")}
            >
              Change Password
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div style={cardStyle}>
              {/* Read-Only Mode (Default) */}
              {!isEditMode ? (
                <>
                  {/* User Account Information */}
                  <div style={infoSectionStyle}>
                    <h3 style={infoSectionTitleStyle}>Account Information</h3>
                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>Full Name</p>
                        <p style={infoValueStyle}>
                          {currentUser?.name || "Not set"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>Email Address</p>
                        <p style={infoValueStyle}>
                          {currentUser?.email || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div style={infoSectionStyle}>
                    <h3 style={infoSectionTitleStyle}>Account Details</h3>
                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>User ID</p>
                        <p
                          style={{
                            ...infoValueStyle,
                            fontFamily: "monospace",
                            fontSize: isMobile ? "12px" : "13px",
                            color: "#666",
                          }}
                        >
                          {currentUser?._id?.slice(0, 20) || "N/A"}...
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>Role</p>
                        <p style={roleBadgeStyle}>
                          {currentUser?.role === "admin"
                            ? "Administrator"
                            : "User"}
                        </p>
                      </div>

                      <div style={infoItemStyle}>
                        <p style={infoLabelStyle}>Member Since</p>
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
                        <p style={infoLabelStyle}>Last Login</p>
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
                            : "Not logged in yet"}
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
                      ✏️ Edit Profile
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
                      onBlur={() => {
                        handleProfileTouch("name");
                        document.activeElement.style.borderColor = "#ddd";
                      }}
                    />
                    {fieldTouched.name && validationErrors.name && (
                      <p style={errorTextStyle}>{validationErrors.name}</p>
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
                      <p style={errorTextStyle}>{validationErrors.email}</p>
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
                      {loading || updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={cancelButtonStyle}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#e5e5e5")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#f0f0f0")
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div style={cardStyle}>
              <form onSubmit={handlePasswordSubmit}>
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
                      {showPasswords.current ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {fieldTouched.currentPassword &&
                    validationErrors.currentPassword && (
                      <p style={errorTextStyle}>
                        {validationErrors.currentPassword}
                      </p>
                    )}
                </div>

                <div style={formGroupStyle}>
                  <label style={labelStyle}>New Password *</label>
                  <div style={passwordInputContainerStyle}>
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      onBlur={() => handlePasswordTouch("newPassword")}
                      placeholder="Enter new password (min 8 characters)"
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
                      {showPasswords.new ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {fieldTouched.newPassword && validationErrors.newPassword && (
                    <p style={errorTextStyle}>{validationErrors.newPassword}</p>
                  )}
                  {passwordForm.newPassword &&
                    !validationErrors.newPassword && (
                      <p style={helperTextStyle}>✓ Password strength OK</p>
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
                      {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {fieldTouched.confirmPassword &&
                    validationErrors.confirmPassword && (
                      <p style={errorTextStyle}>
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  {passwordForm.confirmPassword &&
                    passwordForm.newPassword === passwordForm.confirmPassword &&
                    !validationErrors.confirmPassword && (
                      <p style={helperTextStyle}>✓ Passwords match</p>
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
                      !loading &&
                      (e.target.style.backgroundColor = BRAND_COLOR)
                    }
                  >
                    {loading || changePasswordMutation.isPending
                      ? "Changing..."
                      : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;