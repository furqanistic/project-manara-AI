import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useAuth";
import AdminHeader from "@/pages/Admin/AdminHeader";
import { ArrowLeft, UserCog } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

const formatValue = (value) => {
  if (value === null || typeof value === "undefined" || value === "") {
    return "Not available";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

const toLabel = (raw) => {
  if (!raw) return "Not available";
  return String(raw)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getPlanLabel = (user) => {
  if (!user?.stripePriceId && user?.subscriptionStatus === "none") return "Free";
  const priceId = String(user?.stripePriceId || "").toLowerCase();
  if (priceId.includes("starter")) return "Starter";
  if (priceId.includes("home")) return "Home";
  if (priceId.includes("plus")) return "Plus";
  return "Custom";
};

const getLocalCreditsForUser = (userId) => {
  if (typeof window === "undefined" || !userId) return null;
  const raw = window.localStorage.getItem(`manara_credits_balance:${userId}`);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
};

function AdminUserProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const profileQuery = useUserProfile(id);
  const user = profileQuery.data?.data?.user;

  const creditsAvailable = getLocalCreditsForUser(user?._id);
  const avatarImage =
    user?.onboardingData?.avatar?.url || user?.onboardingData?.social?.avatarUrl || null;

  const renderProfileSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <section className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-5">
        <div className="h-7 w-44 rounded bg-[#8d775e]/15" />
        <div className="h-4 w-72 rounded bg-[#8d775e]/10 mt-3" />
      </section>

      <section className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`summary-skeleton-${index}`}
              className="rounded-xl border border-[#8d775e]/15 bg-[#8d775e]/5 p-3 space-y-2"
            >
              <div className="h-3 w-20 rounded bg-[#8d775e]/12" />
              <div className="h-4 w-28 rounded bg-[#8d775e]/18" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-5">
        <div className="h-4 w-36 rounded bg-[#8d775e]/12 mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4">
          <div className="h-28 w-28 rounded-2xl bg-[#8d775e]/15" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`avatar-meta-${index}`} className="space-y-2">
                <div className="h-3 w-20 rounded bg-[#8d775e]/12" />
                <div className="h-4 w-28 rounded bg-[#8d775e]/18" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f1ec] text-gray-900 dark:bg-[#0a0908] dark:text-gray-100">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(141,119,94,0.2),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(141,119,94,0.14),transparent_30%),linear-gradient(180deg,transparent,rgba(141,119,94,0.04))] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(168,143,115,0.3),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(141,119,94,0.2),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
      <AdminHeader />

      <main className="relative max-w-[1200px] mx-auto px-4 lg:px-8 pt-8 pb-12">
        <Button variant="outline" className="rounded-xl mb-5" onClick={() => navigate("/admin")}>
          <ArrowLeft size={14} />
          Back to users
        </Button>

        {profileQuery.isLoading ? (
          renderProfileSkeleton()
        ) : profileQuery.isError || !user ? (
          <div className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-8 text-center">
            <UserCog className="mx-auto mb-3 text-[#8d775e]" />
            User profile not available.
          </div>
        ) : (
          <div className="space-y-4">
            <section className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-5">
              <h1 className="text-2xl font-semibold">User Profile</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Full account and onboarding details.
              </p>
            </section>

            <section className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border border-[#8d775e]/20 bg-[#8d775e]/5 p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium">{user.name || "Unnamed User"}</p>
                </div>
                <div className="rounded-xl border border-[#8d775e]/20 bg-[#8d775e]/5 p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium break-all">{user.email}</p>
                </div>
                <div className="rounded-xl border border-[#8d775e]/20 bg-[#8d775e]/5 p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                  <p className="font-medium">{user.role || "user"}</p>
                </div>
                <div className="rounded-xl border border-[#8d775e]/20 bg-[#8d775e]/5 p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-medium">{user.isActive === false ? "Inactive" : "Active"}</p>
                </div>
                <div className="rounded-xl border border-[#8d775e]/20 bg-[#8d775e]/5 p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Plan</p>
                  <p className="font-medium">{getPlanLabel(user)}</p>
                </div>
                <div className="rounded-xl border border-[#8d775e]/20 bg-[#8d775e]/5 p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Credits Available</p>
                  <p className="font-medium">
                    {creditsAvailable === null ? "Not available" : creditsAvailable}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 mb-2">
                Avatar
              </p>
              <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 items-start">
                <div className="h-28 w-28 rounded-2xl overflow-hidden border border-[#8d775e]/20 bg-[#8d775e]/5 flex items-center justify-center">
                  {avatarImage ? (
                    <img src={avatarImage} alt="User avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-500">Not available</span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avatar name</p>
                    <p className="font-medium">{formatValue(user?.onboardingData?.avatar?.name)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avatar style</p>
                    <p className="font-medium">{formatValue(user?.onboardingData?.avatar?.style)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Avatar palette</p>
                    <p className="font-medium">{formatValue(user?.onboardingData?.avatar?.palette)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Social provider</p>
                    <p className="font-medium">{formatValue(user?.onboardingData?.social?.provider)}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 mb-2">
                Onboarding
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">User type</p>
                  <p className="font-medium">
                    {toLabel(
                      user?.onboardingData?.userType ||
                        user?.onboardingData?.identity?.userType
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Onboarded</p>
                  <p className="font-medium">{formatValue(user?.isOnboarded)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Country</p>
                  <p className="font-medium">
                    {formatValue(
                      user?.onboardingData?.requiredProfile?.country ||
                        user?.onboardingData?.identity?.country
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                  <p className="font-medium">
                    {formatValue(
                      user?.onboardingData?.requiredProfile?.city ||
                        user?.onboardingData?.identity?.city
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Billing region</p>
                  <p className="font-medium">
                    {formatValue(
                      user?.onboardingData?.requiredProfile?.billingRegion ||
                        user?.onboardingData?.identity?.billingRegion
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email confirmed</p>
                  <p className="font-medium">
                    {formatValue(user?.onboardingData?.requiredProfile?.emailConfirmed)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#151515]/80 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 mb-2">
                Qualification Answers
              </p>
              {Array.isArray(user?.onboardingData?.qualification?.questions) &&
              user.onboardingData.qualification.questions.length > 0 ? (
                <div className="space-y-2">
                  {user.onboardingData.qualification.questions.map((item, index) => (
                    <div
                      key={`${item?.id || "q"}-${index}`}
                      className="rounded-lg bg-[#8d775e]/5 border border-[#8d775e]/15 p-2.5"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatValue(item?.prompt)}
                      </p>
                      <p className="font-medium">{formatValue(item?.answer)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-medium text-sm">Not available</p>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUserProfile;
