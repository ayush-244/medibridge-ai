import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorAvatar } from "@/components/common/DoctorAvatar";
import { UserAvatar } from "@/components/common/UserAvatar";
import { UserStatusBadge } from "@/features/users/components/UserStatusBadge";
import {
  formatRoleLabel,
  formatUserDate,
  getHospitalName,
  getUserStatus,
} from "@/features/users/utils/userUtils";
import type { UserDetail } from "@/features/users/types/user.types";

interface UserDetailDialogProps {
  user: UserDetail | null;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-right text-sm font-medium text-text-primary">
        {value}
      </span>
    </div>
  );
}

export function UserDetailDialog({
  user,
  isLoading,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {isLoading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        ) : user ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <UserAvatar user={user} size="xl" />
                <div>
                  <DialogTitle>{user.name}</DialogTitle>
                  <DialogDescription>{user.email}</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="divide-y divide-border rounded-lg border border-border px-4">
              <DetailRow
                label="Role"
                value={formatRoleLabel(user.role)}
              />
              <DetailRow
                label="Hospital"
                value={getHospitalName(user.hospital)}
              />
              <DetailRow
                label="Status"
                value={<UserStatusBadge status={getUserStatus(user)} />}
              />
              <DetailRow
                label="Created"
                value={formatUserDate(user.createdAt)}
              />
              {user.doctorProfile && (
                <>
                  <DetailRow
                    label="Doctor Photo"
                    value={
                      <DoctorAvatar doctor={user.doctorProfile} size="sm" />
                    }
                  />
                  <DetailRow
                    label="Specialization"
                    value={user.doctorProfile.specialization}
                  />
                  <DetailRow
                    label="Experience"
                    value={
                      user.doctorProfile.experience != null
                        ? `${user.doctorProfile.experience} years`
                        : "—"
                    }
                  />
                </>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
