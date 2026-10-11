import { unifiedResponse } from "uni-response";
import { ReportStatus } from "@prisma/client";
import { ERROR, SUCCESS } from "../../../constants/messages";
import { ReportRepository } from "../repositories/report.repository";
import { CreateReportInput, UpdateReportInput } from "../types/report.type";

export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(data: CreateReportInput) {
    const report = await this.reportRepository.createReport(data);

    return unifiedResponse(true, SUCCESS.REPORT_CREATED, report);
  }

  async updateReport(data: UpdateReportInput) {
    const existing = await this.reportRepository.findReportById(data.id);

    if (!existing) {
      return unifiedResponse(false, ERROR.REPORT_NOT_FOUND);
    }

    const report = await this.reportRepository.updateReport(data);

    return unifiedResponse(true, SUCCESS.REPORT_UPDATED, report);
  }

  async deleteReport(reportId: string) {
    const existing = await this.reportRepository.findReportById(reportId);

    if (!existing) {
      return unifiedResponse(false, ERROR.REPORT_NOT_FOUND);
    }

    const report = await this.reportRepository.deleteReport(reportId);

    return unifiedResponse(true, SUCCESS.REPORT_DELETED, report);
  }

  async getReportById(reportId: string) {
    const report = await this.reportRepository.findReportById(reportId);

    if (!report) {
      return unifiedResponse(false, ERROR.REPORT_NOT_FOUND);
    }

    return unifiedResponse(true, SUCCESS.REPORT_FOUND, report);
  }

  async listAllReports(
    skip = 0,
    take = 10,
    searchTerm = "",
    userId?: string,
    status?: ReportStatus
  ) {
    const reports = await this.reportRepository.listAllReports(
      skip,
      take,
      searchTerm,
      userId,
      status
    );

    return unifiedResponse(true, SUCCESS.REPORT_FOUND, reports);
  }

  async updateReportStatus(reportId: string, status: ReportStatus) {
    const existing = await this.reportRepository.findReportById(reportId);

    if (!existing) {
      return unifiedResponse(false, ERROR.REPORT_NOT_FOUND);
    }

    const report = await this.reportRepository.updateReportStatus(
      reportId,
      status
    );

    return unifiedResponse(true, SUCCESS.REPORT_STATUS_UPDATED, report);
  }
}
