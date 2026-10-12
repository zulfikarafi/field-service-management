import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { useAuthStore } from "../../store/auth";
import { listReports } from "../../api/report";
import type { ReportModel, ReportStatus } from "../../model/report";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  PELAPOR: "Pelapor",
  APPROVER: "Approver",
};

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function Home() {
  const token = useAuthStore((s) => s.token) ?? "";
  const user = useAuthStore((s) => s.user);

  const { data: reports } = useQuery({
    queryKey: ["reports", "dashboard"],
    queryFn: () => listReports({ skip: 0, take: 100 }, token),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const list: ReportModel[] = reports || [];
  const countBy = (status: ReportStatus) =>
    list.filter((r) => r.status === status).length;

  return (
    <>
      <PageMeta
        title="Dashboard | Field Service Management"
        description="Ringkasan laporan lapangan"
      />

      <div className="mb-6 rounded-2xl border border-gray-200 bg-brand-50 p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Selamat datang di Field Service Management
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Anda masuk sebagai{" "}
          <span className="font-medium text-brand-600 dark:text-brand-400">
            {user ? roleLabel[user.role] : "-"}
          </span>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Laporan"
          value={list.length}
          color="text-gray-800 dark:text-white/90"
        />
        <StatCard
          label="Menunggu"
          value={countBy("PENDING")}
          color="text-warning-500"
        />
        <StatCard
          label="Disetujui"
          value={countBy("APPROVED")}
          color="text-success-500"
        />
        <StatCard
          label="Ditolak"
          value={countBy("REJECTED")}
          color="text-error-500"
        />
      </div>

      <Link
        to="/reports"
        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
      >
        Lihat Daftar Laporan
      </Link>
    </>
  );
}
