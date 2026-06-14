import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { HospitalStatusBadge } from "@/components/common/StatusBadge";
import { HospitalAvatar } from "@/components/common/HospitalAvatar";
import { HospitalAnalyticsTab } from "@/features/hospitals/components/HospitalAnalyticsTab";
import { HospitalDoctorsTab } from "@/features/hospitals/components/HospitalDoctorsTab";
import { HospitalLocationMap } from "@/features/maps/components/HospitalLocationMap";
import {
  getBedOccupancyRate,
  getHospitalCapacityStatus,
  getIcuOccupancyRate,
} from "@/features/hospitals/utils/hospitalUtils";
import type { Hospital } from "@/features/hospitals/types/hospital.types";
import { cn } from "@/lib/utils";

type HospitalDetailTab = "overview" | "location" | "doctors" | "analytics";

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

const TABS: { id: HospitalDetailTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "location", label: "Location" },
  { id: "doctors", label: "Doctors" },
  { id: "analytics", label: "Analytics" },
];

interface HospitalDetailSheetProps {
  hospital: Hospital | null;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onUpdateBeds?: () => void;
}

export function HospitalDetailSheet({
  hospital,
  isLoading,
  open,
  onOpenChange,
  onEdit,
  onUpdateBeds,
}: HospitalDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<HospitalDetailTab>("overview");
  const status = hospital ? getHospitalCapacityStatus(hospital) : null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActiveTab("overview");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : hospital ? (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-3 pr-8">
                <div className="flex items-start gap-3">
                  <HospitalAvatar hospital={hospital} size="lg" />
                  <div>
                    <SheetTitle>{hospital.name}</SheetTitle>
                    <SheetDescription>
                      {hospital.city}, {hospital.state}
                    </SheetDescription>
                  </div>
                </div>
                {status && <HospitalStatusBadge status={status} />}
              </div>
            </SheetHeader>

            <div className="mt-4 flex gap-1 border-b border-border px-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <SheetBody className="space-y-6">
              {activeTab === "overview" && (
                <>
                  <DetailSection title="Hospital Information">
                    <DetailRow label="Address" value={hospital.address} />
                    <DetailRow
                      label="Location"
                      value={`${hospital.city}, ${hospital.state}`}
                    />
                    {hospital.contactNumber && (
                      <DetailRow label="Contact" value={hospital.contactNumber} />
                    )}
                    {hospital.email && (
                      <DetailRow label="Email" value={hospital.email} />
                    )}
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
                    <DetailRow label="Total Beds" value={hospital.totalBeds} />
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
                </>
              )}

              {activeTab === "location" && (
                <HospitalLocationMap
                  name={hospital.name}
                  location={hospital.location}
                  className="h-[320px]"
                />
              )}

              {activeTab === "doctors" && (
                <HospitalDoctorsTab hospitalId={hospital._id} />
              )}

              {activeTab === "analytics" && (
                <HospitalAnalyticsTab hospitalId={hospital._id} />
              )}
            </SheetBody>

            {(onEdit || onUpdateBeds) && activeTab === "overview" && (
              <div className="border-t border-border p-6 flex gap-2">
                {onEdit && (
                  <Button className="flex-1" onClick={onEdit}>
                    Edit Hospital
                  </Button>
                )}
                {onUpdateBeds && (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onUpdateBeds}
                  >
                    Update Beds
                  </Button>
                )}
              </div>
            )}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
