import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { API_BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DoctorAvatarDoctor {
  name: string;
  profilePhoto?: string | null;
}

interface DoctorAvatarProps {
  doctor: DoctorAvatarDoctor;
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
  if (parts.length === 0) return "DR";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getPhotoUrl(photo?: string | null) {
  if (!photo) return undefined;
  if (/^https?:\/\//i.test(photo)) return photo;

  const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
  return `${apiOrigin}${photo.startsWith("/") ? photo : `/${photo}`}`;
}

export function DoctorAvatar({
  doctor,
  size = "md",
  className,
}: DoctorAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {doctor.profilePhoto && (
        <AvatarImage
          src={getPhotoUrl(doctor.profilePhoto)}
          alt={`${doctor.name} profile photo`}
          className="object-cover"
        />
      )}
      <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
    </Avatar>
  );
}
