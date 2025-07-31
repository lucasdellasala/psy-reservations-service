import {
  Injectable,
  ConflictException,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DbService } from '../prisma/db.service';
import { TherapistsService } from '../therapists/therapists.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { DateTime } from 'luxon';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dbService: DbService,
    private readonly therapistsService: TherapistsService,
  ) {}

  async createSession(
    createSessionDto: CreateSessionDto,
    idempotencyKey: string,
  ) {
    const {
      therapistId,
      sessionTypeId,
      startUtc,
      patientId,
      patientName,
      patientEmail,
      patientTz,
    } = createSessionDto;

    const existingSession = await this.prisma.session.findFirst({
      where: { idempotencyKey },
    });

    if (existingSession) {
      return existingSession;
    }

    const sessionType = await this.prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
      select: { durationMin: true, modality: true },
    });

    if (!sessionType) {
      throw new UnprocessableEntityException('Session type not found');
    }

    const startDateTime = DateTime.fromISO(startUtc);
    const endDateTime = startDateTime.plus({
      minutes: sessionType.durationMin,
    });
    const endUtc = endDateTime.toISO() || '';

    const weekStart = startDateTime.startOf('week').toISODate() || '';
    const isValidWindow = await this.validateAvailabilityWindow(
      therapistId,
      weekStart,
      sessionType.modality,
      startUtc,
      endUtc,
      sessionTypeId,
    );

    if (!isValidWindow) {
      throw new UnprocessableEntityException('OUT_OF_WINDOW');
    }

    const session = await this.dbService.withTherapistLock(
      therapistId,
      async tx => {
        const hasOverlap = await this.therapistsService.hasOverlap(
          therapistId,
          startUtc,
          endUtc,
        );

        if (hasOverlap) {
          throw new ConflictException('SLOT_TAKEN');
        }

        return await tx.session.create({
          data: {
            therapistId,
            sessionTypeId,
            patientId,
            patientName,
            patientEmail,
            startUtc: startDateTime.toJSDate(),
            endUtc: endDateTime.toJSDate(),
            patientTz,
            status: 'CONFIRMED',
            idempotencyKey,
          },
        });
      },
    );

    return session;
  }

  async findOne(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        sessionType: {
          select: {
            name: true,
            durationMin: true,
            modality: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const startInPatientTz = DateTime.fromJSDate(session.startUtc)
      .setZone(session.patientTz)
      .toISO();
    const endInPatientTz = DateTime.fromJSDate(session.endUtc)
      .setZone(session.patientTz)
      .toISO();

    return {
      ...session,
      startInPatientTz,
      endInPatientTz,
    };
  }

  async cancelSession(id: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.status === 'CANCELED') {
      return session;
    }

    const updatedSession = await this.prisma.session.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    return updatedSession;
  }

  private async validateAvailabilityWindow(
    therapistId: string,
    weekStart: string,
    modality: string,
    startUtc: string,
    endUtc: string,
    sessionTypeId: string,
  ): Promise<boolean> {
    const weeklyAvailability = await this.therapistsService.getAvailability(
      therapistId,
      sessionTypeId,
      weekStart,
      'UTC',
      15,
    );

    const startDateTime = DateTime.fromISO(startUtc);
    const endDateTime = DateTime.fromISO(endUtc);
    const targetDate = startDateTime.toISODate();

    const dayAvailability = weeklyAvailability.availability[targetDate || ''];
    if (!dayAvailability || dayAvailability.length === 0) {
      return false;
    }

    return dayAvailability.some((window: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const windowStart = DateTime.fromISO(window.startUtc as string);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const windowEnd = DateTime.fromISO(window.endUtc as string);

      return windowStart <= startDateTime && windowEnd >= endDateTime;
    });
  }
}
