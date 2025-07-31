import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async cancelExpiredPendingSessions() {
    this.logger.log('Starting job to cancel expired pending sessions...');

    try {
      const now = new Date();

      const expiredSessions = await this.prisma.session.findMany({
        where: {
          status: 'PENDING',
          startUtc: {
            lt: now,
          },
        },
        select: {
          id: true,
          startUtc: true,
          patientName: true,
        },
      });

      if (expiredSessions.length === 0) {
        this.logger.log('No expired pending sessions found');
        return;
      }

      const result = await this.prisma.session.updateMany({
        where: {
          id: {
            in: expiredSessions.map(session => session.id),
          },
        },
        data: {
          status: 'CANCELED',
          canceledAt: now,
        },
      });

      this.logger.log(
        `Successfully canceled ${result.count} expired pending sessions`,
      );

      expiredSessions.forEach(session => {
        this.logger.log(
          `Canceled session ${session.id} for patient ${session.patientName} (scheduled for ${session.startUtc.toISOString()})`,
        );
      });
    } catch (error) {
      this.logger.error(
        'Error occurred while canceling expired pending sessions',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.stack,
      );
    }
  }
}
