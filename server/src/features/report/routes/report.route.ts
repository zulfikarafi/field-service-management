import { Router } from "express";

import { PrismaService } from "../../../config/prisma.config";
import { auth } from "../../../middleware/auth.middleware";
import { validateRequest } from "../../../middleware/validation.middleware";
import { ReportController } from "../controllers/report.controller";
import { ReportRepository } from "../repositories/report.repository";
import {
  createReportSchema,
  listReportsSchema,
  updateReportSchema,
  updateReportStatusSchema,
} from "../schemas/report.schema";
import { ReportService } from "../services/report.service";

// Dependency Injection
const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;

const reportRepository = new ReportRepository(prisma);
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

const router = Router();

router.post(
  "/create",
  auth,
  validateRequest(createReportSchema),
  reportController.createReport
);

router.post(
  "/",
  auth,
  validateRequest(listReportsSchema),
  reportController.listAllReports
);

router.put(
  "/:reportId",
  auth,
  validateRequest(updateReportSchema),
  reportController.updateReport
);

router.patch(
  "/:reportId/status",
  auth,
  validateRequest(updateReportStatusSchema),
  reportController.updateReportStatus
);

router.delete("/:reportId", auth, reportController.deleteReport);

// reportId berasal dari route param (bukan body), jadi tidak perlu
// validateRequest yang memeriksa req.body. Keberadaan/not-found ditangani service.
router.get("/:reportId", auth, reportController.getReportById);

export default router;
