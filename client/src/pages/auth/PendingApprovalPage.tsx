import { Link, useLocation } from "react-router-dom";
import { Clock } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PendingApprovalPage() {
  const location = useLocation();
  const type = (location.state as { type?: string } | null)?.type;

  const description =
    type === "doctor"
      ? "Your doctor registration has been submitted. A hospital administrator will review your request. You will be able to sign in once approved."
      : type === "hospital"
        ? "Your hospital registration has been submitted. A super administrator will review your hospital and admin account. You will be able to sign in once approved."
        : "Your account is pending approval. You will be notified once an administrator reviews your registration.";

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
          <Clock className="h-6 w-6" />
        </div>
        <CardTitle>Pending Approval</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild variant="secondary">
          <Link to={ROUTES.LOGIN}>Back to Sign In</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
