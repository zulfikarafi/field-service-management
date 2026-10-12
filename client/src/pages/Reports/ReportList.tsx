import { useMemo, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TanStackTable from "../../components/tables/Tanstack/TanStackTable";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { useModal } from "../../hooks/useModal";
import { useAuthStore } from "../../store/auth";
import {
  createReport,
  deleteReport,
  listReports,
  updateReport,
  updateReportStatus,
} from "../../api/report";
import type { ReportModel, ReportStatus } from "../../model/report";
import StatusBadge from "./statusBadge";
import ReportFormModal, { ReportFormValues } from "./ReportFormModal";

const statusFilterOptions = [
  { value: "ALL", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
];

const columnHelper = createColumnHelper<ReportModel>();

export default function ReportList() {
  const token = useAuthStore((s) => s.token) ?? "";
  const user = useAuthStore((s) => s.user);
  const isApprover = user?.role === "APPROVER" || user?.role === "ADMIN";
  const isPelapor = user?.role === "PELAPOR";

  const queryClient = useQueryClient();
  const formModal = useModal();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | ReportStatus>("ALL");
  const [editing, setEditing] = useState<ReportModel | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const {
    data: reports,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["reports", pageIndex, pageSize, searchTerm, statusFilter],
    queryFn: () =>
      listReports(
        {
          skip: pageIndex * pageSize,
          take: pageSize,
          searchTerm,
          status: statusFilter === "ALL" ? undefined : statusFilter,
        },
        token
      ),
    enabled: !!token,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["reports"] });

  const createMutation = useMutation({
    mutationFn: (values: ReportFormValues) =>
      createReport(
        {
          name: values.name,
          description: values.description,
          location: values.location || undefined,
        },
        token
      ),
    onSuccess: () => {
      invalidate();
      formModal.closeModal();
      setEditing(null);
    },
    onError: (err: Error) => setMutationError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ReportFormValues }) =>
      updateReport(
        id,
        {
          name: values.name,
          description: values.description,
          location: values.location || undefined,
        },
        token
      ),
    onSuccess: () => {
      invalidate();
      formModal.closeModal();
      setEditing(null);
    },
    onError: (err: Error) => setMutationError(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => updateReportStatus(id, status, token),
    onSuccess: invalidate,
    onError: (err: Error) => window.alert(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReport(id, token),
    onSuccess: invalidate,
    onError: (err: Error) => window.alert(err.message),
  });

  const openCreate = () => {
    setEditing(null);
    setMutationError(null);
    formModal.openModal();
  };

  const openEdit = (report: ReportModel) => {
    setEditing(report);
    setMutationError(null);
    formModal.openModal();
  };

  const handleSubmit = (values: ReportFormValues) => {
    setMutationError(null);
    if (editing) {
      updateMutation.mutate({ id: editing.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleSearch = () => {
    setPageIndex(0);
    setSearchTerm(searchInput.trim());
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        size: 220,
        header: () => "Nama Laporan",
        cell: ({ row: { original } }) => (
          <p className="font-medium text-gray-800 dark:text-white/90">
            {original.name}
          </p>
        ),
      }),
      columnHelper.accessor("description", {
        size: 300,
        header: () => "Deskripsi",
        cell: ({ row: { original } }) => (
          <p className="text-gray-600 line-clamp-2 dark:text-gray-300">
            {original.description}
          </p>
        ),
      }),
      columnHelper.accessor("location", {
        size: 150,
        header: () => "Lokasi",
        cell: ({ row: { original } }) => (
          <p className="text-gray-600 dark:text-gray-300">
            {original.location || "-"}
          </p>
        ),
      }),
      columnHelper.accessor("user", {
        size: 150,
        header: () => "Pelapor",
        cell: ({ row: { original } }) => (
          <p className="text-gray-600 dark:text-gray-300">
            {original.user?.name || "-"}
          </p>
        ),
      }),
      columnHelper.accessor("status", {
        size: 120,
        header: () => "Status",
        cell: ({ row: { original } }) => (
          <StatusBadge status={original.status} />
        ),
      }),
      columnHelper.display({
        id: "actions",
        size: 240,
        header: () => "Aksi",
        cell: ({ row: { original } }) => {
          const canDecide = isApprover && original.status === "PENDING";
          const canModify =
            user?.role === "ADMIN" ||
            (isPelapor &&
              original.status === "PENDING" &&
              original.userId === user?.userId);

          return (
            <div className="flex flex-wrap items-center gap-2">
              {canDecide && (
                <>
                  <button
                    onClick={() =>
                      statusMutation.mutate({
                        id: original.id,
                        status: "APPROVED",
                      })
                    }
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-success-50 text-success-600 hover:bg-success-100 dark:bg-success-500/15 dark:text-success-400"
                  >
                    Setujui
                  </button>
                  <button
                    onClick={() =>
                      statusMutation.mutate({
                        id: original.id,
                        status: "REJECTED",
                      })
                    }
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-error-50 text-error-600 hover:bg-error-100 dark:bg-error-500/15 dark:text-error-400"
                  >
                    Tolak
                  </button>
                </>
              )}
              {canModify && (
                <>
                  <button
                    onClick={() => openEdit(original)}
                    className="px-3 py-1 text-xs font-medium text-gray-700 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Hapus laporan "${original.name}"?`
                        )
                      ) {
                        deleteMutation.mutate(original.id);
                      }
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-lg text-error-600 bg-error-50 hover:bg-error-100 dark:bg-error-500/15 dark:text-error-400"
                  >
                    Hapus
                  </button>
                </>
              )}
              {!canDecide && !canModify && (
                <span className="text-xs text-gray-400">-</span>
              )}
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isApprover, isPelapor, user, statusMutation, deleteMutation]
  );

  // Server returns a page of rows without a total count; approximate page
  // count so the pager can advance while a full page is returned.
  const rowCount = reports?.length ?? 0;
  const estimatedPageCount =
    rowCount < pageSize ? pageIndex + 1 : pageIndex + 2;

  const table = useReactTable({
    data: reports || [],
    columns,
    pageCount: estimatedPageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const showLoader = isLoading && !reports;

  return (
    <>
      <PageMeta
        title="Daftar Laporan | Field Service Management"
        description="Kelola laporan lapangan"
      />
      <PageBreadcrumb pageTitle="Daftar Laporan" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Cari laporan..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={handleSearch}>
                Cari
              </Button>
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={statusFilterOptions}
                defaultValue="ALL"
                placeholder="Status"
                onChange={(value) => {
                  setPageIndex(0);
                  setStatusFilter(value as "ALL" | ReportStatus);
                }}
              />
            </div>
          </div>
          {!isApprover || user?.role === "ADMIN" ? (
            <Button size="sm" onClick={openCreate}>
              + Buat Laporan
            </Button>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          {showLoader ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 rounded-full animate-spin border-brand-500 border-t-transparent"></div>
            </div>
          ) : reports && reports.length > 0 ? (
            <div className={isFetching ? "opacity-60 transition" : ""}>
              <TanStackTable table={table} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada laporan.
              </p>
            </div>
          )}
        </div>
      </div>

      <ReportFormModal
        isOpen={formModal.isOpen}
        onClose={() => {
          formModal.closeModal();
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        error={mutationError}
        initialReport={editing}
      />
    </>
  );
}
