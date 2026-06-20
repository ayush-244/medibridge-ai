import type { RiskLevel } from "@/features/copilot/types/copilot.types";

const HIGH_RISK_KEYWORDS = [
  "coronary",
  "cardiac",
  "stroke",
  "cancer",
  "malignant",
  "critical",
  "emergency",
  "sepsis",
  "failure",
  "infarction",
];

const MEDIUM_RISK_KEYWORDS = [
  "diabetes",
  "hypertension",
  "chronic",
  "asthma",
  "copd",
  "obesity",
];

export function deriveRiskLevel(
  condition: string,
  confidence?: number,
): RiskLevel {
  const normalized = condition.toLowerCase();

  if (
    HIGH_RISK_KEYWORDS.some((keyword) => normalized.includes(keyword)) ||
    (confidence !== undefined && confidence >= 90 && normalized.length > 0)
  ) {
    return "HIGH";
  }

  if (MEDIUM_RISK_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return "MEDIUM";
  }

  if (normalized.includes("critical") || normalized.includes("urgent")) {
    return "CRITICAL";
  }

  return confidence !== undefined && confidence < 40 ? "MEDIUM" : "LOW";
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "CRITICAL":
      return "bg-red-600";
    case "HIGH":
      return "bg-danger";
    case "MEDIUM":
      return "bg-warning";
    default:
      return "bg-success";
  }
}

export function getRiskBadgeClass(level: RiskLevel): string {
  switch (level) {
    case "CRITICAL":
      return "bg-red-100 text-red-700 border-red-200";
    case "HIGH":
      return "bg-red-50 text-red-600 border-red-100";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 border-amber-100";
    default:
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
}

export function getUrgencyBadgeClass(urgency: string): string {
  const normalized = urgency.toLowerCase();
  if (normalized.includes("critical") || normalized.includes("emergency")) {
    return "bg-red-50 text-red-700 border-red-200";
  }
  if (normalized.includes("urgent")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-sky-50 text-sky-700 border-sky-200";
}

export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatUploadDate(dateString: string): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
