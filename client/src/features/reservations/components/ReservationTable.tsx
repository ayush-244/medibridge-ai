import { Eye, MapPin, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoctorAvatar } from "@/components/common/DoctorAvatar";
import { ReservationStatusBadge } from "@/components/common/StatusBadge";
import { ExpiryCountdown } from "@/features/reservations/components/ExpiryCountdown";
import {
  formatBedType,
  formatReservationDate,
  getDoctorName,
  getHospitalName,
} from "@/features/reservations/utils/reservationUtils";
import type { Reservation } from "@/features/reservations/types/reservation.types";
import { cn } from "@/lib/utils";

interface ReservationCardProps {
  reservation: Reservation;
  now: number;
  onSelect: (reservation: Reservation) => void;
}

export function ReservationCard({
  reservation,
  now,
  onSelect,
}: ReservationCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(reservation)}
      className={cn(
        "w-full rounded-lg border border-border bg-white p-4 text-left transition-all",
        "hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-text-primary">
            {reservation.patientName}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
            <MapPin className="h-3 w-3" />
            {getHospitalName(reservation.hospital)}
          </p>
        </div>
        <ReservationStatusBadge status={reservation.reservationStatus} />
      </div>

      <div className="mt-3 flex items-center gap-1 text-xs text-text-secondary">
        {typeof reservation.doctor === "string" ? (
          <Stethoscope className="h-3 w-3" />
        ) : (
          <DoctorAvatar doctor={reservation.doctor} size="sm" />
        )}
        {getDoctorName(reservation.doctor)}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Badge variant="outline">{formatBedType(reservation.bedType)}</Badge>
        <ExpiryCountdown
          expiresAt={reservation.expiresAt}
          status={reservation.reservationStatus}
          now={now}
          className="text-xs"
        />
      </div>

      <p className="mt-2 text-xs text-text-secondary">
        Created {formatReservationDate(reservation.createdAt)}
      </p>
    </button>
  );
}

interface ReservationTableProps {
  reservations: Reservation[];
  now: number;
  onSelect: (reservation: Reservation) => void;
}

export function ReservationTable({
  reservations,
  now,
  onSelect,
}: ReservationTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-white md:block">
        <div className="max-h-[calc(100vh-420px)] overflow-auto">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10 border-b border-border bg-gray-50/95 backdrop-blur-sm">
              <tr>
                {[
                  "Patient",
                  "Hospital",
                  "Doctor",
                  "Bed Type",
                  "Status",
                  "Expires At",
                  "Created At",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr
                  key={reservation._id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(reservation)}
                      className="font-medium text-text-primary hover:text-primary"
                    >
                      {reservation.patientName}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {getHospitalName(reservation.hospital)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      {typeof reservation.doctor !== "string" && (
                        <DoctorAvatar doctor={reservation.doctor} size="sm" />
                      )}
                      <span>{getDoctorName(reservation.doctor)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">
                      {formatBedType(reservation.bedType)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ReservationStatusBadge
                      status={reservation.reservationStatus}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <ExpiryCountdown
                      expiresAt={reservation.expiresAt}
                      status={reservation.reservationStatus}
                      now={now}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {formatReservationDate(reservation.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => onSelect(reservation)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {reservations.map((reservation) => (
          <ReservationCard
            key={reservation._id}
            reservation={reservation}
            now={now}
            onSelect={onSelect}
          />
        ))}
      </div>
    </>
  );
}
