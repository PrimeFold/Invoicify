"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  User,
  Mail,
  ShieldAlert,
  Clock,
  Sparkles,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getUserProfile,
  updateProfileName,
  updateProfileEmail,
  deleteAccount,
  type UserProfileData,
} from "@/app/actions/user";
import { authClient } from "@/lib/auth";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getCachedData, setCachedData, invalidateClientCache } from "@/lib/client-cache";

const SETTINGS_CACHE_KEY = "user:profile";
const settle = { type: "spring", bounce: 0, duration: 0.5 } as const;

export default function SettingsPage() {
  const reduced = useReducedMotion();
  const router = useRouter();

  const cachedProfile = getCachedData<UserProfileData>(SETTINGS_CACHE_KEY);
  const [profile, setProfile] = useState<UserProfileData | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedProfile);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [name, setName] = useState(cachedProfile?.name || "");
  const [email, setEmail] = useState(cachedProfile?.email || "");

  // Saving states
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // Danger zone confirmation state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const fetchProfile = (silent = false) => {
    if (!silent && !cachedProfile) setIsLoading(true);
    getUserProfile()
      .then((data) => {
        setProfile(data);
        setName(data.name);
        setEmail(data.email);
        setCachedData(SETTINGS_CACHE_KEY, data);
      })
      .catch((error) => {
        console.error("Failed to load profile:", error);
        if (!cachedProfile) {
          toast.error({
            title: "Error loading profile",
            description: (error as Error).message || "Could not fetch user details.",
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile(!!cachedProfile);
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingName(true);
    updateProfileName(name)
      .then((res) => {
        invalidateClientCache();
        toast.success({
          title: "Username updated",
          description: "Your display name has been updated successfully.",
        });
        fetchProfile(true);
      })
      .catch((err) => {
        toast.error({
          title: "Update failed",
          description: (err as Error).message || "Could not update username.",
        });
      })
      .finally(() => {
        setSavingName(false);
      });
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSavingEmail(true);
    updateProfileEmail(email)
      .then((res) => {
        invalidateClientCache();
        toast.success({
          title: "Email updated",
          description: "Your account email has been updated successfully.",
        });
        fetchProfile(true);
      })
      .catch((err) => {
        toast.error({
          title: "Update failed",
          description: (err as Error).message || "Could not update email.",
        });
      })
      .finally(() => {
        setSavingEmail(false);
      });
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "DELETE") return;

    setDeletingAccount(true);
    deleteAccount()
      .then(async () => {
        toast.success({
          title: "Account deleted",
          description: "Your account and data have been permanently removed.",
        });

        // Sign out session
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/login");
              router.refresh();
            },
          },
        });
      })
      .catch((err) => {
        toast.error({
          title: "Account deletion failed",
          description: (err as Error).message || "Could not delete account.",
        });
        setDeletingAccount(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <LoadingIndicator size="md" label="Loading account preferences..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-left font-sans selection:bg-primary/20 pb-12">
      {/* 1. Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-txt-primary sm:text-2xl font-sans">
            Account Settings
          </h1>
          <span className="rounded-full border border-line/80 bg-surface px-2.5 py-0.5 font-mono text-[11px] font-medium text-txt-muted">
            Profile Preferences
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-sm font-normal text-txt-secondary">
          Manage your account credentials, avatar picture, and account settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* 2. Avatar Card */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={settle}
          >
            <Card className="rounded-2xl border border-line/70 bg-surface p-6 shadow-2xs text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl border border-line/80 bg-primary/10 text-primary font-bold text-lg uppercase font-sans overflow-hidden">
                    {(profile?.name || "A").substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold text-txt-primary font-sans">
                        Profile Picture
                      </h2>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary shadow-2xs font-sans">
                        <Sparkles className="size-3" />
                        Coming Soon
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-txt-muted">
                      Custom avatar uploads and Gravatar support will be enabled in an upcoming release.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-line/80 bg-canvas/60 px-3.5 py-2 font-sans text-xs font-medium text-txt-muted cursor-not-allowed">
                    Avatar upload locked
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* 3. Name & Email Edit Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Username / Name Card */}
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...settle, delay: 0.05 }}
            >
              <Card className="h-full flex flex-col justify-between rounded-2xl border border-line/70 bg-surface p-6 shadow-2xs text-left">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-primary" />
                      <h2 className="text-sm font-bold text-txt-primary font-sans">Username</h2>
                    </div>
                    {profile?.nameChangeCooldown.canChange ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-status-paid-border bg-status-paid-bg px-2 py-0.5 text-[10px] font-medium text-status-paid">
                        <CheckCircle2 className="size-3" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-status-pending-border bg-status-pending-bg px-2 py-0.5 text-[10px] font-medium text-status-pending font-mono">
                        <Clock className="size-3" />
                        {profile?.nameChangeCooldown.remainingDays}d cooldown
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-txt-muted">
                    Your display name across Invoicify. Username can only be updated once every 2 months.
                  </p>

                  <form onSubmit={handleSaveName} className="mt-5 space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-txt-secondary">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!profile?.nameChangeCooldown.canChange || savingName}
                        placeholder="Enter full name"
                        className="mt-1 h-9.5 w-full rounded-xl border border-line/70 bg-canvas/60 px-3.5 text-xs text-txt-primary outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-txt-muted disabled:cursor-not-allowed disabled:opacity-60 font-sans"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!profile?.nameChangeCooldown.canChange || savingName || name.trim() === profile?.name}
                      className="w-full h-9.5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 active-press cursor-pointer disabled:cursor-not-allowed"
                    >
                      {savingName ? <Loader2 className="size-3.5 animate-spin mx-auto" /> : "Update Username"}
                    </Button>
                  </form>
                </div>
              </Card>
            </motion.div>

            {/* Email Card */}
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...settle, delay: 0.1 }}
            >
              <Card className="h-full flex flex-col justify-between rounded-2xl border border-line/70 bg-surface p-6 shadow-2xs text-left">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-primary" />
                      <h2 className="text-sm font-bold text-txt-primary font-sans">Email Address</h2>
                    </div>
                    {profile?.emailChangeCooldown.canChange ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-status-paid-border bg-status-paid-bg px-2 py-0.5 text-[10px] font-medium text-status-paid">
                        <CheckCircle2 className="size-3" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-status-pending-border bg-status-pending-bg px-2 py-0.5 text-[10px] font-medium text-status-pending font-mono">
                        <Clock className="size-3" />
                        {profile?.emailChangeCooldown.remainingDays}d cooldown
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-txt-muted">
                    Used for signing in and invoice dispatches. Can be changed once every 2 months.
                  </p>

                  <form onSubmit={handleSaveEmail} className="mt-5 space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-txt-secondary">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!profile?.emailChangeCooldown.canChange || savingEmail}
                        placeholder="you@domain.com"
                        className="mt-1 h-9.5 w-full rounded-xl border border-line/70 bg-canvas/60 px-3.5 text-xs text-txt-primary outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-txt-muted disabled:cursor-not-allowed disabled:opacity-60 font-sans"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!profile?.emailChangeCooldown.canChange || savingEmail || email.trim() === profile?.email}
                      className="w-full h-9.5 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 active-press cursor-pointer disabled:cursor-not-allowed"
                    >
                      {savingEmail ? <Loader2 className="size-3.5 animate-spin mx-auto" /> : "Update Email"}
                    </Button>
                  </form>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* 4. Danger Zone: Delete Account */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...settle, delay: 0.15 }}
          >
            <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 shadow-2xs text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-start gap-3.5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive">
                    <ShieldAlert className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-destructive font-sans">
                      Danger Zone: Delete Account
                    </h2>
                    <p className="mt-0.5 text-xs text-txt-muted max-w-lg">
                      Permanently delete your account, clients, time logs, and invoices. This action is irreversible.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  className="h-9.5 shrink-0 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-sans text-xs font-bold active-press transition-all cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  Delete Account
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl border border-line/80 bg-surface p-6 max-w-md text-left font-sans shadow-2xl">
          <AlertDialogHeader className="text-left">
            <div className="flex items-center gap-2.5 text-destructive mb-1">
              <AlertTriangle className="size-5" />
              <AlertDialogTitle className="text-base font-bold font-sans">
                Confirm Account Deletion
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-txt-secondary leading-relaxed">
              Are you sure you want to delete your account? All of your clients, time logs, and invoices will be permanently erased.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4 space-y-2">
            <label className="text-[11px] font-semibold text-txt-secondary">
              Type <span className="font-mono font-bold text-destructive">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="h-9.5 w-full rounded-xl border border-line/70 bg-canvas px-3 text-xs font-mono text-txt-primary outline-none focus:border-destructive/60 focus:ring-2 focus:ring-destructive/20 placeholder:text-txt-muted"
            />
          </div>

          <AlertDialogFooter className="flex flex-row justify-end gap-2">
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText("");
              }}
              className="h-9 rounded-xl border border-line/70 bg-surface px-4 text-xs font-semibold text-txt-primary hover:bg-surface-hover"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== "DELETE" || deletingAccount}
              onClick={handleDeleteAccount}
              className="h-9 rounded-xl bg-destructive text-white text-xs font-bold hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingAccount ? <Loader2 className="size-3.5 animate-spin mx-auto" /> : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
