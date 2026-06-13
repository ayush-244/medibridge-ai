import { useEffect, useMemo, useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import {
  BED_TYPES,
  RESERVATION_STATUSES,
  type BedType,
  type ReservationStatus,
} from "@/lib/constants";
import { useReservations } from "@/features/reservations/hooks/useReservations";
import { useReservationDetail } from "@/features/reservations/hooks/useReservationDetail";
import { useCountdownTick } from "@/features/reservations/hooks/useCountdownTick";
import { ReservationSummaryCards } from "@/features/reservations/components/ReservationSummaryCards";
import { ReservationTable } from "@/features/reservations/components/ReservationTable";
import { ReservationDetailDrawer } from "@/features/reservations/components/ReservationDetailDrawer";
import { ReservationTableSkeleton } from "@/features/reservations/components/ReservationTableSkeleton";
import {
  computeSummary,
  filterReservations,
  getUniqueHospitals,
  sortByExpiry,
} from "@/features/reservations/utils/reservationUtils";
import type { Reservation } from "@/features/reservations/types/reservation.types";

export function ReservationsView() {
  const { reservations, isLoading, error, refetch } = useReservations();
  const {
    reservation: selectedReservation,
    isLoading: detailLoading,
    fetchReservation,
    clearReservation,
  } = useReservationDetail();

  const now = useCountdownTick();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">(
    "ALL",
  );
  const [bedTypeFilter, setBedTypeFilter] = useState<BedType | "ALL">("ALL");
  const [hospitalFilter, setHospitalFilter] = useState("ALL");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const hospitals = useMemo(
    () => getUniqueHospitals(reservations),
    [reservations],
  );

  const filtered = useMemo(() => {
    const result = filterReservations(reservations, {
      search: debouncedSearch,
      status: statusFilter,
      bedType: bedTypeFilter,
      hospital: hospitalFilter,
    });
    return sortByExpiry(result);
  }, [
    reservations,
    debouncedSearch,
    statusFilter,
    bedTypeFilter,
    hospitalFilter,
  ]);

  const summary = useMemo(() => computeSummary(reservations), [reservations]);

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
  }, [debouncedSearch, statusFilter, bedTypeFilter, hospitalFilter, resetPage]);

  const handleSelect = async (reservation: Reservation) => {
    setDrawerOpen(true);
    await fetchReservation(reservation._id);
  };

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) clearReservation();
  };

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Reservations"
          description="Manage active and historical bed reservations"
        />
        <EmptyState
          title="Failed to load reservations"
          description={error}
          icon={<CalendarClock className="h-6 w-6" />}
          action={
            <Button onClick={refetch} className="gap-2">
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
        title="Reservations"
        description="Manage active and historical bed reservations"
        action={
          <Button
            variant="secondary"
            size="sm"
            className="gap-2"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <ReservationSummaryCards summary={summary} loading={isLoading} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search patients, doctors, hospitals..."
          className="flex-1 lg:max-w-sm"
        />
        <FilterBar
          filters={[
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              onChange: (v) =>
                setStatusFilter(v as ReservationStatus | "ALL"),
              options: [
                { label: "All Statuses", value: "ALL" },
                ...RESERVATION_STATUSES.map((s) => ({
                  label: s.charAt(0) + s.slice(1).toLowerCase(),
                  value: s,
                })),
              ],
            },
            {
              id: "bedType",
              label: "Bed Type",
              value: bedTypeFilter,
              onChange: (v) => setBedTypeFilter(v as BedType | "ALL"),
              options: [
                { label: "All Types", value: "ALL" },
                ...BED_TYPES.map((t) => ({
                  label: t === "ICU" ? "ICU" : "General",
                  value: t,
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
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <ReservationTableSkeleton />
      ) : reservations.length === 0 ? (
        <EmptyState
          title="No reservations yet"
          description="Bed reservations will appear here when referrals are accepted."
          icon={<CalendarClock className="h-6 w-6" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching reservations"
          description="Try adjusting your search or filters."
          icon={<CalendarClock className="h-6 w-6" />}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setBedTypeFilter("ALL");
                setHospitalFilter("ALL");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <ReservationTable
            reservations={paginatedItems}
            now={now}
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
      )}

      <ReservationDetailDrawer
        reservation={selectedReservation}
        isLoading={detailLoading}
        now={now}
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
      />
    </div>
  );
}
