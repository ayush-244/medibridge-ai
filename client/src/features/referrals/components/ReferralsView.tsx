import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText, Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { REFERRAL_STATUSES, type ReferralStatus } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";
import { useReferrals } from "@/features/referrals/hooks/useReferrals";
import { useReferralView } from "@/features/referrals/hooks/useReferralView";
import { ReferralViewSwitcher } from "@/features/referrals/components/ReferralViewSwitcher";
import { ReferralTable } from "@/features/referrals/components/ReferralTable";
import { ReferralKanban } from "@/features/referrals/components/ReferralKanban";
import { ReferralDetailDrawer } from "@/features/referrals/components/ReferralDetailDrawer";
import { ReferralConfirmDialog } from "@/features/referrals/components/ReferralConfirmDialog";
import { CreateReferralDialog } from "@/features/referrals/components/CreateReferralDialog";
import { ReferralTableSkeleton } from "@/features/referrals/components/ReferralTableSkeleton";
import { ReferralKanbanSkeleton } from "@/features/referrals/components/ReferralKanbanSkeleton";
import {
  filterByDirection,
  filterReferrals,
  getUniqueHospitals,
  sortReferrals,
  canCreateReferral,
} from "@/features/referrals/utils/referralUtils";
import type {
  Referral,
  ReferralAction,
  ReferralDirection,
  ReferralSortField,
  SortDirection,
} from "@/features/referrals/types/referral.types";

function getDirectionFromPath(pathname: string): ReferralDirection {
  if (pathname === ROUTES.REFERRALS_INBOUND) return "inbound";
  if (pathname === ROUTES.REFERRALS_OUTBOUND) return "outbound";
  return "all";
}

export function ReferralsView() {
  const { user } = useAuth();
  const location = useLocation();
  const direction = getDirectionFromPath(location.pathname);

  const {
    referrals,
    isLoading,
    error,
    actionLoading,
    refetch,
    performAction,
  } = useReferrals();
  const { viewMode, setViewMode } = useReferralView();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | "ALL">(
    "ALL",
  );
  const [hospitalFilter, setHospitalFilter] = useState("ALL");
  const [sortField, setSortField] = useState<ReferralSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ReferralAction | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const showCreateReferral = canCreateReferral(user?.role);

  const debouncedSearch = useDebounce(search);

  const directionFiltered = useMemo(
    () => filterByDirection(referrals, direction, user?.hospital),
    [referrals, direction, user?.hospital],
  );

  const hospitals = useMemo(
    () => getUniqueHospitals(directionFiltered),
    [directionFiltered],
  );

  const filtered = useMemo(() => {
    const result = filterReferrals(directionFiltered, {
      search: debouncedSearch,
      status: statusFilter,
      hospital: hospitalFilter,
    });
    return sortReferrals(result, sortField, sortDirection);
  }, [
    directionFiltered,
    debouncedSearch,
    statusFilter,
    hospitalFilter,
    sortField,
    sortDirection,
  ]);

  const {
    paginatedItems,
    page,
    totalPages,
    totalItems,
    goToPage,
    resetPage,
    hasNext,
    hasPrev,
  } = usePagination(filtered, 10);

  useEffect(() => {
    resetPage();
  }, [debouncedSearch, statusFilter, hospitalFilter, direction, resetPage]);

  const handleSort = useCallback(
    (field: ReferralSortField) => {
      if (sortField === field) {
        setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField],
  );

  const handleSelect = (referral: Referral) => {
    setSelectedReferral(referral);
    setDrawerOpen(true);
  };

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedReferral(null);
  };

  const handleActionRequest = (action: ReferralAction) => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedReferral || !confirmAction) return;

    const success = await performAction(
      selectedReferral._id,
      confirmAction,
    );

    if (success) {
      setConfirmOpen(false);
      setConfirmAction(null);
      setDrawerOpen(false);
      setSelectedReferral(null);
    }
  };

  const subtitle =
    direction === "inbound"
      ? "Inbound referrals to your hospital"
      : direction === "outbound"
        ? "Outbound referrals from your hospital"
        : "Manage patient referral workflow";

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader title="Referrals" description={subtitle} />
        <EmptyState
          title="Failed to load referrals"
          description={error}
          icon={<FileText className="h-6 w-6" />}
          action={
            <Button onClick={() => void refetch()} className="gap-2">
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
        title="Referrals"
        description={subtitle}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => void refetch()}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {showCreateReferral && (
              <Button
                size="sm"
                className="gap-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                New Referral
              </Button>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search patients, conditions, hospitals..."
            className="sm:max-w-xs"
          />
          <FilterBar
            filters={[
              {
                id: "status",
                label: "Status",
                value: statusFilter,
                onChange: (v) => setStatusFilter(v as ReferralStatus | "ALL"),
                options: [
                  { label: "All Statuses", value: "ALL" },
                  ...REFERRAL_STATUSES.map((s) => ({
                    label: s.charAt(0) + s.slice(1).toLowerCase(),
                    value: s,
                  })),
                ],
              },
              {
                id: "hospital",
                label: "Hospital",
                value: hospitalFilter,
                onChange: setHospitalFilter,
                options: [
                  { label: "All Hospitals", value: "ALL" },
                  ...hospitals.map((h) => ({ label: h, value: h })),
                ],
              },
            ]}
          />
        </div>
        <ReferralViewSwitcher viewMode={viewMode} onChange={setViewMode} />
      </div>

      {isLoading ? (
        viewMode === "table" ? (
          <ReferralTableSkeleton />
        ) : (
          <ReferralKanbanSkeleton />
        )
      ) : referrals.length === 0 ? (
        <EmptyState
          title="No referrals yet"
          description="Patient referrals will appear here once they are created in the system."
          icon={<FileText className="h-6 w-6" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching referrals"
          description="Try adjusting your search or filters to find referrals."
          icon={<FileText className="h-6 w-6" />}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setHospitalFilter("ALL");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : viewMode === "table" ? (
        <>
          <ReferralTable
            referrals={paginatedItems}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onSelect={handleSelect}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Showing {(page - 1) * 10 + 1}–
                {Math.min(page * 10, totalItems)} of {totalItems}
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
      ) : (
        <ReferralKanban referrals={filtered} onSelect={handleSelect} />
      )}

      <ReferralDetailDrawer
        referral={selectedReferral}
        open={drawerOpen}
        actionLoading={actionLoading}
        onOpenChange={handleDrawerChange}
        onAction={handleActionRequest}
      />

      <ReferralConfirmDialog
        open={confirmOpen}
        action={confirmAction}
        patientName={selectedReferral?.patientName}
        isLoading={actionLoading !== null}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
        }}
      />

      <CreateReferralDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => void refetch({ silent: true })}
      />
    </div>
  );
}
