import { PrismaClient, ReportStatus } from "@prisma/client";

export class ReportRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createReport(data: {
    name: string;
    description: string;
    status?: ReportStatus;
    location?: string;
    userId: string;
  }) {
    return this.prisma.report.create({
      data,
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        location: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateReport(data: {
    id: string;
    name?: string;
    description?: string;
    status?: ReportStatus;
    location?: string;
  }) {
    const { id, ...payload } = data;

    return this.prisma.report.update({
      where: {
        id,
      },
      data: payload,
      select: {
        id: true,
      },
    });
  }

  async deleteReport(reportId: string) {
    return this.prisma.report.delete({
      where: {
        id: reportId,
      },
      select: {
        id: true,
      },
    });
  }

  async findReportById(reportId: string) {
    return this.prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async listAllReports(
    skip = 0,
    take = 10,
    searchTerm = "",
    userId?: string,
    status?: ReportStatus
  ) {
    return this.prisma.report.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },

      skip,
      take,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        location: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateReportStatus(reportId: string, status: ReportStatus) {
    return this.prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status,
      },
      select: {
        id: true,
        status: true,
      },
    });
  }
}
