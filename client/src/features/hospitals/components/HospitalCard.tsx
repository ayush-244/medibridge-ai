import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceCard, ResourceMetric } from "@/components/common/ResourceCard";
import { HospitalStatusBadge } from "@/components/common/StatusBadge";
import { HospitalAvatar } from "@/components/common/HospitalAvatar";
import { getHospitalCapacityStatus } from "@/features/hospitals/utils/hospitalUtils";
import type { Hospital } from "@/features/hospitals/types/hospital.types";

interface HospitalCardProps {
  hospital: Hospital;
  onViewDetails: (hospital: Hospital) => void;
  onEdit?: (hospital: Hospital) => void;
  onUpdateBeds?: (hospital: Hospital) => void;
}

export function HospitalCard({
  hospital,
  onViewDetails,
  onEdit,
  onUpdateBeds,
}: HospitalCardProps) {
  const status = getHospitalCapacityStatus(hospital);
  const doctorCount = hospital.doctors?.length ?? 0;

  return (
    <ResourceCard>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <HospitalAvatar hospital={hospital} size="md" />
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-text-primary">
                  {hospital.name}
                </h3>
                <p className="flex items-center gap-1 text-xs text-text-secondary">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {hospital.city}, {hospital.state}
                </p>
              </div>
            </div>
          </div>
          <HospitalStatusBadge status={status} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ResourceMetric
            label="Available Beds"
            value={hospital.availableBeds}
            highlight
          />
          <ResourceMetric
            label="ICU Beds"
            value={hospital.availableICUBeds}
          />
          <ResourceMetric label="Total Beds" value={hospital.totalBeds} />
          <ResourceMetric label="Doctors" value={doctorCount} />
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 gap-2"
            onClick={() => onViewDetails(hospital)}
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(hospital)}>
              Edit
            </Button>
          )}
          {onUpdateBeds && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateBeds(hospital)}
            >
              Beds
            </Button>
          )}
        </div>
      </div>
    </ResourceCard>
  );
}
