import type { UserRole, UserStatus } from "@/lib/constants";
import { isStandardSpecialization } from "@/lib/constants/specializations";
import { getEmailError } from "@/lib/validation";
import type { User, UserFilters } from "@/features/users/types/user.types";

export function getUserStatus(user: User): UserStatus {
  if (!user.isActive || user.verificationStatus === "REJECTED") {
    return "DEACTIVATED";
  }
  if (!user.isVerified || user.verificationStatus === "PENDING") {
    return "PENDING";
  }
  return "ACTIVE";
}

export function getHospitalName(
  hospital: User["hospital"],
): string {
  if (!hospital) return "—";
  if (typeof hospital === "string") return hospital;
  return hospital.name;
}

export function filterUsers(users: User[], filters: UserFilters): User[] {
  const search = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    if (filters.role !== "ALL" && user.role !== filters.role) {
      return false;
    }

    if (!search) return true;

    const hospitalName = getHospitalName(user.hospital).toLowerCase();

    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.role.toLowerCase().includes(search) ||
      hospitalName.includes(search)
    );
  });
}

export function formatUserDate(date?: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRoleLabel(role: UserRole): string {
  return role.replace(/_/g, " ");
}

export function isValidEmail(email: string): boolean {
  return getEmailError(email) === null;
}

export function validateCreateUserForm(values: {
  name: string;
  email: string;
  role: string;
  hospital: string;
  specialization: string;
}): string | null {
  if (!values.name.trim()) return "Name is required";
  const emailError = getEmailError(values.email, true);
  if (emailError) return emailError;
  if (!values.role) return "Role is required";

  if (
    ["HOSPITAL_ADMIN", "REFERRAL_COORDINATOR", "DOCTOR"].includes(
      values.role,
    ) &&
    !values.hospital
  ) {
    return "Hospital is required for this role";
  }

  if (values.role === "DOCTOR" && !values.specialization.trim()) {
    return "Specialization is required for doctors";
  }

  if (
    values.role === "DOCTOR" &&
    !isStandardSpecialization(values.specialization)
  ) {
    return "Select a valid specialization for doctors";
  }

  return null;
}
