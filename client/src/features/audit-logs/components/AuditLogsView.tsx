import { useMemo, useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterBar } from "@/components/common/FilterBar";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useAuditLogs } from "@/features/audit-logs/hooks/useAuditLogs";
import { formatActivityDate } from "@/features/audit-logs/utils/auditLogUtils";

const MODULES = [
  "ALL",
  "Referral",
  "User",
  "Doctor",
  "Hospital",
  "Reservation",
] as const;

type ModuleFilter = (typeof MODULES)[number];

export function AuditLogsView() {
  const { activities, isLoading, error, refetch } = useAuditLogs();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("ALL");
  const debouncedSearch = useDebounce(search);

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    return activities.filter((a) => {
      if (moduleFilter !== "ALL" && a.entityType !== moduleFilter) {
        return false;
      }
      if (!query) return true;
      return (
        a.action.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.performedBy.toLowerCase().includes(query) ||
        a.entityType.toLowerCase().includes(query)
      );
    });
  }, [activities, debouncedSearch, moduleFilter]);

  const { paginatedItems, page, totalPages, goToPage, hasNext, hasPrev } =
    usePagination(filtered, 15);

  if (error && !isLoading) {
    return (
      <div className="page-container space-y-6">
        <PageHeader
          title="Audit Logs"
          description="System activity and change history."
        />
        <EmptyState
          title="Failed to load audit logs"
          description={error}
          icon={<ClipboardList className="h-6 w-6" />}
          action={
            <Button onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Audit Logs"
        description="System activity and change history across all modules."
        action={
          <p className="text-sm text-text-secondary">
            {isLoading ? "Loading..." : `${filtered.length} entries`}
          </p>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by action, user, or details..."
          className="flex-1 lg:max-w-md"
        />
        <FilterBar
          filters={[
            {
              id: "module-filter",
              label: "Module",
              value: moduleFilter,
              onChange: (v) => setModuleFilter(v as ModuleFilter),
              options: MODULES.map((m) => ({
                label: m === "ALL" ? "All Modules" : m,
                value: m,
              })),
            },
          ]}
        />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 border-b border-border px-4 py-4"
              >
                {Array.from({ length: 5 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-4 flex-1 animate-pulse rounded bg-gray-100"
                  />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="Activity will appear here as users perform actions."
          icon={<ClipboardList className="h-6 w-6" />}
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="max-h-[calc(100vh-320px)] overflow-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="sticky top-0 z-10 border-b border-border bg-gray-50/95 backdrop-blur-sm">
                    <tr>
                      {["Timestamp", "User", "Action", "Module", "Details"].map(
                        (label) => (
                          <th
                            key={label}
                            className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary"
                          >
                            {label}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((log) => (
                      <tr
                        key={log._id}
                        className="border-b border-border last:border-0 hover:bg-gray-50/50"
                      >
                        <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                          {formatActivityDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {log.performedBy === "SYSTEM"
                            ? "System"
                            : log.performedBy}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-text-primary">
                          {log.action.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {log.entityType}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">
                          {log.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!hasNext}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
