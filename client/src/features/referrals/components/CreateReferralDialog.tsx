import { useCallback, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReferralForm } from "@/features/referrals/components/ReferralForm";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import { useHospitals } from "@/features/hospitals/hooks/useHospitals";
import { useAiSuggestions } from "@/features/referrals/hooks/useAiSuggestions";
import { useCreateReferral } from "@/features/referrals/hooks/useCreateReferral";
import { referralRecommendationsService } from "@/features/referrals/services/referralRecommendations.service";
import type { CreateReferralFormValues } from "@/features/referrals/types/referral.types";
import {
  getInitialReferralFormValues,
  toCreateReferralRequest,
} from "@/features/referrals/utils/referralUtils";
import { useAuth } from "@/hooks/useAuth";
import { showErrorToast } from "@/lib/toast";

interface CreateReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function generateTempId(): string {
  return crypto.randomUUID();
}

export function CreateReferralDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateReferralDialogProps) {
  const { user } = useAuth();
  const { hospitals } = useHospitals();
  const { doctors } = useDoctors();
  const { createReferral, isSubmitting } = useCreateReferral();

  const tempIdRef = useRef<string>(generateTempId());
  const ai = useAiSuggestions(tempIdRef.current);

  const defaultFromHospitalId =
    user?.role === "SUPER_ADMIN" ? null : user?.hospital;

  const [values, setValues] = useState<CreateReferralFormValues>(() =>
    getInitialReferralFormValues(defaultFromHospitalId),
  );

  const [isExtractionApplied, setIsExtractionApplied] = useState(false);

  const updateField = useCallback(
    <K extends keyof CreateReferralFormValues>(
      field: K,
      value: CreateReferralFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleGenerate = useCallback(() => {
    ai.generateSuggestions({
      patientName: values.patientName,
      age: values.age,
      condition: values.diagnosis + ". " + values.conditionSummary,
      originHospitalId: values.fromHospital,
    });
  }, [values.patientName, values.age, values.diagnosis, values.conditionSummary, values.fromHospital, ai.generateSuggestions]);

  const handleApplyExtraction = useCallback(() => {
    const data = ai.extractionData;
    if (!data) return;

    if (data.patientName) {
      updateField("patientName", data.patientName);
    }
    if (data.age != null) {
      updateField("age", String(data.age));
    }
    if (data.gender) {
      updateField("gender", data.gender as CreateReferralFormValues["gender"]);
    }
    if (data.diagnosis) {
      updateField("diagnosis", data.diagnosis);
    }
    if (data.conditionSummary) {
      updateField("conditionSummary", data.conditionSummary);
    }
    if (data.priority) {
      updateField("priority", data.priority as CreateReferralFormValues["priority"]);
    }
    if (data.requiredSpecialty) {
      updateField("requiredSpecialty", data.requiredSpecialty);
    }

    setIsExtractionApplied(true);

    // Use a microtask to ensure form state is settled before triggering recommendations
    setTimeout(() => {
      ai.generateSuggestions({
        patientName: data.patientName ?? values.patientName,
        age: data.age != null ? String(data.age) : values.age,
        condition: (data.diagnosis ?? values.diagnosis) + ". " + (data.conditionSummary ?? values.conditionSummary),
        originHospitalId: values.fromHospital,
      });
    }, 0);
  }, [ai.extractionData, ai.generateSuggestions, updateField, values.patientName, values.age, values.diagnosis, values.conditionSummary, values.fromHospital]);

  const handleApplySpecialist = useCallback(
    (specialist: string) => {
      updateField("requiredSpecialty", specialist);
    },
    [updateField],
  );

  const handleSelectDestinationHospital = useCallback(
    (hospitalId: string) => {
      updateField("toHospital", hospitalId);
    },
    [updateField],
  );

  const handleUpload = useCallback(
    (file: File) => {
      ai.uploadDocument(file);
    },
    [ai.uploadDocument],
  );

  const handleSubmit = async (formValues: CreateReferralFormValues) => {
    if (!user?.id) {
      return;
    }

    let payload;
    try {
      payload = toCreateReferralRequest(formValues, user.id);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid referral details";
      showErrorToast(message);
      return;
    }

    const referral = await createReferral(payload);

    if (referral) {
      try {
        await referralRecommendationsService.reScopeDocuments({
          fromPatientId: tempIdRef.current,
          toPatientId: referral._id,
        });
      } catch {
        // Best-effort re-scope; documents remain accessible via tempId
      }

      onOpenChange(false);
      onSuccess?.();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          tempIdRef.current = generateTempId();
          setValues(getInitialReferralFormValues(defaultFromHospitalId));
          setIsExtractionApplied(false);
          ai.resetAll();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Referral</DialogTitle>
          <DialogDescription>
            Submit a new patient referral to route care between hospitals.
          </DialogDescription>
        </DialogHeader>

        <div>
          <ReferralForm
            key={`${open}-${defaultFromHospitalId ?? "all"}`}
            hospitals={hospitals}
            doctors={doctors}
            defaultFromHospitalId={defaultFromHospitalId}
            isSubmitting={isSubmitting}
            values={values}
            onUpdateField={updateField}
            onSubmit={(formValues) => void handleSubmit(formValues)}
            onCancel={() => onOpenChange(false)}

            onUploadDocument={handleUpload}
            isUploading={ai.isUploading}
            docProgress={ai.progress}
            docError={ai.docError}
            uploadedFileName={ai.uploadedFileName}
            onResetUpload={ai.resetUpload}

            isGenerating={ai.isGenerating}
            specialist={ai.specialist}
            aiHospitalRecommendations={ai.hospitals}
            aiError={ai.error}
            onGenerateAi={handleGenerate}
            onClearAi={ai.clearSuggestions}
            onApplySpecialist={handleApplySpecialist}
            onSelectDestinationHospital={handleSelectDestinationHospital}

            isExtracting={ai.isExtracting}
            extractionData={ai.extractionData}
            extractionError={ai.extractionError}
            isExtractionApplied={isExtractionApplied}
            onExtract={ai.extractReferralData}
            onApplyExtraction={handleApplyExtraction}
            onDiscardExtraction={ai.discardExtraction}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
