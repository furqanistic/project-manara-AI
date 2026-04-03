import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCurrentUser,
  useDeleteUser,
  useGetAllUsers,
  useUpdateUserAsAdmin,
} from "@/hooks/useAuth";
import AdminHeader from "@/pages/Admin/AdminHeader";
import {
  AlertCircle,
  MoreHorizontal,
  Search,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const cardClass =
  "rounded-3xl border border-[#8d775e]/15 bg-white/70 dark:bg-[#121212]/85 backdrop-blur-lg shadow-[0_18px_40px_-30px_rgba(0,0,0,0.65)]";

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

function AdminPanel() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [roleDraft, setRoleDraft] = useState("user");
  const [pendingAction, setPendingAction] = useState(null);

  const usersQuery = useGetAllUsers(page, 20);
  const updateUserMutation = useUpdateUserAsAdmin();
  const deleteUserMutation = useDeleteUser();

  useEffect(() => {
    const onClick = (event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("[data-action-menu='true']")) return;
      setOpenMenuUserId(null);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const users = usersQuery.data?.data?.users || [];
  const totalUsers = usersQuery.data?.totalResults || 0;
  const totalPages = usersQuery.data?.totalPages || 1;

  const resolveUserCreditsAvailable = (user) => {
    const localCredits = getLocalCreditsForUser(user?._id);
    if (localCredits !== null) return localCredits;
    return Number(user?.creditsAvailable || 0);
  };

  const resolveUserCreditsLabel = (user) => {
    const available = resolveUserCreditsAvailable(user);
    const limit = Number(user?.creditsLimit || 0);
    if (limit > 0) return `${available} / ${limit}`;
    return String(available);
  };

  const metrics = useMemo(() => {
    const admins = users.filter((item) => item.role === "admin").length;
    const active = users.filter((item) => item.isActive !== false).length;
    const credits = users.reduce(
      (sum, item) => sum + resolveUserCreditsAvailable(item),
      0
    );
    return { admins, active, credits };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => {
      const haystack = [
        user.name,
        user.email,
        user.role,
        user.subscriptionStatus,
        getPlanLabel(user),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [users, query]);

  const openRoleDialog = (user) => {
    if (currentUser?._id === user?._id) {
      toast.error("You cannot change your own role here.");
      return;
    }
    setSelectedUser(user);
    setRoleDraft(user?.role || "user");
    setIsRoleDialogOpen(true);
    setOpenMenuUserId(null);
  };

  const saveRoleChange = async () => {
    if (!selectedUser?._id) return;
    if (roleDraft === selectedUser.role) {
      setIsRoleDialogOpen(false);
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        userId: selectedUser._id,
        userData: { role: roleDraft },
      });
      toast.success("Role updated.");
      setIsRoleDialogOpen(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to update role."
      );
    }
  };

  const queueAction = (type, user) => {
    if (currentUser?._id === user?._id) {
      toast.error("You cannot apply this action to your own admin account.");
      return;
    }
    setPendingAction({ type, user });
    setOpenMenuUserId(null);
  };

  const runPendingAction = async () => {
    if (!pendingAction?.user?._id) return;
    const user = pendingAction.user;

    try {
      if (pendingAction.type === "toggle-status") {
        const nextIsActive = user.isActive === false;
        await updateUserMutation.mutateAsync({
          userId: user._id,
          userData: { isActive: nextIsActive },
        });
        toast.success(nextIsActive ? "User activated." : "User deactivated.");
      }

      if (pendingAction.type === "delete") {
        await deleteUserMutation.mutateAsync(user._id);
        toast.success("User deleted.");
      }

      setPendingAction(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Action failed."
      );
    }
  };

  const confirmTitle =
    pendingAction?.type === "delete" ? "Delete User" : "Change Account Status";

  const confirmDescription =
    pendingAction?.type === "delete"
      ? `Delete ${pendingAction?.user?.email}? This is a soft-delete and deactivates the account.`
      : pendingAction?.user?.isActive === false
      ? `Activate ${pendingAction?.user?.email}?`
      : `Deactivate ${pendingAction?.user?.email}?`;

  const confirmLabel = pendingAction?.type === "delete" ? "Delete" : "Confirm";

  const isBusy = updateUserMutation.isPending || deleteUserMutation.isPending;

  const renderTableSkeleton = () => (
    <div className="p-5 space-y-4 animate-pulse">
      <div className="grid grid-cols-6 gap-3">
        <div className="h-4 rounded bg-[#8d775e]/15" />
        <div className="h-4 rounded bg-[#8d775e]/15" />
        <div className="h-4 rounded bg-[#8d775e]/15" />
        <div className="h-4 rounded bg-[#8d775e]/15" />
        <div className="h-4 rounded bg-[#8d775e]/15" />
        <div className="h-4 rounded bg-[#8d775e]/15" />
      </div>
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={`skeleton-row-${index}`}
          className="grid grid-cols-6 gap-3 items-center border-t border-[#8d775e]/10 pt-4"
        >
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-[#8d775e]/20" />
            <div className="h-3 w-44 rounded bg-[#8d775e]/12" />
          </div>
          <div className="h-4 w-20 rounded bg-[#8d775e]/12" />
          <div className="h-4 w-16 rounded bg-[#8d775e]/12" />
          <div className="h-4 w-14 rounded bg-[#8d775e]/12" />
          <div className="h-7 w-20 rounded-full bg-[#8d775e]/12" />
          <div className="h-9 w-9 rounded-lg bg-[#8d775e]/15 justify-self-start" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f1ec] text-gray-900 dark:bg-[#0a0908] dark:text-gray-100">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_0%,rgba(141,119,94,0.2),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(141,119,94,0.14),transparent_30%),linear-gradient(180deg,transparent,rgba(141,119,94,0.04))] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(168,143,115,0.3),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(141,119,94,0.2),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
      <AdminHeader />

      <main className="relative px-4 lg:px-10 pt-8 pb-12 max-w-[1500px] mx-auto">
        <section className={`${cardClass} p-6 md:p-8`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8d775e]">
              Admin Console
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              User Management
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
              View users, credits, roles, and handle account actions from one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <article className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#171717]/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Total users</p>
              <p className="mt-2 text-2xl font-semibold">{totalUsers}</p>
            </article>
            <article className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#171717]/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Admins</p>
              <p className="mt-2 text-2xl font-semibold">{metrics.admins}</p>
            </article>
            <article className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#171717]/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Active users</p>
              <p className="mt-2 text-2xl font-semibold">{metrics.active}</p>
            </article>
            <article className="rounded-2xl border border-[#8d775e]/20 bg-white/80 dark:bg-[#171717]/80 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Credits available</p>
              <p className="mt-2 text-2xl font-semibold">{metrics.credits}</p>
            </article>
          </div>
        </section>

        <section className={`${cardClass} mt-6`}>
          <div className="border-b border-[#8d775e]/15 p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users by name, email, role, or plan..."
                className="w-full h-11 rounded-2xl border border-[#8d775e]/25 bg-white dark:bg-[#0f0f0f] px-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#8d775e]/35"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Page {page} of {Math.max(1, totalPages)}
            </p>
          </div>

          {usersQuery.isLoading ? (
            renderTableSkeleton()
          ) : usersQuery.isError ? (
            <div className="p-8 flex items-center gap-2 text-sm text-red-600 dark:text-red-300">
              <AlertCircle size={16} />
              Failed to load users.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.16em] text-gray-500">
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Plan</th>
                      <th className="px-5 py-3">Credits</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isSelf = currentUser?._id === user._id;
                      const isActive = user.isActive !== false;

                      return (
                        <tr
                          key={user._id}
                          className="border-t border-[#8d775e]/15 hover:bg-[#8d775e]/[0.03] dark:hover:bg-[#8d775e]/[0.08]"
                        >
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/users/${user._id}`)}
                              className="text-left"
                            >
                              <p className="font-semibold hover:text-[#8d775e] transition-colors">
                                {user.name || "Unnamed User"}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {user.email}
                              </p>
                            </button>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium">{getPlanLabel(user)}</td>

                          <td className="px-5 py-4 text-sm font-medium">{resolveUserCreditsLabel(user)}</td>

                          <td className="px-5 py-4 text-sm">{user.role || "user"}</td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center h-8 rounded-full border px-3 text-xs font-semibold ${
                                isActive
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                  : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="relative inline-block" data-action-menu="true">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuUserId((prev) =>
                                    prev === user._id ? null : user._id
                                  )
                                }
                                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[#8d775e]/25 hover:bg-[#8d775e]/10"
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {openMenuUserId === user._id && (
                                <div className="absolute right-0 z-30 mt-2 w-44 rounded-xl border border-[#8d775e]/20 bg-white dark:bg-[#151515] shadow-xl p-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuUserId(null);
                                      navigate(`/admin/users/${user._id}`);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#8d775e]/10"
                                  >
                                    View profile
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openRoleDialog(user)}
                                    disabled={isSelf}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#8d775e]/10 disabled:opacity-45 disabled:hover:bg-transparent"
                                  >
                                    Change role
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => queueAction("toggle-status", user)}
                                    disabled={isSelf}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#8d775e]/10 disabled:opacity-45 disabled:hover:bg-transparent"
                                  >
                                    {isActive ? "Deactivate user" : "Activate user"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => queueAction("delete", user)}
                                    disabled={isSelf}
                                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 disabled:opacity-45 disabled:hover:bg-transparent"
                                  >
                                    Delete user
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                  <UserCog className="mx-auto text-[#8d775e] mb-3" size={30} />
                  <p className="text-sm text-gray-600 dark:text-gray-300">No users found.</p>
                </div>
              )}

              <div className="p-4 border-t border-[#8d775e]/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                  className="h-10 px-4 rounded-xl border border-[#8d775e]/30 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">
                  <Users size={13} />
                  {filteredUsers.length} shown
                </div>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages}
                  className="h-10 px-4 rounded-xl border border-[#8d775e]/30 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>

        <section className="mt-5 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <Wallet size={13} />
          Plan changes are disabled in admin panel. Credits are view-only.
        </section>
      </main>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl border border-[#8d775e]/25 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Change Role</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Update role for {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>

          <div>
            <label className="text-xs uppercase tracking-[0.14em] text-gray-500">Role</label>
            <select
              value={roleDraft}
              onChange={(event) => setRoleDraft(event.target.value)}
              className="mt-2 w-full h-10 rounded-xl border border-[#8d775e]/25 bg-white dark:bg-[#0f0f0f] px-3 text-sm"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRoleChange} disabled={updateUserMutation.isPending}>
              Save role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent className="max-w-md rounded-2xl border border-[#8d775e]/25 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">{confirmTitle}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {confirmDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingAction(null)} disabled={isBusy}>
              Cancel
            </Button>
            <Button
              variant={pendingAction?.type === "delete" ? "destructive" : "default"}
              onClick={runPendingAction}
              disabled={isBusy}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminPanel;
