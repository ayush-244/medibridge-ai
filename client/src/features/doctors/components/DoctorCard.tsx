import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceCard, ResourceMetric } from "@/components/common/ResourceCard";
import { DoctorStatusBadge } from "@/components/common/StatusBadge";
import { DoctorAvatar } from "@/components/common/DoctorAvatar";
import {
  getDoctorHospitalCity,
  getDoctorHospitalName,
  getDoctorUtilization,
} from "@/features/doctors/utils/doctorUtils";
import type { Doctor } from "@/features/doctors/types/doctor.types";

interface DoctorCardProps {
  doctor: Doctor;
  onViewDetails: (doctor: Doctor) => void;
  onEdit?: (doctor: Doctor) => void;
  onToggleAvailability?: (doctor: Doctor) => void;
}

export function DoctorCard({
  doctor,
  onViewDetails,
  onEdit,
  onToggleAvailability,
}: DoctorCardProps) {
  const utilization = getDoctorUtilization(doctor);
  const hospitalName = getDoctorHospitalName(doctor);
  const hospitalCity = getDoctorHospitalCity(doctor);

  return (
    <ResourceCard>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <DoctorAvatar doctor={doctor} size="md" />
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-text-primary">
                {doctor.name}
              </h3>
              <p className="text-xs text-text-secondary">
                {doctor.specialization}
              </p>
            </div>
          </div>
          <DoctorStatusBadge status={doctor.status} />
        </div>

        <p className="flex items-center gap-1 text-xs text-text-secondary">
          <MapPin className="h-3 w-3 shrink-0" />
          {hospitalName}
          {hospitalCity && ` · ${hospitalCity}`}
        </p>

        <div className="grid grid-cols-3 gap-4">
          <ResourceMetric
            label="Patients"
            value={`${doctor.currentPatients}/${doctor.maxPatients}`}
          />
          <ResourceMetric
            label="Utilization"
            value={`${utilization}%`}
            highlight={utilization >= 80}
          />
          <ResourceMetric label="Capacity" value={doctor.maxPatients} />
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1 gap-2"
            onClick={() => onViewDetails(doctor)}
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </Button>
          {onToggleAvailability && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleAvailability(doctor)}
            >
              {doctor.status === "AVAILABLE" ? "Off Duty" : "Available"}
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(doctor)}>
              Edit
            </Button>
          )}
        </div>
      </div>
    </ResourceCard>
  );
}
