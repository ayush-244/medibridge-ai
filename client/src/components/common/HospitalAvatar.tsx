import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { API_BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface HospitalAvatarHospital {
  name: string;
  logo?: string | null;
}

interface HospitalAvatarProps {
  hospital: HospitalAvatarHospital;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "H";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getLogoUrl(logo?: string | null) {
  if (!logo) return undefined;
  if (/^https?:\/\//i.test(logo)) return logo;

  const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
  return `${apiOrigin}${logo.startsWith("/") ? logo : `/${logo}`}`;
}

export function HospitalAvatar({
  hospital,
  size = "md",
  className,
}: HospitalAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {hospital.logo && (
        <AvatarImage
          src={getLogoUrl(hospital.logo)}
          alt={`${hospital.name} logo`}
          className="object-cover"
        />
      )}
      <AvatarFallback>{getInitials(hospital.name)}</AvatarFallback>
    </Avatar>
  );
}
