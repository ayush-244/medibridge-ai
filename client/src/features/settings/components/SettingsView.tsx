import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/common/PageHeader";
import { useSettings } from "@/features/settings/hooks/useSettings";
import type { NotificationPreferences } from "@/types/auth";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-gray-200"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsView() {
  const {
    profile,
    preferences,
    isLoading,
    isSaving,
    updateProfile,
    changePassword,
    updatePreferences,
  } = useSettings();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile && !initialized) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
      setInitialized(true);
    }
  }, [profile, initialized]);

  const handleProfileSave = async () => {
    await updateProfile({ name: name.trim(), phone: phone.trim() });
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) return;
    if (newPassword !== confirmPassword) return;
    const success = await changePassword({ currentPassword, newPassword });
    if (success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handlePrefToggle = async (
    key: keyof NotificationPreferences,
    value: boolean,
  ) => {
    await updatePreferences({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader title="Settings" description="Account and preferences" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-lg border border-border bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile, security, and notification preferences."
      />

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-text-primary">Profile</h3>
          <p className="text-sm text-text-secondary">
            Update your personal information.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={profile?.email || ""} disabled />
            </div>
          </div>
          <div className="space-y-2 sm:max-w-xs">
            <label className="text-sm font-medium">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={() => void handleProfileSave()} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-text-primary">Security</h3>
          <p className="text-sm text-text-secondary">Change your password.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 sm:max-w-md">
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={() => void handlePasswordChange()}
            disabled={
              isSaving ||
              !currentPassword ||
              newPassword.length < 6 ||
              newPassword !== confirmPassword
            }
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-text-primary">
            Notification Preferences
          </h3>
          <p className="text-sm text-text-secondary">
            Choose which events trigger realtime alerts.
          </p>
        </CardHeader>
        <CardContent>
          <ToggleRow
            label="Referral Accepted"
            description="When a referral is accepted by a hospital"
            checked={preferences.referralAccepted}
            onChange={(v) => void handlePrefToggle("referralAccepted", v)}
            disabled={isSaving}
          />
          <Separator />
          <ToggleRow
            label="Doctor Assigned"
            description="When a doctor is assigned to a referral"
            checked={preferences.doctorAssigned}
            onChange={(v) => void handlePrefToggle("doctorAssigned", v)}
            disabled={isSaving}
          />
          <Separator />
          <ToggleRow
            label="Bed Reserved"
            description="When a bed reservation is created"
            checked={preferences.bedReserved}
            onChange={(v) => void handlePrefToggle("bedReserved", v)}
            disabled={isSaving}
          />
          <Separator />
          <ToggleRow
            label="Reservation Expired"
            description="When a bed reservation expires"
            checked={preferences.reservationExpired}
            onChange={(v) => void handlePrefToggle("reservationExpired", v)}
            disabled={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
