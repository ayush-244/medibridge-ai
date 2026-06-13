import { useMemo, useState } from "react";
import { RefreshCw, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { DOCTOR_STATUSES } from "@/lib/constants";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import { DoctorCard } from "@/features/doctors/components/DoctorCard";
import { DoctorDetailDialog } from "@/features/doctors/components/DoctorDetailDialog";
import { DoctorsSkeleton } from "@/features/doctors/components/DoctorsSkeleton";
import {
  filterDoctors,
  getUniqueSpecializations,
} from "@/features/doctors/utils/doctorUtils";
import type { Doctor } from "@/features/doctors/types/doctor.types";
import type { DoctorStatus } from "@/lib/constants";

export function DoctorsView() {
  const { doctors, isLoading, error, refetch } = useDoctors();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DoctorStatus | "ALL">("ALL");
  const [specializationFilter, setSpecializationFilter] = useState("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  const specializations = useMemo(
    () => getUniqueSpecializations(doctors),
    [doctors],
  );

  const filtered = useMemo(
    () =>
      filterDoctors(doctors, {
        search: debouncedSearch,
        status: statusFilter,
        specialization: specializationFilter,
      }),
    [doctors, debouncedSearch, statusFilter, specializationFilter],
  );

  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setDialogOpen(true);
  };

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Doctor Directory"
          description="View physician availability, specialization, and patient load."
        />
        <EmptyState
          title="Failed to load doctors"
          description={error}
          icon={<Stethoscope className="h-6 w-6" />}
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
        title="Doctor Directory"
        description="View physician availability, specialization, and patient load."
        action={
          <p className="text-sm text-text-secondary">
            {isLoading ? "Loading..." : `${filtered.length} doctors`}
          </p>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name, specialization, or hospital..."
          className="flex-1 lg:max-w-md"
        />
        <FilterBar
          filters={[
            {
              id: "status-filter",
              label: "Status",
              value: statusFilter,
              onChange: (v) => setStatusFilter(v as DoctorStatus | "ALL"),
              options: [
                { label: "All Statuses", value: "ALL" },
                ...DOCTOR_STATUSES.map((s) => ({
                  label: s.replace(/_/g, " "),
                  value: s,
                })),
              ],
            },
            {
              id: "specialization-filter",
              label: "Specialization",
              value: specializationFilter,
              onChange: setSpecializationFilter,
              options: [
                { label: "All Specializations", value: "ALL" },
                ...specializations.map((s) => ({ label: s, value: s })),
              ],
            },
          ]}
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <DoctorsSkeleton />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description="No doctors have been registered in the system yet."
          icon={<Stethoscope className="h-6 w-6" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching doctors"
          description="Try adjusting your search or filters to find physicians."
          icon={<Stethoscope className="h-6 w-6" />}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setSpecializationFilter("ALL");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doctor) => (
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      <DoctorDetailDialog
        doctor={selectedDoctor}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
