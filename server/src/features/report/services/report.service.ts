import { unifiedResponse } from "uni-response";
import { ReportStatus, UserRole } from "@prisma/client";
import { ERROR, SUCCESS } from "../../../constants/messages";
import { ReportRepository } from "../repositories/report.repository";
import { CreateReportInput, UpdateReportInput } from "../types/report.type";

interface ActingUser {
  userId: string;
  role: UserRole;
}

export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(data: CreateReportInput) {
    const report = await this.reportRepository.createReport(data);

    return unifiedResponse(true, SUCCESS.REPORT_CREATED, report);
  }

  async updateReport(data: UpdateReportInput, actor: ActingUser) {
    const existing = await this.reportRepository.findReportById(data.id);

    if (!existing) {
      return unifiedResponse(false, ERROR.REPORT_NOT_FOUND);
    }

    // Pelapor hanya boleh mengedit laporan miliknya sendiri
    if (actor.role === UserRole.PELAPOR && existing.userId !== actor.userId) {
      return unifiedResponse(false, ERROR.FORBIDDEN_REPORT_EDIT);
    }

    // Pelapor hanya boleh mengedit selama status masih PENDING
    if (
      actor.role === UserRole.PELAPOR &&
      existing.status !== ReportStatus.PENDING
    ) {
      return unifiedResponse(false, ERROR.REPORT_EDIT_ONLY_PENDING);
    }

    const report = await this.reportRepository.updateReport(data);

    return unifiedResponse(true, SUCCESS.REPORT_UPDATED, report);
  }

  async deleteReport(reportId: string, actor: ActingUser) {
    const existing = await this.reportRepository.findReportById(reportId);

    if (!existing) {
      return unifiedResponse(false, ERROR.REPORT_NOT_FOUND);
    }

    // Pelapor hanya boleh menghapus laporan miliknya sendiri
    if (actor.role === UserRole.PELAPOR && existing.userId !== actor.userId) {
      return unifiedResponse(false, ERROR.FORBIDDEN_REPORT_EDIT);
    }

    const report = await this.reportRepository.deleteReport(reportId);

    return unifiedResponse(true, SUCCESS.REPORT_DELETED, report);
  }

  async getReportById(reportId: string, actor: ActingUser) {
    const report = await this.reportRepository.findReportById(reportId);

    if (!report) {
      return unifiedResponse(false, ERROR.REPORT_NOT_FOUND);
    }

    // Pelapor hanya boleh melihat laporan miliknya sendiri
    if (actor.role === UserRole.PELAPOR && report.userId !== actor.userId) {
      return unifiedResponse(false, ERROR.FORBIDDEN_REPORT_ACCESS);
    }

    return unifiedResponse(true, SUCCESS.REPORT_FOUND, report);
  }

  async listAllReports(
    actor: ActingUser,
    skip = 0,
    take = 10,
    searchTerm = "",
    userId?: string,
    status?: ReportStatus
  ) {
    // Pelapor hanya dapat melihat laporan yang dibuatnya sendiri
    const effectiveUserId =
      actor.role === UserRole.PELAPOR ? actor.userId : userId;

    const reports = await this.reportRepository.listAllReports(
      skip,
      take,
      searchTerm,
      effectiveUserId,
      status
    );

    return unifiedResponse(true, SUCCESS.REPORT_FOUND, reports);
  }

  async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    actor: ActingUser
  ) {
    // Hanya Approver (atau Admin) yang dapat mengubah status
    if (actor.role !== UserRole.APPROVER && actor.role !== UserRole.ADMIN) {
      return unifiedResponse(false, ERROR.FORBIDDEN_STATUS_UPDATE);
    }

    const existing = await this.reportRepository.findReportById(reportId);

    if (!existing) {
      return unifiedResponse(false, ERROR.REPORT_NOT_FOUND);
    }

    const report = await this.reportRepository.updateReportStatus(
      reportId,
      status,
      actor.userId
    );

    return unifiedResponse(true, SUCCESS.REPORT_STATUS_UPDATED, report);
  }
}
