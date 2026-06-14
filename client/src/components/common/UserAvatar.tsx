import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { API_BASE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UserAvatarUser {
  name?: string;
  email?: string;
  profilePhoto?: string | null;
}

interface UserAvatarProps {
  user: UserAvatarUser;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

function getInitials(name?: string, email?: string) {
  if (name) {
    const initials = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    if (initials) return initials;
  }

  return email?.slice(0, 2).toUpperCase() || "MB";
}

function getPhotoUrl(photo?: string | null) {
  if (!photo) return undefined;
  if (/^https?:\/\//i.test(photo)) return photo;

  const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
  return `${apiOrigin}${photo.startsWith("/") ? photo : `/${photo}`}`;
}

export function UserAvatar({
  user,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {user.profilePhoto && (
        <AvatarImage
          src={getPhotoUrl(user.profilePhoto)}
          alt={`${user.name || user.email || "User"} profile photo`}
          className="object-cover"
        />
      )}
      <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
    </Avatar>
  );
}
