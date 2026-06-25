import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/types/socket";
import { referralService } from "@/features/referrals/services/referral.service";
import { cn } from "@/lib/utils";
import type { TimelineEventItem, TimelineEventType } from "@/features/referrals/types/referral.types";

interface ReferralTimelineViewProps {
  referralId: string;
  open: boolean;
}

function getEventColor(eventType: TimelineEventType): string {
  switch (eventType) {
    case "SPECIALIST_RECOMMENDED":
    case "HOSPITAL_RECOMMENDED":
    case "AI_AUTOFILL_GENERATED":
      return "bg-blue-500 border-blue-500";
    case "REFERRAL_ACCEPTED":
    case "PATIENT_ARRIVED":
    case "REFERRAL_COMPLETED":
    case "RESERVATION_COMPLETED":
      return "bg-green-500 border-green-500";
    case "BED_RESERVED":
    case "DOCTOR_ASSIGNED":
    case "REFERRAL_CREATED":
    case "RESERVATION_EXTENDED":
      return "bg-amber-500 border-amber-500";
    case "REFERRAL_REJECTED":
    case "RESERVATION_CANCELLED":
    case "DOCUMENT_DELETED":
      return "bg-red-500 border-red-500";
    case "DOCUMENT_UPLOADED":
    case "DOCUMENT_REPLACED":
      return "bg-indigo-500 border-indigo-500";
    case "DOCUMENT_VIEWED":
    case "DOCUMENT_DOWNLOADED":
      return "bg-sky-500 border-sky-500";
    default:
      return "bg-slate-400 border-slate-400";
  }
}

function getEventIcon(eventType: TimelineEventType): string {
  switch (eventType) {
    case "REFERRAL_CREATED":
    case "REFERRAL_SUBMITTED":
      return "+";
    case "SPECIALIST_RECOMMENDED":
    case "HOSPITAL_RECOMMENDED":
    case "AI_AUTOFILL_GENERATED":
      return "AI";
    case "REFERRAL_ACCEPTED":
      return "\u2713";
    case "REFERRAL_REJECTED":
    case "RESERVATION_CANCELLED":
      return "\u2717";
    case "DOCTOR_ASSIGNED":
      return "D";
    case "BED_RESERVED":
      return "B";
    case "PATIENT_ARRIVED":
      return "A";
    case "RESERVATION_EXTENDED":
      return "+";
    case "RESERVATION_COMPLETED":
    case "REFERRAL_COMPLETED":
      return "\u2713";
    case "DOCUMENT_UPLOADED":
      return "U";
    case "DOCUMENT_REPLACED":
      return "R";
    case "DOCUMENT_DELETED":
      return "D";
    case "DOCUMENT_VIEWED":
      return "V";
    case "DOCUMENT_DOWNLOADED":
      return "\u2193";
    default:
      return "\u2022";
  }
}

function getEventLabel(eventType: TimelineEventType): string {
  switch (eventType) {
    case "REFERRAL_CREATED":
      return "Referral Created";
    case "AI_AUTOFILL_GENERATED":
      return "AI Autofill Generated";
    case "SPECIALIST_RECOMMENDED":
      return "AI Specialist Recommended";
    case "HOSPITAL_RECOMMENDED":
      return "AI Hospital Recommended";
    case "REFERRAL_SUBMITTED":
      return "Referral Submitted";
    case "REFERRAL_ACCEPTED":
      return "Referral Accepted";
    case "REFERRAL_REJECTED":
      return "Referral Rejected";
    case "DOCTOR_ASSIGNED":
      return "Doctor Assigned";
    case "BED_RESERVED":
      return "Bed Reserved";
    case "RESERVATION_EXTENDED":
      return "Reservation Extended";
    case "PATIENT_ARRIVED":
      return "Patient Arrived";
    case "RESERVATION_CANCELLED":
      return "Reservation Cancelled";
    case "RESERVATION_COMPLETED":
      return "Reservation Completed";
    case "REFERRAL_COMPLETED":
      return "Referral Completed";
    case "DOCUMENT_UPLOADED":
      return "Document Uploaded";
    case "DOCUMENT_REPLACED":
      return "Document Replaced";
    case "DOCUMENT_DELETED":
      return "Document Deleted";
    case "DOCUMENT_VIEWED":
      return "Document Viewed";
    case "DOCUMENT_DOWNLOADED":
      return "Document Downloaded";
    default:
      return eventType;
  }
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function ReferralTimelineView({ referralId, open }: ReferralTimelineViewProps) {
  const [events, setEvents] = useState<TimelineEventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await referralService.getTimeline(referralId);
      setEvents(data);
    } catch {
      setError("Failed to load timeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && referralId) {
      void loadTimeline();
    }
    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [open, referralId]);

  useSocketEvent(
    SOCKET_EVENTS.TIMELINE_UPDATED,
    (payload) => {
      if (payload.referralId === referralId) {
        if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = setTimeout(() => {
          void loadTimeline();
        }, 300);
      }
    },
    open,
  );

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-text-secondary">{error}</p>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-text-secondary">No timeline events yet.</p>
        <p className="mt-1 text-xs text-text-secondary">
          Events will appear as actions are taken on this referral.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {events.map((event, index) => {
        const colorClass = getEventColor(event.eventType);
        const isLast = index === events.length - 1;

        return (
          <div key={event._id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white shadow-sm",
                  colorClass,
                )}
              >
                {getEventIcon(event.eventType)}
              </div>
              {!isLast && (
                <div className="my-1 h-10 w-0.5 rounded-full bg-border" />
              )}
            </div>
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p className="text-sm font-medium text-text-primary">
                {getEventLabel(event.eventType)}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">
                {event.description}
              </p>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                {event.actorName !== "System"
                  ? `by ${event.actorName}`
                  : ""}{" "}
                {formatRelativeTime(event.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
