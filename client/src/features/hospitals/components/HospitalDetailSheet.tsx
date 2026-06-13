import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { HospitalStatusBadge } from "@/components/common/StatusBadge";
import {
  getBedOccupancyRate,
  getHospitalCapacityStatus,
  getIcuOccupancyRate,
} from "@/features/hospitals/utils/hospitalUtils";
import type { Hospital } from "@/features/hospitals/types/hospital.types";

interface DetailRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function DetailRow({ label, value, highlight }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={
          highlight
            ? "text-sm font-semibold text-primary"
            : "text-sm font-medium text-text-primary"
        }
      >
        {value}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-text-primary">{title}</h4>
      <div className="divide-y divide-border rounded-lg border border-border px-4">
        {children}
      </div>
    </div>
  );
}

interface HospitalDetailSheetProps {
  hospital: Hospital | null;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HospitalDetailSheet({
  hospital,
  isLoading,
  open,
  onOpenChange,
}: HospitalDetailSheetProps) {
  const status = hospital ? getHospitalCapacityStatus(hospital) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : hospital ? (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3 pr-8">
                <div>
                  <SheetTitle>{hospital.name}</SheetTitle>
                  <SheetDescription>
                    {hospital.city}, {hospital.state}
                  </SheetDescription>
                </div>
                {status && <HospitalStatusBadge status={status} />}
              </div>
            </SheetHeader>

            <SheetBody className="space-y-6">
              <DetailSection title="Hospital Information">
                <DetailRow label="Address" value={hospital.address} />
                <DetailRow
                  label="Location"
                  value={`${hospital.city}, ${hospital.state}`}
                />
                <DetailRow
                  label="Coordinates"
                  value={
                    hospital.location?.latitude != null
                      ? `${hospital.location.latitude}, ${hospital.location.longitude}`
                      : "Not configured"
                  }
                />
              </DetailSection>

              <DetailSection title="Capacity Information">
                <DetailRow
                  label="Total Beds"
                  value={hospital.totalBeds}
                />
                <DetailRow
                  label="Available Beds"
                  value={hospital.availableBeds}
                  highlight
                />
                <DetailRow
                  label="Total ICU Beds"
                  value={hospital.totalICUBeds}
                />
                <DetailRow
                  label="Available ICU Beds"
                  value={hospital.availableICUBeds}
                  highlight
                />
              </DetailSection>

              <DetailSection title="Operational Metrics">
                <DetailRow
                  label="Bed Occupancy"
                  value={getBedOccupancyRate(hospital)}
                  highlight
                />
                <DetailRow
                  label="ICU Occupancy"
                  value={getIcuOccupancyRate(hospital)}
                />
                <DetailRow
                  label="General Availability"
                  value={`${hospital.availableBeds} / ${hospital.totalBeds}`}
                />
              </DetailSection>

              <DetailSection title="Available Resources">
                <DetailRow
                  label="Registered Doctors"
                  value={hospital.doctors?.length ?? 0}
                  highlight
                />
                <DetailRow
                  label="ICU Availability"
                  value={`${hospital.availableICUBeds} beds free`}
                />
              </DetailSection>
            </SheetBody>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
