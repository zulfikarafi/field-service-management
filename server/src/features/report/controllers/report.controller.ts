import { NextFunction, Request, Response } from "express";

import { ReportService } from "../services/report.service";

export class ReportController {
  private reportService: ReportService;

  constructor(reportService: ReportService) {
    this.reportService = reportService;
  }

  createReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.reportService.createReport(req.body);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;

      const response = await this.reportService.updateReport({
        id: reportId,
        ...req.body,
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reportId = req.params.reportId;

      const response = await this.reportService.deleteReport(reportId);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getReportById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportId } = req.params;

      const response = await this.reportService.getReportById(reportId);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  listAllReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, status, searchTerm, skip, take } = req.body;

      const response = await this.reportService.listAllReports(
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
        status
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
