import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function LoginPage() {
  const { login, user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authenticatedTarget = user?.mustChangePassword
    ? ROUTES.CHANGE_PASSWORD
    : user
      ? getDefaultRouteForRole(user.role)
      : "/";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={authenticatedTarget} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await login({ email, password });

      if (result.mustChangePassword) {
        navigate(ROUTES.CHANGE_PASSWORD, { replace: true });
        return;
      }

      navigate(getDefaultRouteForRole(result.user.role), { replace: true });
    } catch (err) {
      const apiError = err as {
        message?: string;
        pendingApproval?: boolean;
      };

      if (apiError.pendingApproval) {
        navigate(ROUTES.PENDING_APPROVAL, { replace: true });
        return;
      }

      setError(apiError.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border shadow-card">
      <CardHeader>
        <CardTitle>Sign in to MediBridge</CardTitle>
        <CardDescription>
          Enter your credentials to access the referral management platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="space-y-2 pt-2 text-center text-sm text-text-secondary">
            <p>
              <Link
                to={ROUTES.REGISTER_HOSPITAL}
                className="text-primary hover:underline"
              >
                Register a hospital
              </Link>
              {" · "}
              <Link
                to={ROUTES.REGISTER_DOCTOR}
                className="text-primary hover:underline"
              >
                Register as a doctor
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
