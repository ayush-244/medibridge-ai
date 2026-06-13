import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <ShieldAlert className="h-6 w-6 text-warning" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild>
            <Link to={ROUTES.DASHBOARD}>Go to Dashboard</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to={ROUTES.LOGIN}>Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
