import { useMemo, useState } from "react";
import { Building2, Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useHospitals } from "@/features/hospitals/hooks/useHospitals";
import { useHospitalDetail } from "@/features/hospitals/hooks/useHospitalDetail";
import { HospitalCard } from "@/features/hospitals/components/HospitalCard";
import { HospitalDetailSheet } from "@/features/hospitals/components/HospitalDetailSheet";
import { CreateHospitalDialog } from "@/features/hospitals/components/CreateHospitalDialog";
import { EditHospitalDialog } from "@/features/hospitals/components/EditHospitalDialog";
import { UpdateBedsDialog } from "@/features/hospitals/components/UpdateBedsDialog";
import { HospitalsSkeleton } from "@/features/hospitals/components/HospitalsSkeleton";
import { filterHospitals } from "@/features/hospitals/utils/hospitalUtils";
import type { Hospital } from "@/features/hospitals/types/hospital.types";

export function HospitalsView() {
  const { hospitals, isLoading, error, refetch } = useHospitals();
  const { hospital: selectedHospital, isLoading: detailLoading, fetchHospital, clearHospital } =
    useHospitalDetail();

  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [bedsOpen, setBedsOpen] = useState(false);
  const [actionHospital, setActionHospital] = useState<Hospital | null>(null);
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(
    () => filterHospitals(hospitals, debouncedSearch),
    [hospitals, debouncedSearch],
  );

  const handleViewDetails = async (hospital: Hospital) => {
    setSheetOpen(true);
    await fetchHospital(hospital._id);
  };

  const handleSheetChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) clearHospital();
  };

  const handleEdit = (hospital: Hospital) => {
    setActionHospital(hospital);
    setEditOpen(true);
  };

  const handleUpdateBeds = (hospital: Hospital) => {
    setActionHospital(hospital);
    setBedsOpen(true);
  };

  const handleMutationSuccess = async () => {
    await refetch({ silent: true });
    if (selectedHospital) {
      await fetchHospital(selectedHospital._id);
    }
  };

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Hospital Directory"
          description="Browse hospital capacity and resources across the network."
        />
        <EmptyState
          title="Failed to load hospitals"
          description={error}
          icon={<Building2 className="h-6 w-6" />}
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
        title="Hospital Directory"
        description="Browse hospital capacity and resources across the network."
        action={
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Hospital
          </Button>
        }
      />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, city, or state..."
        className="max-w-md"
      />

      {isLoading ? (
        <HospitalsSkeleton />
      ) : hospitals.length === 0 ? (
        <EmptyState
          title="No hospitals found"
          description="Create your first hospital to get started."
          icon={<Building2 className="h-6 w-6" />}
          action={
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Hospital
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching hospitals"
          description="Try adjusting your search terms to find what you're looking for."
          icon={<Building2 className="h-6 w-6" />}
          action={
            <Button variant="secondary" onClick={() => setSearch("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((hospital) => (
            <HospitalCard
              key={hospital._id}
              hospital={hospital}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onUpdateBeds={handleUpdateBeds}
            />
          ))}
        </div>
      )}

      <HospitalDetailSheet
        hospital={selectedHospital}
        isLoading={detailLoading}
        open={sheetOpen}
        onOpenChange={handleSheetChange}
        onEdit={selectedHospital ? () => handleEdit(selectedHospital) : undefined}
        onUpdateBeds={
          selectedHospital ? () => handleUpdateBeds(selectedHospital) : undefined
        }
      />

      <CreateHospitalDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleMutationSuccess}
      />

      <EditHospitalDialog
        hospital={actionHospital}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleMutationSuccess}
      />

      <UpdateBedsDialog
        hospital={actionHospital}
        open={bedsOpen}
        onOpenChange={setBedsOpen}
        onSuccess={handleMutationSuccess}
      />
    </div>
  );
}
