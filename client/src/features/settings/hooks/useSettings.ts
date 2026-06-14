import { useCallback, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import type {
  AuthUser,
  ChangePasswordPayload,
  NotificationPreferences,
  UpdateProfilePayload,
} from "@/types/auth";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

const defaultPreferences: NotificationPreferences = {
  referralAccepted: true,
  doctorAssigned: true,
  bedReserved: true,
  reservationExpired: true,
};

export function useSettings() {
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message || "Failed to load profile",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile(payload);
      setProfile(updated);
      showSuccessToast("Profile updated");
      return updated;
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message || "Failed to update profile",
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    setIsSaving(true);
    try {
      await authService.changePassword(payload);
      showSuccessToast("Password changed successfully");
      return true;
    } catch (err) {
      showErrorToast(
        (err as { message?: string })?.message || "Failed to change password",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      setIsSaving(true);
      try {
        const updated = await authService.updateNotificationPreferences(prefs);
        setProfile((prev) =>
          prev
            ? { ...prev, notificationPreferences: updated }
            : prev,
        );
        showSuccessToast("Notification preferences saved");
        return updated;
      } catch (err) {
        showErrorToast(
          (err as { message?: string })?.message ||
            "Failed to update preferences",
        );
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const preferences =
    profile?.notificationPreferences ?? defaultPreferences;

  return {
    profile,
    preferences,
    isLoading,
    isSaving,
    updateProfile,
    changePassword,
    updatePreferences,
    refetch: fetchProfile,
  };
}
