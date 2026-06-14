import { Stethoscope } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { DoctorAvatar } from "@/components/common/DoctorAvatar";
import { DoctorStatusBadge } from "@/components/common/StatusBadge";
import { useDoctorsByHospital } from "@/features/hospitals/hooks/useDoctorsByHospital";
import { Loader2 } from "lucide-react";

interface HospitalDoctorsTabProps {
  hospitalId: string;
}

export function HospitalDoctorsTab({ hospitalId }: HospitalDoctorsTabProps) {
  const { doctors, isLoading, error } = useDoctorsByHospital(hospitalId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load doctors"
        description={error}
        icon={<Stethoscope className="h-6 w-6" />}
      />
    );
  }

  if (doctors.length === 0) {
    return (
      <EmptyState
        title="No doctors registered"
        description="This hospital has no doctors on record."
        icon={<Stethoscope className="h-6 w-6" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      {doctors.map((doctor) => (
        <div
          key={doctor._id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <DoctorAvatar doctor={doctor} size="md" />
            <div className="min-w-0">
              <p className="font-medium text-text-primary">{doctor.name}</p>
              <p className="text-sm text-text-secondary">
                {doctor.specialization}
              </p>
            </div>
          </div>
          <DoctorStatusBadge status={doctor.status} />
        </div>
      ))}
    </div>
  );
}
