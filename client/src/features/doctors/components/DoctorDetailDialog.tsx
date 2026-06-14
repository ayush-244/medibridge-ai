import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DoctorStatusBadge } from "@/components/common/StatusBadge";
import { DoctorAvatar } from "@/components/common/DoctorAvatar";
import {
  getDoctorHospitalCity,
  getDoctorHospitalName,
  getDoctorUtilization,
} from "@/features/doctors/utils/doctorUtils";
import type { Doctor } from "@/features/doctors/types/doctor.types";

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

interface DoctorDetailDialogProps {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onToggleAvailability?: () => void;
}

export function DoctorDetailDialog({
  doctor,
  open,
  onOpenChange,
  onEdit,
  onToggleAvailability,
}: DoctorDetailDialogProps) {
  if (!doctor) return null;

  const utilization = getDoctorUtilization(doctor);
  const hospitalName = getDoctorHospitalName(doctor);
  const hospitalCity = getDoctorHospitalCity(doctor);

  const activitySummary =
    doctor.status === "AVAILABLE"
      ? "Ready to accept new patients"
      : doctor.status === "BUSY"
        ? "Currently at or near patient capacity"
        : "Not available for assignments";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="flex min-w-0 items-center gap-4">
              <DoctorAvatar doctor={doctor} size="xl" />
              <div className="min-w-0">
                <DialogTitle>{doctor.name}</DialogTitle>
                <DialogDescription>
                  {doctor.specialization} - {hospitalName}
                </DialogDescription>
              </div>
            </div>
            <DoctorStatusBadge status={doctor.status} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <DetailSection title="Doctor Information">
            <DetailRow label="Specialization" value={doctor.specialization} />
            {doctor.email && (
              <DetailRow label="Email" value={doctor.email} />
            )}
            {doctor.experience != null && (
              <DetailRow
                label="Experience"
                value={`${doctor.experience} years`}
              />
            )}
            <DetailRow
              label="Phone"
              value={doctor.phone || "Not provided"}
            />
            <DetailRow label="Status" value={doctor.status.replace(/_/g, " ")} />
          </DetailSection>

          <DetailSection title="Hospital">
            <DetailRow label="Hospital" value={hospitalName} highlight />
            <DetailRow
              label="Location"
              value={hospitalCity || "—"}
            />
          </DetailSection>

          <DetailSection title="Patient Capacity">
            <DetailRow
              label="Current Patients"
              value={doctor.currentPatients}
            />
            <DetailRow label="Max Patients" value={doctor.maxPatients} />
            <DetailRow
              label="Utilization"
              value={`${utilization}%`}
              highlight
            />
          </DetailSection>

          <DetailSection title="Activity Summary">
            <DetailRow label="Availability" value={activitySummary} />
            <DetailRow
              label="Slots Remaining"
              value={Math.max(0, doctor.maxPatients - doctor.currentPatients)}
              highlight
            />
          </DetailSection>
        </div>

        {(onEdit || onToggleAvailability) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button className="flex-1" onClick={onEdit}>
                Edit Doctor
              </Button>
            )}
            {onToggleAvailability && (
              <Button
                variant="secondary"
                className="flex-1"
                onClick={onToggleAvailability}
              >
                {doctor.status === "AVAILABLE"
                  ? "Set Off Duty"
                  : "Set Available"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
