import { ReportStatus } from "@prisma/client";

export interface CreateReportInput {
  name: string;
  description: string;
  status?: ReportStatus;
  location?: string;
  userId: string;
}

export interface UpdateReportInput {
  id: string;
  name?: string;
  description?: string;
  status?: ReportStatus;
  location?: string;
}
