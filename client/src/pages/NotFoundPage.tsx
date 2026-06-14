import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NotFoundPage() {
  const { user } = useAuth();
  const dashboardRoute = user
    ? getDefaultRouteForRole(user.role)
    : ROUTES.DASHBOARD;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileQuestion className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you are looking for does not exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to={dashboardRoute}>Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
