// File: project-manara-AI/client/src/pages/Profile/Profile.jsx
import TopBar from "@/components/Layout/Topbar";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useCurrentUser,
  useChangePassword,
  useUpdateProfile,
} from "@/hooks/useAuth";
import {
  User,
  Mail,
  CheckCircle2,
  Lock,
  Fingerprint,
  Crown,
  Calendar,
  RefreshCw,
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
} from "lucide-react";

// ============ Constants ============
const BRAND_COLOR = "#937c60";

const TAB_CONFIG = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "activity", label: "Activity", icon: Activity },
];

const CLASS_CARD =
  "flex flex-col p-3 bg-[#faf8f5] rounded-lg border border-[#937c6013]";
const CLASS_INPUT_BASE =
  "w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-inherit transition-all focus:outline-none border";
const CLASS_INPUT_ERROR =
  "border-red-300 bg-red-50 focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]";
const CLASS_INPUT_NORMAL =
  "border-[#937c6032] bg-[#faf8f5] focus:border-[#937c60] focus:ring-2 focus:ring-[#937c6024]";
const CLASS_BUTTON_PRIMARY =
  "px-4 md:px-6 py-2.5 bg-[#937c60] hover:bg-[#6b5d50] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0";
const CLASS_BUTTON_SECONDARY =
  "px-4 md:px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-[#937c6024] rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all duration-300";
const CLASS_STATUS_BADGE =
  "text-xs md:text-sm font-semibold text-white bg-[#937c60] rounded px-2.5 py-1.5 w-fit flex items-center gap-1.5";
const CLASS_LABEL =
  "block text-xs md:text-sm font-semibold mb-1.5 md:mb-2 text-[#1a1a1a]";
const CLASS_SECTION_HEADER =
  "flex items-center gap-3 mb-4 md:mb-5 pb-3 border-b border-[#937c6013]";

// ============ Validation Rules ============
const PROFILE_VALIDATION = {
  name: {
    required: "Full name is required",
    minLength: { value: 2, message: "Name must be at least 2 characters" },
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Invalid email format",
    },
  },
};

const PASSWORD_VALIDATION = {
  currentPassword: { required: "Current password required" },
  newPassword: {
    required: "New password required",
    validate: {
      minLength: (v) =>
        v.length >= 8 || "Password must be at least 8 characters",
      hasUppercase: (v) => /[A-Z]/.test(v) || "Need uppercase letter",
      hasLowercase: (v) => /[a-z]/.test(v) || "Need lowercase letter",
      hasNumber: (v) => /[0-9]/.test(v) || "Need a number",
    },
  },
  confirmPassword: {
    required: "Please confirm password",
    validate: (v, { newPassword }) =>
      v === newPassword || "Passwords do not match",
  },
};

// ============ Reusable Components ============
const FormInput = ({ label, error, required = false, ...props }) => (
  <div className="mb-4 md:mb-5">
    <label className={CLASS_LABEL}>
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    <input
      className={`${CLASS_INPUT_BASE} ${
        error ? CLASS_INPUT_ERROR : CLASS_INPUT_NORMAL
      }`}
      {...props}
    />
    {error && (
      <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {error.message}
      </p>
    )}
  </div>
);

const PasswordInput = ({
  label,
  hint,
  value,
  error,
  fieldName,
  showPassword,
  onToggle,
  required = false,
  ...props
}) => (
  <div className="mb-4 md:mb-5">
    <label className={CLASS_LABEL}>
      {label} {required && <span className="text-red-600">*</span>}
    </label>
    {hint && <p className="text-xs text-gray-600 mb-2 font-medium">{hint}</p>}
    <div className="relative flex items-center">
      <input
        type={showPassword ? "text" : "password"}
        className={`${CLASS_INPUT_BASE} pr-10 ${
          error ? CLASS_INPUT_ERROR : CLASS_INPUT_NORMAL
        }`}
        {...props}
      />
      <button
        type="button"
        onClick={() => onToggle(fieldName)}
        className="absolute right-3 text-gray-500 hover:text-gray-700 p-1 flex items-center justify-center"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
    {error && (
      <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
        {error.message}
      </p>
    )}
    {value && !error && (
      <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
        <CheckCircle2 size={12} />
        {fieldName === "confirmPassword" ? "Match" : "Password OK"}
      </p>
    )}
  </div>
);

const InfoCard = ({ icon: Icon, label, value, isStatus = false }) => (
  <div className={CLASS_CARD}>
    <p className="text-xs font-bold text-gray-500 uppercase mb-1.5 md:mb-2 flex items-center gap-1">
      <Icon size={12} /> {label}
    </p>
    {isStatus ? (
      <p className={CLASS_STATUS_BADGE}>
        <CheckCircle2 size={12} />
        {value}
      </p>
    ) : (
      <p className="text-sm md:text-base font-semibold text-[#1a1a1a]">
        {value}
      </p>
    )}
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <div className={CLASS_SECTION_HEADER}>
    <Icon size={18} style={{ color: BRAND_COLOR }} />
    <h3 className="text-xs md:text-sm font-bold text-[#1a1a1a] uppercase tracking-wide">
      {title}
    </h3>
  </div>
);

// ============ Main Component ============
function Profile() {
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

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  });

  // Password Form
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

  // ============ Event Handlers ============
  const onProfileSubmit = async (data) => {
    try {
      setErrorMessage("");
      await updateProfileMutation.mutateAsync({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
      });
      setSuccessMessage("Profile updated successfully!");
      setIsEditMode(false);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update profile";
      setErrorMessage(errorMsg);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setErrorMessage("");
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      resetPassword();
      setSuccessMessage("Password changed successfully!");
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to change password";
      setErrorMessage(errorMsg);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    resetProfile();
    setErrorMessage("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
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
                style={{ color: BRAND_COLOR }}
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
            {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
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
                    <SectionHeader icon={User} title="Basic Info" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      <InfoCard
                        icon={User}
                        label="Full Name"
                        value={currentUser?.name || "Not set"}
                      />
                      <InfoCard
                        icon={Mail}
                        label="Email"
                        value={currentUser?.email || "Not set"}
                      />
                      <InfoCard
                        icon={CheckCircle2}
                        label="Status"
                        value={currentUser?.isActive ? "Active" : "Inactive"}
                        isStatus={true}
                      />
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="mb-0 pb-0">
                    <SectionHeader icon={Lock} title="Account Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      <InfoCard
                        icon={Fingerprint}
                        label="User ID"
                        value={currentUser?._id?.slice(0, 16) || "N/A"}
                      />
                      <InfoCard
                        icon={Crown}
                        label="Role"
                        value={currentUser?.role === "admin" ? "Admin" : "User"}
                        isStatus={true}
                      />
                      <InfoCard
                        icon={Calendar}
                        label="Member Since"
                        value={formatDate(currentUser?.createdAt)}
                      />
                      <InfoCard
                        icon={RefreshCw}
                        label="Last Updated"
                        value={formatDate(currentUser?.updatedAt)}
                      />
                      <InfoCard
                        icon={CheckCircle2}
                        label="Email Verified"
                        value="Verified"
                        isStatus={true}
                      />
                      <InfoCard
                        icon={Clock}
                        label="Last Login"
                        value={formatDate(currentUser?.lastLogin)}
                      />
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex gap-2.5 md:gap-3 mt-5 md:mt-6 flex-wrap">
                    <button
                      onClick={() => setIsEditMode(true)}
                      className={`${CLASS_BUTTON_PRIMARY}  md:w-auto`}
                    >
                      <Edit2 size={14} />
                      Edit Profile
                    </button>
                  </div>
                </>
              ) : (
                /* Edit Mode */
                <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <FormInput
                    label="Full Name"
                    placeholder="Enter your full name"
                    required
                    error={profileErrors.name}
                    {...registerProfile("name", PROFILE_VALIDATION.name)}
                  />
                  <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    error={profileErrors.email}
                    {...registerProfile("email", PROFILE_VALIDATION.email)}
                  />

                  <div className="flex gap-2.5 md:gap-3 mt-5 md:mt-6 flex-wrap">
                    <button
                      type="submit"
                      disabled={
                        isProfileSubmitting || updateProfileMutation.isPending
                      }
                      className={`${CLASS_BUTTON_PRIMARY} w-full md:w-auto`}
                    >
                      <Save size={14} />
                      {isProfileSubmitting || updateProfileMutation.isPending
                        ? "Saving..."
                        : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className={`${CLASS_BUTTON_SECONDARY} w-full md:w-auto`}
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
                <SectionHeader icon={Lock} title="Change Password" />

                <PasswordInput
                  label="Current Password"
                  placeholder="Enter current password"
                  fieldName="current"
                  showPassword={showPasswords.current}
                  onToggle={togglePasswordVisibility}
                  value={watchPassword("currentPassword")}
                  error={passwordErrors.currentPassword}
                  required
                  {...registerPassword(
                    "currentPassword",
                    PASSWORD_VALIDATION.currentPassword
                  )}
                />

                <PasswordInput
                  label="New Password"
                  hint="8+ chars, uppercase, lowercase, number"
                  placeholder="Enter new password"
                  fieldName="new"
                  showPassword={showPasswords.new}
                  onToggle={togglePasswordVisibility}
                  value={watchPassword("newPassword")}
                  error={passwordErrors.newPassword}
                  required
                  {...registerPassword(
                    "newPassword",
                    PASSWORD_VALIDATION.newPassword
                  )}
                />

                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  fieldName="confirm"
                  showPassword={showPasswords.confirm}
                  onToggle={togglePasswordVisibility}
                  value={watchPassword("confirmPassword")}
                  error={passwordErrors.confirmPassword}
                  required
                  {...registerPassword(
                    "confirmPassword",
                    PASSWORD_VALIDATION.confirmPassword
                  )}
                />

                <div className="flex gap-2.5 md:gap-3 mt-5 md:mt-6 flex-wrap">
                  <button
                    type="submit"
                    disabled={
                      isPasswordSubmitting || changePasswordMutation.isPending
                    }
                    className={`${CLASS_BUTTON_PRIMARY} w-full md:w-auto`}
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
                <SectionHeader icon={Shield} title="Security Info" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <InfoCard
                    icon={Lock}
                    label="Active Sessions"
                    value="1 Session"
                  />
                  <InfoCard
                    icon={CheckCircle2}
                    label="Login Alerts"
                    value="Enabled"
                    isStatus={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="bg-white p-4 md:p-6 rounded-lg border border-[#937c6014]">
              <SectionHeader icon={Activity} title="Activity" />

              <div className="mb-6 md:mb-8">
                <h4 className="text-xs font-bold text-gray-600 uppercase mb-3 md:mb-3.5 tracking-wide">
                  Recent Events
                </h4>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <InfoCard
                    icon={Clock}
                    label="Last Login"
                    value={formatDate(currentUser?.lastLogin)}
                  />
                  <InfoCard icon={TrendingUp} label="Total Logins" value="—" />
                  <InfoCard
                    icon={AlertCircle}
                    label="Failed Attempts"
                    value="—"
                  />
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
