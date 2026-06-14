import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { DoctorAvatar } from "@/components/common/DoctorAvatar";
import { ReservationStatusBadge } from "@/components/common/StatusBadge";
import { ReservationDrawerSkeleton } from "@/features/reservations/components/ReservationDrawerSkeleton";
import { ExpiryCountdown } from "@/features/reservations/components/ExpiryCountdown";
import { ExtendReservationDialog } from "@/features/reservations/components/ExtendReservationDialog";
import { useReservationActions } from "@/features/reservations/hooks/useReservationActions";
import {
  formatBedType,
  formatReservationDate,
  getDoctorName,
  getDoctorSpecialization,
  getHospitalCity,
  getHospitalName,
  getReferralPatient,
} from "@/features/reservations/utils/reservationUtils";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import type { ReservationDuration } from "@/lib/constants";

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

function DetailRow({ label, value, highlight }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span
        className={
          highlight
            ? "text-right text-sm font-semibold text-primary"
            : "text-right text-sm font-medium text-text-primary"
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

interface ReservationDetailDrawerProps {
  reservation: Reservation | null;
  isLoading: boolean;
  now: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActionComplete?: () => void;
}

export function ReservationDetailDrawer({
  reservation,
  isLoading,
  now,
  open,
  onOpenChange,
  onActionComplete,
}: ReservationDetailDrawerProps) {
  const {
    isActionLoading,
    markArrived,
    extendReservation,
    cancelReservation,
    completeReservation,
  } = useReservationActions();
  const [extendOpen, setExtendOpen] = useState(false);

  const isActive = reservation?.reservationStatus === "CONFIRMED";
  const isArrived = reservation?.reservationStatus === "ARRIVED";
  const canAct = isActive || isArrived;

  const handleArrived = async () => {
    if (!reservation) return;
    const updated = await markArrived(reservation._id);
    if (updated) onActionComplete?.();
  };

  const handleExtend = async (duration: ReservationDuration) => {
    if (!reservation) return;
    const updated = await extendReservation(reservation._id, duration);
    if (updated) {
      setExtendOpen(false);
      onActionComplete?.();
    }
  };

  const handleCancel = async () => {
    if (!reservation) return;
    if (!window.confirm("Cancel this reservation? Beds will be released.")) {
      return;
    }
    const updated = await cancelReservation(reservation._id);
    if (updated) onActionComplete?.();
  };

  const handleComplete = async () => {
    if (!reservation) return;
    const updated = await completeReservation(reservation._id);
    if (updated) onActionComplete?.();
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="flex flex-col sm:max-w-lg">
          {isLoading ? (
            <ReservationDrawerSkeleton />
          ) : reservation ? (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-3 pr-8">
                  <div>
                    <SheetTitle>{reservation.patientName}</SheetTitle>
                    <SheetDescription>
                      {getHospitalName(reservation.hospital)}
                    </SheetDescription>
                  </div>
                  <ReservationStatusBadge
                    status={reservation.reservationStatus}
                  />
                </div>
              </SheetHeader>

              <SheetBody className="flex-1 space-y-6">
                <DetailSection title="Patient">
                  <DetailRow
                    label="Patient Name"
                    value={reservation.patientName}
                  />
                  <DetailRow
                    label="Related Referral"
                    value={getReferralPatient(reservation.referral)}
                    highlight
                  />
                </DetailSection>

                <DetailSection title="Assignment">
                  <DetailRow
                    label="Hospital"
                    value={getHospitalName(reservation.hospital)}
                  />
                  <DetailRow
                    label="City"
                    value={getHospitalCity(reservation.hospital) || "—"}
                  />
                  <DetailRow
                    label="Doctor"
                    value={
                      <span className="inline-flex items-center justify-end gap-2">
                        {typeof reservation.doctor !== "string" && (
                          <DoctorAvatar doctor={reservation.doctor} size="sm" />
                        )}
                        {getDoctorName(reservation.doctor)}
                      </span>
                    }
                  />
                  <DetailRow
                    label="Specialization"
                    value={
                      getDoctorSpecialization(reservation.doctor) || "—"
                    }
                  />
                </DetailSection>

                <DetailSection title="Reservation">
                  <DetailRow
                    label="Bed Type"
                    value={
                      <Badge variant="outline">
                        {formatBedType(reservation.bedType)}
                      </Badge>
                    }
                  />
                  <DetailRow
                    label="Status"
                    value={
                      <ReservationStatusBadge
                        status={reservation.reservationStatus}
                      />
                    }
                  />
                  <DetailRow
                    label="Expiry"
                    value={
                      <ExpiryCountdown
                        expiresAt={reservation.expiresAt}
                        status={reservation.reservationStatus}
                        now={now}
                      />
                    }
                    highlight
                  />
                  <DetailRow
                    label="Reserved At"
                    value={formatReservationDate(reservation.reservedAt)}
                  />
                  <DetailRow
                    label="Created"
                    value={formatReservationDate(reservation.createdAt)}
                  />
                </DetailSection>
              </SheetBody>

              {canAct && (
                <div className="border-t border-border p-6 space-y-2">
                  {isActive && (
                    <Button
                      className="w-full"
                      disabled={isActionLoading}
                      onClick={() => void handleArrived()}
                    >
                      Patient Arrived
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={isActionLoading}
                    onClick={() => setExtendOpen(true)}
                  >
                    Extend Reservation
                  </Button>
                  {isArrived && (
                    <Button
                      className="w-full"
                      disabled={isActionLoading}
                      onClick={() => void handleComplete()}
                    >
                      Complete Reservation
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    className="w-full"
                    disabled={isActionLoading}
                    onClick={() => void handleCancel()}
                  >
                    Cancel Reservation
                  </Button>
                </div>
              )}
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ExtendReservationDialog
        open={extendOpen}
        onOpenChange={setExtendOpen}
        onConfirm={(duration) => void handleExtend(duration)}
        isLoading={isActionLoading}
      />
    </>
  );
}
