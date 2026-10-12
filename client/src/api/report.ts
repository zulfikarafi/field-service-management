import { apiRequest } from "./http";
import type {
  CreateReportPayload,
  ListReportsParams,
  ReportModel,
  ReportStatus,
  UpdateReportPayload,
} from "../model/report";

// POST /v1/reports/create - Buat laporan
export const createReport = async (
  payload: CreateReportPayload,
  token: string
): Promise<ReportModel> => {
  return apiRequest<ReportModel>("/reports/create", {
    method: "POST",
    token,
    body: payload,
  });
};

// POST /v1/reports - Tampilkan daftar laporan (dengan paginasi & filter)
export const listReports = async (
  params: ListReportsParams,
  token: string
): Promise<ReportModel[]> => {
  return apiRequest<ReportModel[]>("/reports", {
    method: "POST",
    token,
    body: {
      skip: params.skip ?? 0,
      take: params.take ?? 10,
      searchTerm: params.searchTerm ?? "",
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.status ? { status: params.status } : {}),
    },
  });
};

// GET /v1/reports/:reportId - Detail laporan
export const getReportById = async (
  reportId: string,
  token: string
): Promise<ReportModel> => {
  return apiRequest<ReportModel>(`/reports/${reportId}`, {
    method: "GET",
    token,
  });
};

// PUT /v1/reports/:reportId - Update laporan
export const updateReport = async (
  reportId: string,
  payload: UpdateReportPayload,
  token: string
): Promise<ReportModel> => {
  return apiRequest<ReportModel>(`/reports/${reportId}`, {
    method: "PUT",
    token,
    body: payload,
  });
};

// PATCH /v1/reports/:reportId/status - Ubah status menjadi APPROVED / REJECTED
export const updateReportStatus = async (
  reportId: string,
  status: Extract<ReportStatus, "APPROVED" | "REJECTED">,
  token: string
): Promise<ReportModel> => {
  return apiRequest<ReportModel>(`/reports/${reportId}/status`, {
    method: "PATCH",
    token,
    body: { status },
  });
};

// DELETE /v1/reports/:reportId - Hapus laporan
export const deleteReport = async (
  reportId: string,
  token: string
): Promise<{ id: string }> => {
  return apiRequest<{ id: string }>(`/reports/${reportId}`, {
    method: "DELETE",
    token,
  });
};
