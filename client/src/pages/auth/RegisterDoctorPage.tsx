import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { hospitalService } from "@/features/hospitals/services/hospital.service";
import { ROUTES } from "@/lib/routes";
import { SPECIALIZATIONS } from "@/lib/constants/specializations";
import {
  getEmailError,
  getPasswordError,
  getPhoneError,
} from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Hospital } from "@/features/hospitals/types/hospital.types";

export function RegisterDoctorPage() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await hospitalService.getApproved();
        setHospitals(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load hospitals",
        );
      } finally {
        setLoadingHospitals(false);
      }
    };

    void load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const emailError = getEmailError(email, true);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (phone) {
      const phoneError = getPhoneError(phone, false);
      if (phoneError) {
        setError(phoneError);
        return;
      }
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!specialization) {
      setError("Please select a specialization.");
      return;
    }

    if (!hospitalId) {
      setError("Please select a hospital.");
      return;
    }

    setSubmitting(true);

    try {
      await authService.registerDoctor({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        specialization,
        experience: experience ? Number(experience) : undefined,
        hospitalId,
      });

      navigate(ROUTES.PENDING_APPROVAL, {
        replace: true,
        state: { type: "doctor" },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Registration failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle>Doctor Registration</CardTitle>
        <CardDescription>
          Register as a doctor at an approved hospital. Your hospital admin
          will review your request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          {error && (
            <div className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone (optional)</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hospital</label>
            <Select
              value={hospitalId}
              onValueChange={setHospitalId}
              disabled={loadingHospitals}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingHospitals
                      ? "Loading hospitals..."
                      : "Select hospital"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital._id} value={hospital._id}>
                    {hospital.name} — {hospital.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialization</label>
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Experience (years)</label>
              <Input
                type="number"
                min={0}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-sm text-text-secondary">
              Already registered?{" "}
              <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <Button type="submit" disabled={submitting || loadingHospitals}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
