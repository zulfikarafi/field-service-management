import { z } from "zod";
import { ReportStatus } from "@prisma/client";

export const createReportSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),

  description: z.string().min(1, {
    message: "Description is required",
  }),

  status: z
    .nativeEnum(ReportStatus, {
      message: "Invalid report status",
    })
    .optional(),

  location: z.string().optional(),
});

export const updateReportSchema = z.object({
  name: z.string().min(1).optional(),

  description: z.string().min(1).optional(),

  status: z.nativeEnum(ReportStatus).optional(),

  location: z.string().optional(),
});

export const getReportByIdSchema = z.object({
  reportId: z.string().min(1, {
    message: "Report ID is required",
  }),
});


export const updateReportStatusSchema = z.object({
  status: z.enum([ReportStatus.APPROVED, ReportStatus.REJECTED], {
    message: "Status must be either APPROVED or REJECTED",
  }),
});


export const listReportsSchema = z.object({
  userId: z.string().optional(),

  status: z.nativeEnum(ReportStatus).optional(),

  searchTerm: z.string().optional(),

  skip: z.coerce.number().min(0).default(0),

  take: z.coerce.number().min(1).max(100).default(10),
});
