import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bot, FileText, Loader2, RefreshCw, Clock, Stethoscope, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralStatusBadge, ReferralPriorityBadge } from "@/components/common/StatusBadge";
import { useClinicalReview } from "@/features/referrals/hooks/useClinicalReview";
import { formatReferralDate, getHospitalName, getHospitalCity } from "@/features/referrals/utils/referralUtils";
import { getReferralPriority } from "@/features/referrals/utils/severity";
import { referralService } from "@/features/referrals/services/referral.service";
import type { Referral, ReferralDocument, TimelineEventItem, AvailableDoctor } from "@/features/referrals/types/referral.types";
import type { AiSummary } from "@/features/referrals/types/referral.types";
import { cn } from "@/lib/utils";

interface ClinicalReviewWorkspaceProps {
  referralId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimelineDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const timelineEventColors: Record<string, string> = {
  REFERRAL_CREATED: "bg-blue-500",
  AI_AUTOFILL_GENERATED: "bg-purple-500",
  SPECIALIST_RECOMMENDED: "bg-indigo-500",
  HOSPITAL_RECOMMENDED: "bg-indigo-500",
  REFERRAL_SUBMITTED: "bg-blue-500",
  REFERRAL_ACCEPTED: "bg-emerald-500",
  REFERRAL_REJECTED: "bg-red-500",
  DOCTOR_ASSIGNED: "bg-amber-500",
  BED_RESERVED: "bg-teal-500",
  RESERVATION_EXTENDED: "bg-orange-500",
  PATIENT_ARRIVED: "bg-green-500",
  RESERVATION_CANCELLED: "bg-red-500",
  RESERVATION_COMPLETED: "bg-green-500",
  REFERRAL_COMPLETED: "bg-emerald-500",
  DOCUMENT_UPLOADED: "bg-indigo-500",
  DOCUMENT_REPLACED: "bg-indigo-500",
  DOCUMENT_DELETED: "bg-red-500",
  DOCUMENT_VIEWED: "bg-sky-500",
  DOCUMENT_DOWNLOADED: "bg-sky-500",
};

function TimelineDot({ eventType }: { eventType: string }) {
  return (
    <div
      className={cn(
        "h-2.5 w-2.5 rounded-full ring-2 ring-white",
        timelineEventColors[eventType] || "bg-gray-400",
      )}
    />
  );
}

function PatientOverviewCard({ referral }: { referral: Referral }) {
  const priority = getReferralPriority(referral.condition);
  const requestedBy = typeof referral.requestedBy === "string" ? referral.requestedBy : referral.requestedBy.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-text-secondary" />
          Patient Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Patient Name</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{referral.patientName}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Age</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{referral.age}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Condition</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{referral.condition}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Priority</span>
            <div className="mt-0.5">
              <ReferralPriorityBadge priority={priority} />
            </div>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Requested By</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{requestedBy}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Created</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{formatReferralDate(referral.createdAt)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">From Hospital</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{getHospitalName(referral.fromHospital)}</p>
            <p className="text-xs text-text-secondary">{getHospitalCity(referral.fromHospital) || "\u2014"}</p>
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">To Hospital</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">{getHospitalName(referral.toHospital)}</p>
            <p className="text-xs text-text-secondary">{getHospitalCity(referral.toHospital) || "\u2014"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentsCard({
  documents,
  referralId,
}: {
  documents: ReferralDocument[];
  referralId: string;
}) {
  const hasDocs = documents.length > 0;

  const handlePreview = (doc: ReferralDocument) => {
    const url = referralService.getDocumentDownloadUrl(referralId, doc._id);
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-text-secondary" />
          Clinical Documents
          {hasDocs && (
            <span className="ml-auto text-xs font-normal text-text-secondary">
              {documents.length} file{documents.length !== 1 ? "s" : ""}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasDocs ? (
          <p className="text-sm text-text-secondary">No clinical documents have been uploaded for this referral.</p>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text-primary">{doc.originalFilename}</p>
                  <p className="text-xs text-text-secondary">{formatFileSize(doc.fileSize)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 shrink-0"
                  onClick={() => handlePreview(doc)}
                >
                  Preview
                </Button>
              </div>
            ))}
            {documents.length > 5 && (
              <p className="text-xs text-text-secondary">
                +{documents.length - 5} more file{documents.length - 5 !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AiSummaryCard({
  aiSummary,
  isAiLoading,
  aiError,
  onGenerate,
}: {
  aiSummary: AiSummary | null;
  isAiLoading: boolean;
  aiError: string | null;
  onGenerate: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-4 w-4 text-text-secondary" />
          AI Clinical Summary
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto gap-1.5 text-xs"
            onClick={onGenerate}
            disabled={isAiLoading}
          >
            {isAiLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {aiSummary ? "Regenerate" : "Generate Summary"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAiLoading ? (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-primary">Generating AI summary...</p>
              <p className="text-xs text-text-secondary">Analyzing clinical data and documents</p>
            </div>
          </div>
        ) : aiError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">Failed to generate summary</p>
                <p className="text-xs text-red-600">{aiError}</p>
              </div>
            </div>
          </div>
        ) : aiSummary ? (
          <div className="space-y-3">
            {(aiSummary as AiSummary).primaryDiagnosis && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Primary Diagnosis</span>
                <p className="mt-0.5 text-sm font-medium text-text-primary">{(aiSummary as AiSummary).primaryDiagnosis}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(aiSummary as AiSummary).riskLevel && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Risk Level</span>
                  <p className={cn(
                    "mt-0.5 text-sm font-semibold",
                    ((aiSummary as AiSummary).riskLevel ?? "").toLowerCase() === "high" || ((aiSummary as AiSummary).riskLevel ?? "").toLowerCase() === "critical"
                      ? "text-red-600"
                      : ((aiSummary as AiSummary).riskLevel ?? "").toLowerCase() === "moderate" || ((aiSummary as AiSummary).riskLevel ?? "").toLowerCase() === "medium"
                        ? "text-amber-600"
                        : "text-emerald-600",
                  )}>
                    {(aiSummary as AiSummary).riskLevel}
                  </p>
                </div>
              )}
              {(aiSummary as AiSummary).confidence !== undefined && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Confidence</span>
                  <p className="mt-0.5 text-sm font-semibold text-text-primary">{Number((aiSummary as AiSummary).confidence).toFixed(0)}%</p>
                </div>
              )}
              {(aiSummary as AiSummary).urgency && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Urgency</span>
                  <p className="mt-0.5 text-sm font-semibold text-text-primary">{(aiSummary as AiSummary).urgency}</p>
                </div>
              )}
              {(aiSummary as AiSummary).recommendedSpecialist && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Specialist</span>
                  <p className="mt-0.5 text-sm font-semibold text-text-primary">{(aiSummary as AiSummary).recommendedSpecialist}</p>
                </div>
              )}
            </div>
            {(aiSummary as AiSummary).keyFindings && (aiSummary as AiSummary).keyFindings!.length > 0 && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Key Findings</span>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {(aiSummary as AiSummary).keyFindings!.map((finding, idx) => (
                    <li key={idx} className="text-sm text-text-primary">{finding}</li>
                  ))}
                </ul>
              </div>
            )}
            {(aiSummary as AiSummary).transferRecommendation && (
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Transfer Recommendation</span>
                <p className="mt-0.5 text-sm text-text-primary">{(aiSummary as AiSummary).transferRecommendation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6">
            <Bot className="h-8 w-8 text-text-secondary/40" />
            <p className="text-sm text-text-secondary">Click &quot;Generate Summary&quot; to create an AI-powered clinical summary</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationsCard({
  referral,
}: {
  referral: Referral;
}) {
  const priority = getReferralPriority(referral.condition);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Stethoscope className="h-4 w-4 text-text-secondary" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface/50 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Suggested Specialty</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">
              {priority === "CRITICAL" ? "Emergency Medicine" : `${priority === "HIGH" ? "Specialist" : "General"} Consultation`}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface/50 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">Recommended Action</span>
            <p className="mt-0.5 text-sm font-medium text-text-primary">
              {referral.status === "PENDING" ? "Review clinical documents and assign care team" : "Referral has been processed"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineCard({ events }: { events: TimelineEventItem[] }) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-text-secondary" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">No activity recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-text-secondary" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {events.map((event, idx) => (
            <div key={event._id} className="relative flex gap-3 pb-4 last:pb-0">
              {idx < events.length - 1 && (
                <div className="absolute left-[5px] top-3 h-full w-px bg-border" />
              )}
              <div className="flex shrink-0 items-start pt-1">
                <TimelineDot eventType={event.eventType} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{event.description}</p>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span>{event.actorName}</span>
                  <span>\u00B7</span>
                  <span>{formatTimelineDate(event.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DecisionPanel({
  referral,
  availableDoctors,
  hospital,
  actionLoading,
  onSmartAccept,
  onReject,
}: {
  referral: Referral;
  availableDoctors: AvailableDoctor[];
  hospital: { availableBeds: number; availableICUBeds: number } | null;
  actionLoading: boolean;
  onSmartAccept: (doctorId: string | undefined, bedType: "GENERAL" | "ICU") => void;
  onReject: () => void;
}) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [selectedBedType, setSelectedBedType] = useState<"GENERAL" | "ICU">("GENERAL");

  const hasIcuBeds = (hospital?.availableICUBeds ?? 0) > 0;
  const hasGeneralBeds = (hospital?.availableBeds ?? 0) > 0;

  const canAccept = referral.status === "PENDING";
  const bedOptions: { value: "GENERAL" | "ICU"; label: string; disabled: boolean }[] = [
    { value: "GENERAL", label: `General Ward (${hospital?.availableBeds ?? "?"} available)`, disabled: !hasGeneralBeds },
    { value: "ICU", label: `ICU (${hospital?.availableICUBeds ?? "?"} available)`, disabled: !hasIcuBeds },
  ];

  return (
    <div className="sticky bottom-0 rounded-lg border border-border bg-white p-4 shadow-lg">
      <h3 className="mb-3 text-sm font-semibold text-text-primary">Decision Panel</h3>
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Assign Doctor
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            disabled={!canAccept || actionLoading}
          >
            <option value="">Auto-assign best available</option>
            {availableDoctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name} ({doc.specialization}) \u2014 {doc.currentPatients}/{doc.maxPatients} patients
              </option>
            ))}
            {availableDoctors.length === 0 && (
              <option value="" disabled>No available doctors</option>
            )}
          </select>
        </div>

        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-secondary">
            Bed Type
          </label>
          <select
            value={selectedBedType}
            onChange={(e) => setSelectedBedType(e.target.value as "GENERAL" | "ICU")}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            disabled={!canAccept || actionLoading}
          >
            {bedOptions.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="gap-2"
            onClick={() => onSmartAccept(selectedDoctorId || undefined, selectedBedType)}
            disabled={!canAccept || actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Accept & Assign
          </Button>
          <Button
            variant="danger"
            className="gap-2"
            onClick={onReject}
            disabled={!canAccept || actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ClinicalReviewWorkspace({ referralId }: ClinicalReviewWorkspaceProps) {
  const navigate = useNavigate();
  const {
    reviewData,
    aiSummary,
    isLoading,
    isAiLoading,
    error,
    aiError,
    actionLoading,
    generateAiSummary,
    smartAccept,
    reject,
  } = useClinicalReview(referralId);

  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);

  useEffect(() => {
    if (reviewData?.referral) {
      void generateAiSummary();
    }
  }, [reviewData?.referral?._id]);

  const handleSmartAccept = async (doctorId: string | undefined, bedType: "GENERAL" | "ICU") => {
    const success = await smartAccept({ doctorId, bedType });
    if (success) {
      navigate("/referrals", { replace: true });
    }
  };

  const handleReject = async () => {
    const success = await reject();
    if (success) {
      navigate("/referrals", { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-text-secondary">Loading review data...</p>
        </div>
      </div>
    );
  }

  if (error && !reviewData) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-red-600">Failed to load review</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/referrals")}>
          Back to Referrals
        </Button>
      </div>
    );
  }

  if (!reviewData?.referral) {
    return null;
  }

  const { referral, documents, timeline, availableDoctors, hospital } = reviewData;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate("/referrals")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">{referral.patientName}</h1>
            <p className="text-sm text-text-secondary">
              Age {referral.age} \u00B7 {referral.condition}
            </p>
          </div>
        </div>
        <ReferralStatusBadge status={referral.status} />
      </div>

      {/* Sections */}
      <PatientOverviewCard referral={referral} />
      <DocumentsCard documents={documents} referralId={referral._id} />
      <AiSummaryCard
        aiSummary={aiSummary}
        isAiLoading={isAiLoading}
        aiError={aiError}
        onGenerate={generateAiSummary}
      />
      <RecommendationsCard referral={referral} />
      <TimelineCard events={timeline} />

      {/* Decision Panel */}
      {referral.status === "PENDING" && (
        <>
          {confirmRejectOpen ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-red-800">Confirm Rejection</p>
                  <p className="text-xs text-red-600">
                    Are you sure you want to reject this referral for {referral.patientName}?
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirmRejectOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="gap-2"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirm Reject
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <DecisionPanel
              referral={referral}
              availableDoctors={availableDoctors}
              hospital={hospital}
              actionLoading={actionLoading}
              onSmartAccept={handleSmartAccept}
              onReject={() => setConfirmRejectOpen(true)}
            />
          )}
        </>
      )}

      {referral.status !== "PENDING" && (
        <div className="rounded-lg border border-border bg-surface/50 p-4 text-center">
          <p className="text-sm text-text-secondary">
            This referral has been <strong>{referral.status.toLowerCase()}</strong> and no longer requires action.
          </p>
        </div>
      )}
    </div>
  );
}
