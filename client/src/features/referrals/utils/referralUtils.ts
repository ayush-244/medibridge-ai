import type { ReferralStatus } from "@/lib/constants";
import type { TimelineStep } from "@/features/referrals/types/referral.types";
import type {
  Referral,
  ReferralDirection,
  ReferralFilters,
  ReferralSortField,
  SortDirection,
} from "@/features/referrals/types/referral.types";

export function getHospitalName(
  hospital: Referral["fromHospital"] | Referral["toHospital"],
): string {
  if (typeof hospital === "string") return hospital;
  return hospital.name;
}

export function getHospitalCity(
  hospital: Referral["fromHospital"] | Referral["toHospital"],
): string {
  if (typeof hospital === "string") return "";
  return hospital.city;
}

export function formatReferralDate(date?: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(date?: string): string {
  if (!date) return "—";

  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatReferralDate(date);
}

export function filterByDirection(
  referrals: Referral[],
  direction: ReferralDirection,
  userHospitalId?: string | null,
): Referral[] {
  if (direction === "all" || !userHospitalId) return referrals;

  return referrals.filter((r) => {
    const fromId =
      typeof r.fromHospital === "string" ? r.fromHospital : r.fromHospital._id;
    const toId =
      typeof r.toHospital === "string" ? r.toHospital : r.toHospital._id;

    if (direction === "inbound") return toId === userHospitalId;
    if (direction === "outbound") return fromId === userHospitalId;
    return true;
  });
}

export function getUniqueHospitals(referrals: Referral[]): string[] {
  const names = new Set<string>();

  referrals.forEach((r) => {
    names.add(getHospitalName(r.fromHospital));
    names.add(getHospitalName(r.toHospital));
  });

  return Array.from(names).sort();
}

export function filterReferrals(
  referrals: Referral[],
  filters: ReferralFilters,
): Referral[] {
  const query = filters.search.trim().toLowerCase();

  return referrals.filter((referral) => {
    if (filters.status !== "ALL" && referral.status !== filters.status) {
      return false;
    }

    if (filters.hospital !== "ALL") {
      const from = getHospitalName(referral.fromHospital);
      const to = getHospitalName(referral.toHospital);
      if (from !== filters.hospital && to !== filters.hospital) {
        return false;
      }
    }

    if (!query) return true;

    const from = getHospitalName(referral.fromHospital).toLowerCase();
    const to = getHospitalName(referral.toHospital).toLowerCase();

    return (
      referral.patientName.toLowerCase().includes(query) ||
      referral.condition.toLowerCase().includes(query) ||
      from.includes(query) ||
      to.includes(query)
    );
  });
}

export function sortReferrals(
  referrals: Referral[],
  field: ReferralSortField,
  direction: SortDirection,
): Referral[] {
  const sorted = [...referrals].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "patientName":
        comparison = a.patientName.localeCompare(b.patientName);
        break;
      case "condition":
        comparison = a.condition.localeCompare(b.condition);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime();
        break;
      case "fromHospital":
        comparison = getHospitalName(a.fromHospital).localeCompare(
          getHospitalName(b.fromHospital),
        );
        break;
      case "toHospital":
        comparison = getHospitalName(a.toHospital).localeCompare(
          getHospitalName(b.toHospital),
        );
        break;
    }

    return direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function paginateReferrals<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTimelineSteps(status: ReferralStatus): TimelineStep[] {
  const steps: TimelineStep[] = [
    { label: "Created", key: "PENDING", completed: true },
    { label: "Accepted", key: "ACCEPTED", completed: false },
    { label: "Completed", key: "COMPLETED", completed: false },
  ];

  if (status === "REJECTED") {
    return [
      { label: "Created", key: "PENDING", completed: true },
      { label: "Rejected", key: "REJECTED", completed: true, rejected: true },
    ];
  }

  if (status === "ACCEPTED" || status === "COMPLETED") {
    steps[1].completed = true;
  }

  if (status === "COMPLETED") {
    steps[2].completed = true;
  }

  return steps;
}

export function canAcceptReferral(status: ReferralStatus): boolean {
  return status === "PENDING";
}

export function canRejectReferral(status: ReferralStatus): boolean {
  return status === "PENDING";
}

export function canCompleteReferral(status: ReferralStatus): boolean {
  return status === "ACCEPTED";
}
