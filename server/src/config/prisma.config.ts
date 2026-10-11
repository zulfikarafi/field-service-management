import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

export class PrismaService {
  private static instance: PrismaService | null = null;
  private prismaClient: PrismaClient;

  private constructor() {
    // 1. Buat pool koneksi menggunakan library 'pg'
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. Buat adapter Prisma untuk PostgreSQL
    const adapter = new PrismaPg(pool);

    // 3. Masukkan adapter ke dalam constructor PrismaClient
    this.prismaClient = new PrismaClient({ adapter });
  }

  public static getInstance(): PrismaService {
    if (!this.instance) {
      this.instance = new PrismaService();
    }
    return this.instance;
  }

  public get client(): PrismaClient {
    return this.prismaClient;
  }

  public async disconnect(): Promise<void> {
    await this.prismaClient.$disconnect();
  }
}