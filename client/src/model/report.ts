export type ReportStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReportAuthor {
  id: string;
  name: string;
  email?: string;
}

export interface ReportDecider {
  id: string;
  name: string;
}

export interface ReportModel {
  id: string;
  name: string;
  description: string;
  status: ReportStatus;
  location?: string | null;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  user?: ReportAuthor;
  decidedById?: string | null;
  decidedAt?: string | null;
  decidedBy?: ReportDecider | null;
}

export interface CreateReportPayload {
  name: string;
  description: string;
  location?: string;
}

export interface UpdateReportPayload {
  name?: string;
  description?: string;
  location?: string;
}

export interface ListReportsParams {
  skip?: number;
  take?: number;
  searchTerm?: string;
  userId?: string;
  status?: ReportStatus;
}
