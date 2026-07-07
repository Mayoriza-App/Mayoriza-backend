import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

/**
 * Service to handle database connections and operations via Prisma ORM.
 * Implements OnModuleInit and OnModuleDestroy to manage connection lifecycle.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  /**
   * Connects to the database when the module initializes.
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Database connection established successfully');
    } catch (error) {
      this.logger.error('Failed to establish database connection', error);
      throw error;
    }
  }

  /**
   * Disconnects from the database when the module destroys.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Database connection closed');
  }
}
