import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReferralStatusBadge } from "@/components/common/StatusBadge";
import { ReferralCard } from "@/features/referrals/components/ReferralCard";
import {
  formatReferralDate,
  getHospitalName,
} from "@/features/referrals/utils/referralUtils";
import type {
  Referral,
  ReferralSortField,
  SortDirection,
} from "@/features/referrals/types/referral.types";
import { cn } from "@/lib/utils";

interface ReferralTableProps {
  referrals: Referral[];
  sortField: ReferralSortField;
  sortDirection: SortDirection;
  onSort: (field: ReferralSortField) => void;
  onSelect: (referral: Referral) => void;
}

interface SortableHeaderProps {
  label: string;
  field: ReferralSortField;
  sortField: ReferralSortField;
  sortDirection: SortDirection;
  onSort: (field: ReferralSortField) => void;
  className?: string;
}

function SortableHeader({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = sortField === field;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1 text-left text-xs font-medium uppercase tracking-wide text-text-secondary hover:text-text-primary",
        className,
      )}
    >
      {label}
      {isActive &&
        (sortDirection === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        ))}
    </button>
  );
}

export function ReferralTable({
  referrals,
  sortField,
  sortDirection,
  onSort,
  onSelect,
}: ReferralTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border border-border bg-white md:block">
        <div className="max-h-[calc(100vh-320px)] overflow-auto">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 border-b border-border bg-gray-50/95 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Patient"
                    field="patientName"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Condition"
                    field="condition"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  <SortableHeader
                    label="From"
                    field="fromHospital"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="To"
                    field="toHospital"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <SortableHeader
                    label="Status"
                    field="status"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </th>
                <th className="hidden px-4 py-3 text-left xl:table-cell">
                  <SortableHeader
                    label="Created"
                    field="createdAt"
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr
                  key={referral._id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(referral)}
                      className="text-left font-medium text-text-primary hover:text-primary"
                    >
                      {referral.patientName}
                    </button>
                    <p className="text-xs text-text-secondary">
                      Age {referral.age}
                    </p>
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-sm text-text-secondary">
                    {referral.condition}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-text-secondary lg:table-cell">
                    {getHospitalName(referral.fromHospital)}
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {getHospitalName(referral.toHospital)}
                  </td>
                  <td className="px-4 py-3">
                    <ReferralStatusBadge status={referral.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-text-secondary xl:table-cell">
                    {formatReferralDate(referral.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => onSelect(referral)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {referrals.map((referral) => (
          <ReferralCard
            key={referral._id}
            referral={referral}
            onClick={onSelect}
          />
        ))}
      </div>
    </>
  );
}
