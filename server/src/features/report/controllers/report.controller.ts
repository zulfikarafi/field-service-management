import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

import { ReportService } from "../services/report.service";

export class ReportController {
  private reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  private getActor(req: Request) {
    return {
      userId: req.userId as string,
      role: req.role as UserRole,
    };
  }

  // Buat Laporan
  createReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // userId pembuat diambil dari token, bukan dari body
      const response = await this.reportService.createReport({
        ...req.body,
        userId: req.userId as string,
      });

      res.status(response.success ? 201 : 400).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;

      const response = await this.reportService.updateReport(
        {
          id: reportId,
          ...req.body,
        },
        this.getActor(req)
      );

      res.status(response.success ? 200 : 403).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reportId = req.params.reportId;

      const response = await this.reportService.deleteReport(
        reportId,
        this.getActor(req)
      );

      res.status(response.success ? 200 : 403).json(response);
    } catch (error) {
      next(error);
    }
  };

  getReportById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;

      const response = await this.reportService.getReportById(
        reportId,
        this.getActor(req)
      );

      res.status(response.success ? 200 : 403).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Tampilkan Daftar Laporan
  listAllReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, status, searchTerm, skip, take } = req.body;

      const response = await this.reportService.listAllReports(
        this.getActor(req),
        Number(skip ?? 0),
        Number(take ?? 10),
        (searchTerm as string) ?? "",
        userId as string | undefined,
        status
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // Ubah status menjadi APPROVED / REJECTED
  updateReportStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { reportId } = req.params;
      const { status } = req.body;

      const response = await this.reportService.updateReportStatus(
        reportId,
        status,
        this.getActor(req)
      );

      res.status(response.success ? 200 : 403).json(response);
    } catch (error) {
      next(error);
    }
  };
}
