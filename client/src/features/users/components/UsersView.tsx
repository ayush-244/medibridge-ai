import { useMemo, useState } from "react";
import { Plus, RefreshCw, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useAuth } from "@/hooks/useAuth";
import { MANAGEABLE_ROLES, ROLES, type UserRole } from "@/lib/constants";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useUserDetail } from "@/features/users/hooks/useUserDetail";
import { useDeactivateUser } from "@/features/users/hooks/useDeactivateUser";
import { UserTable } from "@/features/users/components/UserTable";
import { CreateUserDialog } from "@/features/users/components/CreateUserDialog";
import { UserDetailDialog } from "@/features/users/components/UserDetailDialog";
import { UsersSkeleton } from "@/features/users/components/UsersSkeleton";
import { filterUsers } from "@/features/users/utils/userUtils";
import { PendingUsersPanel } from "@/features/admin/components/PendingUsersPanel";
import type { User } from "@/features/users/types/user.types";

export function UsersView() {
  const { user } = useAuth();
  const { users, isLoading, error, refetch } = useUsers();
  const { user: selectedUser, isLoading: detailLoading, fetchUser, clearUser } =
    useUserDetail();
  const { isDeactivating, deactivateUser } = useDeactivateUser();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(
    () => filterUsers(users, { search: debouncedSearch, role: roleFilter }),
    [users, debouncedSearch, roleFilter],
  );

  const { paginatedItems, page, totalPages, goToPage, hasNext, hasPrev, resetPage } =
    usePagination(filtered, 10);

  const handleView = async (user: User) => {
    setDetailOpen(true);
    await fetchUser(user._id);
  };

  const handleDetailClose = (open: boolean) => {
    setDetailOpen(open);
    if (!open) clearUser();
  };

  const handleDeactivate = async (user: User) => {
    if (!window.confirm(`Deactivate ${user.name}? This cannot be undone.`)) {
      return;
    }
    setActionLoading(user._id);
    const success = await deactivateUser(user._id, user.name);
    if (success) await refetch({ silent: true });
    setActionLoading(null);
  };

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="User Management"
          description="Manage hospital staff and system users."
        />
        <EmptyState
          title="Failed to load users"
          description={error}
          icon={<Users className="h-6 w-6" />}
          action={
            <Button onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="User Management"
        description="Manage hospital staff and system users."
        action={
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        }
      />

      {user?.role === ROLES.SUPER_ADMIN && <PendingUsersPanel />}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            resetPage();
          }}
          placeholder="Search by name, email, or hospital..."
          className="flex-1 lg:max-w-md"
        />
        <FilterBar
          filters={[
            {
              id: "role-filter",
              label: "Role",
              value: roleFilter,
              onChange: (v) => {
                setRoleFilter(v as UserRole | "ALL");
                resetPage();
              },
              options: [
                { label: "All Roles", value: "ALL" },
                ...MANAGEABLE_ROLES.map((r) => ({
                  label: r.replace(/_/g, " "),
                  value: r,
                })),
                { label: "Hospital Admin", value: ROLES.HOSPITAL_ADMIN },
              ],
            },
          ]}
        />
      </div>

      {isLoading ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Create your first user to get started."
          icon={<Users className="h-6 w-6" />}
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching users"
          description="Try adjusting your search or filters."
          icon={<Users className="h-6 w-6" />}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
                resetPage();
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <UserTable
            users={paginatedItems}
            onView={handleView}
            onDeactivate={handleDeactivate}
            actionLoading={isDeactivating ? actionLoading : null}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Page {page} of {totalPages} ({filtered.length} users)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => refetch({ silent: true })}
      />

      <UserDetailDialog
        user={selectedUser}
        isLoading={detailLoading}
        open={detailOpen}
        onOpenChange={handleDetailClose}
      />
    </div>
  );
}
