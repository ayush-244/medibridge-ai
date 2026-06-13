import { Settings } from "lucide-react";
import { PagePlaceholder } from "@/components/common/PagePlaceholder";

export function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings"
      description="Account preferences and system configuration."
      icon={<Settings className="h-6 w-6" />}
    />
  );
}
