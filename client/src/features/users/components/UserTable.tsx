import { Eye, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { UserStatusBadge } from "@/features/users/components/UserStatusBadge";
import {
  formatRoleLabel,
  formatUserDate,
  getHospitalName,
  getUserStatus,
} from "@/features/users/utils/userUtils";
import type { User } from "@/features/users/types/user.types";

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onDeactivate: (user: User) => void;
  actionLoading?: string | null;
}

export function UserTable({
  users,
  onView,
  onDeactivate,
  actionLoading,
}: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="max-h-[calc(100vh-320px)] overflow-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 z-10 border-b border-border bg-gray-50/95 backdrop-blur-sm">
            <tr>
              {[
                "User",
                "Email",
                "Role",
                "Hospital",
                "Status",
                "Created",
                "Actions",
              ].map(
                (label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary"
                  >
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const status = getUserStatus(user);
              const isDeactivated = status === "DEACTIVATED";

              return (
                <tr
                  key={user._id}
                  className="border-b border-border last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size="sm" />
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatRoleLabel(user.role)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {getHospitalName(user.hospital)}
                  </td>
                  <td className="px-4 py-3">
                    <UserStatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatUserDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => onView(user)}
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      {!isDeactivated && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-danger hover:text-danger"
                          disabled={actionLoading === user._id}
                          onClick={() => onDeactivate(user)}
                        >
                          <UserX className="h-4 w-4" />
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
