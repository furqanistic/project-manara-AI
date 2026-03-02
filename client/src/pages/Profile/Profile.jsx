import TopBar from "@/components/Layout/Topbar";
import AvatarCreationModal from "@/components/Auth/AvatarCreationModal";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useChangePassword, useCurrentUser, useUpdateProfile } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { AlertCircle, CheckCircle2, Edit2, Lock, Mail, Save, User } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND_COLOR = "#937c60";

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
      minLength: (v) => v.length >= 8 || "Password must be at least 8 characters",
      hasUppercase: (v) => /[A-Z]/.test(v) || "Need uppercase letter",
      hasLowercase: (v) => /[a-z]/.test(v) || "Need lowercase letter",
      hasNumber: (v) => /[0-9]/.test(v) || "Need a number",
    },
  },
  confirmPassword: {
    required: "Please confirm password",
    validate: (v, { newPassword }) => v === newPassword || "Passwords do not match",
  },
};

const TextInput = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <Icon size={14} />
        </div>
      )}
      <input
        className={`w-full rounded-2xl border px-10 py-3 text-sm bg-white dark:bg-[#111] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#937c60]/30 transition-all ${
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-100 dark:border-white/10 focus:border-[#937c60]"
        }`}
        {...props}
      />
    </div>
    {error && (
      <p className="text-xs text-red-600 flex items-center gap-1">
        <AlertCircle size={12} />
        {error.message}
      </p>
    )}
  </div>
);

const formatReadableValue = (value) => {
  if (typeof value !== "string") return value;
  const normalized = value
    .replace(/(\d)[_-]+(\d)/g, "$1-$2")
    .replace(/^(\d+)\s+(\d+)$/, "$1-$2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

function Profile() {
  const currentUser = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const avatarUrl = currentUser?.onboardingData?.avatar?.url;
  const avatarName = currentUser?.onboardingData?.avatar?.name;

  const [isEditMode, setIsEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const { creditLedger, creditBalance } = useCredits();

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

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

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

  const getInitials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const usageData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), credits: 0 });
    }

    const ledger = creditLedger || [];
    ledger.forEach((entry) => {
      if (entry.type !== "debit") return;
      const dayKey = entry.timestamp?.slice(0, 10);
      const bucket = days.find((d) => d.key === dayKey);
      if (bucket) bucket.credits += Number(entry.amount) || 0;
    });

    return days.map(({ label, credits }) => ({ label, credits }));
  }, [creditLedger]);

  const onboardingSummary = useMemo(() => {
    const data = currentUser?.onboardingData || {};
    const requiredProfile = data?.requiredProfile || {};
    const qualificationQuestions = Array.isArray(data?.qualification?.questions)
      ? data.qualification.questions
      : [];
    const legacyIdentity = data?.identity || {};

    const primaryFields = [
      {
        label: "User Type",
        value: formatReadableValue(data?.userType || legacyIdentity?.userType),
      },
      {
        label: "Country",
        value: formatReadableValue(requiredProfile?.country || legacyIdentity?.country),
      },
      {
        label: "City",
        value: formatReadableValue(requiredProfile?.city || legacyIdentity?.city),
      },
      {
        label: "Billing Region",
        value: formatReadableValue(requiredProfile?.billingRegion || legacyIdentity?.billingRegion),
      },
      {
        label: "Billing Email Confirmed",
        value:
          typeof requiredProfile?.emailConfirmed === "boolean"
            ? requiredProfile.emailConfirmed
              ? "Yes"
              : "No"
            : undefined,
      },
    ].filter((item) => item.value !== undefined && item.value !== null && item.value !== "");

    return {
      primaryFields,
      qualificationQuestions,
    };
  }, [currentUser?.onboardingData]);

  return (
    <div className="min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a]">
      <TopBar />

      <main className="max-w-4xl mx-auto pt-36 pb-20 px-6">
        <div className="flex items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl text-white flex items-center justify-center text-xl font-bold overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${BRAND_COLOR}, #6b5d50)` }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(currentUser?.name)
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarEditorOpen(true)}
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] hover:bg-black transition-all"
                aria-label="Edit avatar"
              >
                <Edit2 size={12} />
              </button>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {currentUser?.name || "Your profile"}
              </h1>
              {avatarName && (
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  Avatar: {avatarName}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentUser?.email || "No email"}
              </p>
            </div>
          </div>
          {!isEditMode && activeTab === "profile" && (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest bg-gray-900 text-white hover:bg-black transition-all"
            >
              <span className="flex items-center gap-2">
                <Edit2 size={14} /> Edit
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {[
            { id: "profile", label: "Profile" },
            { id: "security", label: "Security" },
            { id: "usage", label: "Usage" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${
                activeTab === tab.id
                  ? "bg-[#937c60] text-white border-[#937c60]"
                  : "bg-white dark:bg-[#111] text-gray-500 dark:text-gray-300 border-gray-100 dark:border-white/10 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "usage" && creditBalance === 0 && (
          <div className="mb-6 p-4 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 flex gap-3 items-start">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Credits needed</p>
              <p className="text-xs mt-0.5">
                Your balance is 0. You will not be able to use the AI tools until you add credits.
              </p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 flex gap-3 items-start">
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-xs mt-0.5">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-900 rounded-2xl border border-red-200 flex gap-3 items-start">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {activeTab === "profile" && (
            <section className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-[#937c60] opacity-40" />
                <p className="text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase">
                  Profile
                </p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Credits Balance</div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">{creditBalance} credits</div>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-5">
                <TextInput
                  label="Full Name"
                  icon={User}
                  placeholder="Enter your full name"
                  disabled={!isEditMode}
                  error={profileErrors.name}
                  {...registerProfile("name", PROFILE_VALIDATION.name)}
                />
                <TextInput
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="Enter your email"
                  disabled={!isEditMode}
                  error={profileErrors.email}
                  {...registerProfile("email", PROFILE_VALIDATION.email)}
                />

                {isEditMode && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={isProfileSubmitting || updateProfileMutation.isPending}
                      className="px-5 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-60"
                    >
                      <span className="flex items-center gap-2">
                        <Save size={14} />
                        {isProfileSubmitting || updateProfileMutation.isPending ? "Saving..." : "Save"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditMode(false);
                        resetProfile();
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              <div className="mt-8 border-t border-gray-100 dark:border-white/10 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-[1px] bg-[#937c60] opacity-40" />
                  <p className="text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase">
                    Onboarding Info
                  </p>
                </div>

                {onboardingSummary.primaryFields.length === 0 &&
                onboardingSummary.qualificationQuestions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No onboarding information saved yet.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {onboardingSummary.primaryFields.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {onboardingSummary.primaryFields.map((item) => (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-gray-100 dark:border-white/10 bg-[#faf8f6] dark:bg-white/5 px-4 py-3"
                          >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              {item.label}
                            </p>
                            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {onboardingSummary.qualificationQuestions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                          Qualification Answers
                        </p>
                        <div className="space-y-2">
                          {onboardingSummary.qualificationQuestions.map((question, index) => (
                            <div
                              key={question.id || index}
                              className="rounded-2xl border border-gray-100 dark:border-white/10 px-4 py-3"
                            >
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                {question.prompt || `Question ${index + 1}`}
                              </p>
                              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                                {formatReadableValue(question.answer) || "Not answered"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "security" && (
            <section className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-[1px] bg-[#937c60] opacity-40" />
                <p className="text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase">
                  Security
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-5">
                <TextInput
                  label="Current Password"
                  icon={Lock}
                  type="password"
                  placeholder="Enter current password"
                  error={passwordErrors.currentPassword}
                  {...registerPassword("currentPassword", PASSWORD_VALIDATION.currentPassword)}
                />
                <TextInput
                  label="New Password"
                  icon={Lock}
                  type="password"
                  placeholder="Enter new password"
                  error={passwordErrors.newPassword}
                  {...registerPassword("newPassword", PASSWORD_VALIDATION.newPassword)}
                />
                <TextInput
                  label="Confirm Password"
                  icon={Lock}
                  type="password"
                  placeholder="Confirm new password"
                  error={passwordErrors.confirmPassword}
                  {...registerPassword("confirmPassword", PASSWORD_VALIDATION.confirmPassword)}
                />

                <button
                  type="submit"
                  disabled={isPasswordSubmitting || changePasswordMutation.isPending}
                  className="px-5 py-2.5 rounded-2xl bg-[#937c60] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#7a6650] transition-all disabled:opacity-60"
                >
                  {isPasswordSubmitting || changePasswordMutation.isPending ? "Updating..." : "Update password"}
                </button>
              </form>
            </section>
          )}

          {activeTab === "usage" && (
            <section className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-[1px] bg-[#937c60] opacity-40" />
                <p className="text-[10px] font-bold tracking-[0.4em] text-[#937c60] uppercase">
                  Usage
                </p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400">Credits used over the last 30 days.</p>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300">
                  Available: <span className="text-[#937c60]">{creditBalance}</span>
                </div>
              </div>
              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 12 }} />
                    <Bar dataKey="credits" fill={BRAND_COLOR} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>
      </main>
      {isAvatarEditorOpen && (
        <AvatarCreationModal
          allowClose
          initialAvatar={currentUser?.onboardingData?.avatar}
          onClose={() => setIsAvatarEditorOpen(false)}
          onComplete={() => {
            setIsAvatarEditorOpen(false);
            setSuccessMessage("Avatar updated successfully!");
            setErrorMessage("");
          }}
        />
      )}
    </div>
  );
}

export default Profile;
