import TopBar from "@/components/Layout/Topbar";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // React Hook Form for Profile
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
    watch: watchProfile,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  });

  // React Hook Form for Password
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
    watch: watchPassword,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // ============ Effects ============
  useEffect(() => {
    if (currentUser) {
      resetProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
      });
    }
  }, [currentUser, resetProfile]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 6000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // ============ Validation Rules ============
  const profileValidationRules = {
    name: {
      required: "Full name is required",
      minLength: {
        value: 2,
        message: "Name must be at least 2 characters",
      },
    },
    email: {
      required: "Email is required",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Invalid email format",
      },
    },
  };

  const passwordValidationRules = {
    currentPassword: {
      required: "Current password required",
    },
    newPassword: {
      required: "New password required",
      validate: {
        minLength: (value) =>
          value.length >= 8 || "Password must be at least 8 characters",
        hasUppercase: (value) => /[A-Z]/.test(value) || "Need uppercase letter",
        hasLowercase: (value) => /[a-z]/.test(value) || "Need lowercase letter",
        hasNumber: (value) => /[0-9]/.test(value) || "Need a number",
      },
    },
    confirmPassword: {
      required: "Please confirm password",
      validate: (value) =>
        value === watchPassword("newPassword") || "Passwords do not match",
    },
  };

  // ============ Event Handlers ============
  const onProfileSubmit = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await updateProfileMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
      });

      setSuccessMessage("Profile updated successfully!");
      setIsEditMode(false);
    } catch (error) {
      const errorMsg =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to update profile";
      setErrorMessage(errorMsg);
      console.error("Profile update error:", error);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      resetPassword();
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
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setErrorMessage("");
  };

  const handleCancel = () => {
    setIsEditMode(false);
    resetProfile();
    setErrorMessage("");
    setSuccessMessage("");
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

  // ============ Render ============
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#faf8f5] to-[#f5f1ed]">
      {/* Topbar */}
      <div className="sticky top-0 z-1000 w-full bg-white border-b border-[#937c6033]">
        <TopBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-[70px] md:pt-[75px] lg:pt-[80px] pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-5 lg:px-6 w-full">
          {/* Header */}
          <div className="mb-5 md:mb-7 lg:mb-7 flex items-end gap-3 md:gap-4 lg:gap-4 p-3 md:p-3 lg:p-5 bg-white rounded-lg border border-[#937c6014]">
            <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-[#937c60] to-[#6b5d50] text-white flex items-center justify-center text-2xl md:text-3xl lg:text-5xl font-bold flex-shrink-0">
              {getInitials(currentUser?.name)}
            </div>
            <div className="flex-1">
              <h1 className="text-lg md:text-2xl lg:text-2xl font-bold text-[#1a1a1a] mb-1">
                {currentUser?.name || "User Profile"}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium">
                {currentUser?.email}
              </p>
              <div
                className="inline-flex items-center gap-1 mt-1.5 px-3 py-1.5 bg-[#937c6024] rounded-md text-xs font-semibold border border-[#937c6030]"
                style={{ color: "#937c60" }}
              >
                <CheckCircle2 size={12} />
                <span>
                  {currentUser?.role === "admin" ? "Administrator" : "User"}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div className="mb-4 p-3 md:p-4 bg-green-50 text-green-900 rounded-lg border border-green-200 flex gap-3 items-start animate-slideIn">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Success!</p>
                <p className="text-xs md:text-sm mt-0.5">{successMessage}</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 md:p-4 bg-red-50 text-red-900 rounded-lg border border-red-200 flex gap-3 items-start animate-slideIn">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error!</p>
                <p className="text-xs md:text-sm mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-0 md:gap-1 mb-5 border-b border-[#937c6014] overflow-x-auto">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "security", label: "Security", icon: Lock },
              { id: "activity", label: "Activity", icon: Activity },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`px-3 md:px-4 lg:px-5 py-3 text-xs md:text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-all border-b-2 -mb-px ${
                  activeTab === id
                    ? "text-[#937c60] border-b-2 border-[#937c60] font-semibold"
                    : "text-gray-500 border-b-2 border-transparent"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white p-4 md:p-6 rounded-lg border border-[#937c6014]">
              {!isEditMode ? (
                <>
                  {/* Basic Information */}
                  <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-[#937c6013]">
                    <div className="flex items-center gap-3 mb-4 md:mb-5 pb-3 border-b border-[#937c6013]">
                      <User size={18} style={{ color: "#937c60" }} />
                      <h3 className="text-xs md:text-sm font-bold text-[#1a1a1a] uppercase tracking-wide">
                        Basic Info
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-3 lg:gap-4">
                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <User size={12} /> Full Name
                        </p>
                        <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                          {currentUser?.name || "Not set"}
                        </p>
                      </div>

                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <Mail size={12} /> Email
                        </p>
                        <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                          {currentUser?.email || "Not set"}
                        </p>
                      </div>

                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Status
                        </p>
                        <p className="text-xs md:text-sm font-semibold text-white bg-[#937c60] rounded px-2.5 py-1.5 w-fit flex items-center gap-1.5">
                          <CheckCircle2 size={12} />
                          {currentUser?.isActive ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="mb-0 pb-0">
                    <div className="flex items-center gap-3 mb-4 md:mb-5 pb-3 border-b border-[#937c6013]">
                      <Lock size={18} style={{ color: "#937c60" }} />
                      <h3 className="text-xs md:text-sm font-bold text-[#1a1a1a] uppercase tracking-wide">
                        Account Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-3 lg:gap-4">
                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <Fingerprint size={12} /> User ID
                        </p>
                        <p className="text-xs font-semibold text-[#1a1a1a] font-mono">
                          {currentUser?._id?.slice(0, 16) || "N/A"}...
                        </p>
                      </div>

                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <Crown size={12} /> Role
                        </p>
                        <p className="text-xs md:text-sm font-semibold text-white bg-[#937c60] rounded px-2.5 py-1.5 w-fit flex items-center gap-1.5">
                          <Crown size={12} />
                          {currentUser?.role === "admin" ? "Admin" : "User"}
                        </p>
                      </div>

                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <Calendar size={12} /> Member Since
                        </p>
                        <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                          {formatDate(currentUser?.createdAt)}
                        </p>
                      </div>

                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <RefreshCw size={12} /> Last Updated
                        </p>
                        <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                          {formatDate(currentUser?.updatedAt)}
                        </p>
                      </div>

                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Email Verified
                        </p>
                        <p className="text-xs md:text-sm font-semibold text-white bg-[#937c60] rounded px-2.5 py-1.5 w-fit flex items-center gap-1.5">
                          <CheckCircle2 size={12} />
                          Verified
                        </p>
                      </div>

                      <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                          <Clock size={12} /> Last Login
                        </p>
                        <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                          {formatDate(currentUser?.lastLogin)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex gap-2.5 md:gap-3 mt-5 md:mt-6 flex-wrap">
                    <button
                      onClick={handleEditClick}
                      className="px-4 md:px-5 py-2.5 bg-[#937c60] hover:bg-[#6b5d50] text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Edit2 size={14} />
                      Edit Profile
                    </button>
                  </div>
                </>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <div className="mb-4 md:mb-5">
                    <label className="block text-xs md:text-sm font-semibold mb-1.5 md:mb-2 text-[#1a1a1a]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      {...registerProfile("name", profileValidationRules.name)}
                      className={`w-full px-3 md:px-3 py-2.5 rounded-lg text-xs md:text-sm font-inherit transition-all focus:outline-none border ${
                        profileErrors.name
                          ? "border-red-300 bg-red-50 focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                          : "border-[#937c6032] bg-[#faf8f5] focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                      }`}
                    />
                    {profileErrors.name && (
                      <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {profileErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-4 md:mb-5">
                    <label className="block text-xs md:text-sm font-semibold mb-1.5 md:mb-2 text-[#1a1a1a]">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      {...registerProfile(
                        "email",
                        profileValidationRules.email
                      )}
                      className={`w-full px-3 md:px-3 py-2.5 rounded-lg text-xs md:text-sm font-inherit transition-all focus:outline-none border ${
                        profileErrors.email
                          ? "border-red-300 bg-red-50 focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                          : "border-[#937c6032] bg-[#faf8f5] focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                      }`}
                    />
                    {profileErrors.email && (
                      <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2.5 md:gap-3 mt-5 md:mt-6 flex-wrap">
                    <button
                      type="submit"
                      disabled={
                        isProfileSubmitting || updateProfileMutation.isPending
                      }
                      className="px-4 md:px-6 py-2.5 bg-[#937c60] hover:bg-[#6b5d50] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto"
                    >
                      <Save size={14} />
                      {isProfileSubmitting || updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 md:px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-[#937c6024] rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 w-full md:w-auto"
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
            <div className="bg-white p-4 md:p-6 rounded-lg border border-[#937c6014]">
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <div className="flex items-center gap-3 mb-4 md:mb-5 pb-3 border-b border-[#937c6013]">
                  <Lock size={18} style={{ color: "#937c60" }} />
                  <h3 className="text-xs md:text-sm font-bold text-[#1a1a1a] uppercase tracking-wide">
                    Change Password
                  </h3>
                </div>

                <div className="mb-4 md:mb-5">
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 md:mb-2 text-[#1a1a1a]">
                    Current Password *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      placeholder="Enter current password"
                      {...registerPassword(
                        "currentPassword",
                        passwordValidationRules.currentPassword
                      )}
                      className={`w-full px-3 md:px-3 py-2.5 pr-10 rounded-lg text-xs md:text-sm font-inherit transition-all focus:outline-none border ${
                        passwordErrors.currentPassword
                          ? "border-red-300 bg-red-50 focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                          : "border-[#937c6032] bg-[#faf8f5] focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 text-gray-500 hover:text-gray-700 p-1 flex items-center justify-center"
                    >
                      {showPasswords.current ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="mb-4 md:mb-5">
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 md:mb-2 text-[#1a1a1a]">
                    New Password *
                  </label>
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    8+ chars, uppercase, lowercase, number
                  </p>
                  <div className="relative flex items-center">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      placeholder="Enter new password"
                      {...registerPassword(
                        "newPassword",
                        passwordValidationRules.newPassword
                      )}
                      className={`w-full px-3 md:px-3 py-2.5 pr-10 rounded-lg text-xs md:text-sm font-inherit transition-all focus:outline-none border ${
                        passwordErrors.newPassword
                          ? "border-red-300 bg-red-50 focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                          : "border-[#937c6032] bg-[#faf8f5] focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 text-gray-500 hover:text-gray-700 p-1 flex items-center justify-center"
                    >
                      {showPasswords.new ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                  {watchPassword("newPassword") &&
                    !passwordErrors.newPassword && (
                      <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Password OK
                      </p>
                    )}
                </div>

                <div className="mb-4 md:mb-5">
                  <label className="block text-xs md:text-sm font-semibold mb-1.5 md:mb-2 text-[#1a1a1a]">
                    Confirm Password *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      {...registerPassword(
                        "confirmPassword",
                        passwordValidationRules.confirmPassword
                      )}
                      className={`w-full px-3 md:px-3 py-2.5 pr-10 rounded-lg text-xs md:text-sm font-inherit transition-all focus:outline-none border ${
                        passwordErrors.confirmPassword
                          ? "border-red-300 bg-red-50 focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                          : "border-[#937c6032] bg-[#faf8f5] focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 text-gray-500 hover:text-gray-700 p-1 flex items-center justify-center"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                  {watchPassword("confirmPassword") &&
                    watchPassword("newPassword") ===
                      watchPassword("confirmPassword") &&
                    !passwordErrors.confirmPassword && (
                      <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Match
                      </p>
                    )}
                </div>

                <div className="flex gap-2.5 md:gap-3 mt-5 md:mt-6 flex-wrap">
                  <button
                    type="submit"
                    disabled={
                      isPasswordSubmitting || changePasswordMutation.isPending
                    }
                    className="px-4 md:px-6 py-2.5 bg-[#937c60] hover:bg-[#6b5d50] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto"
                  >
                    <Lock size={14} />
                    {isPasswordSubmitting || changePasswordMutation.isPending
                      ? "Changing..."
                      : "Change Password"}
                  </button>
                </div>
              </form>

              {/* Security Info */}
              <div className="mt-6 md:mt-7 pt-5 md:pt-6 border-t border-[#937c6013]">
                <div className="flex items-center gap-3 mb-4 md:mb-5 pb-3 border-b border-[#937c6013]">
                  <Shield size={18} style={{ color: "#937c60" }} />
                  <h3 className="text-xs md:text-sm font-bold text-[#1a1a1a] uppercase tracking-wide">
                    Security Info
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-3 lg:gap-4">
                  <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                      <Lock size={12} /> Active Sessions
                    </p>
                    <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                      1 Session
                    </p>
                  </div>
                  <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Login Alerts
                    </p>
                    <p className="text-xs md:text-sm font-semibold text-white bg-[#937c60] rounded px-2.5 py-1.5 w-fit flex items-center gap-1.5">
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
            <div className="bg-white p-4 md:p-6 rounded-lg border border-[#937c6014]">
              <div className="flex items-center gap-3 mb-4 md:mb-5 pb-3 border-b border-[#937c6013]">
                <Activity size={18} style={{ color: "#937c60" }} />
                <h3 className="text-xs md:text-sm font-bold text-[#1a1a1a] uppercase tracking-wide">
                  Activity
                </h3>
              </div>

              <div className="mb-6 md:mb-8">
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-3 md:mb-3.5 tracking-wide">
                  Recent Events
                </h4>

                <div className="border-l-4 border-[#937c60] bg-[#faf8f5] rounded p-3 mb-3">
                  <p className="text-xs md:text-sm font-semibold text-[#1a1a1a] flex items-center gap-2 mb-1">
                    <CheckCircle2 size={14} /> Profile Updated
                  </p>
                  <p className="text-xs text-gray-600">Last updated today</p>
                </div>

                <div className="border-l-4 border-[#937c60] bg-[#faf8f5] rounded p-3 mb-3">
                  <p className="text-xs md:text-sm font-semibold text-[#1a1a1a] flex items-center gap-2 mb-1">
                    <Lock size={14} /> Password Changed
                  </p>
                  <p className="text-xs text-gray-600">
                    Last changed 2 months ago
                  </p>
                </div>

                <div className="border-l-4 border-[#937c60] bg-[#faf8f5] rounded p-3">
                  <p className="text-xs md:text-sm font-semibold text-[#1a1a1a] flex items-center gap-2 mb-1">
                    <CheckCircle2 size={14} /> Account Created
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(currentUser?.createdAt)}
                  </p>
                </div>
              </div>

              <div className="pt-5 md:pt-6 border-t border-[#937c6013]">
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-3 md:mb-3.5 tracking-wide">
                  Login Stats
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-3 lg:gap-4">
                  <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                      <Clock size={12} /> Last Login
                    </p>
                    <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                      {formatDate(currentUser?.lastLogin)}
                    </p>
                  </div>
                  <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                      <TrendingUp size={12} /> Total Logins
                    </p>
                    <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                      24
                    </p>
                  </div>
                  <div className="flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
                      <AlertCircle size={12} /> Failed Attempts
                    </p>
                    <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
                      0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
      `}</style>
    </div>
  );
}

export default Profile;
