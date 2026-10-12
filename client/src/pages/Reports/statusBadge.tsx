import Badge from "../../components/ui/badge/Badge";
import type { ReportStatus } from "../../model/report";

const statusConfig: Record<
  ReportStatus,
  { color: "warning" | "success" | "error"; label: string }
> = {
  PENDING: { color: "warning", label: "Menunggu" },
  APPROVED: { color: "success", label: "Disetujui" },
  REJECTED: { color: "error", label: "Ditolak" },
};

export default function StatusBadge({ status }: { status: ReportStatus }) {
  const config = statusConfig[status] ?? statusConfig.PENDING;
  return (
    <Badge variant="light" color={config.color}>
      {config.label}
    </Badge>
  );
}
