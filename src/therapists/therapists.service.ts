import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindTherapistsDto } from './dto/find-therapists.dto';
import { AvailabilityService } from './services/availability.service';
import { TimeService } from '../common/services/time.service';
import { DateTime } from 'luxon';
import {
  AvailabilityResponse,
  BookableSlot,
} from './interfaces/availability.interface';

@Injectable()
export class TherapistsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
    private readonly timeService: TimeService,
  ) {}

  async findOne(id: string) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        timezone: true,
        therapistTopics: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        sessionTypes: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            modality: true,
          },
          orderBy: {
            durationMin: 'asc',
          },
        },
      },
    });

    if (!therapist) {
      return null;
    }

    const modalities = [
      ...new Set(therapist.sessionTypes.map(st => st.modality)),
    ];

    return {
      id: therapist.id,
      name: therapist.name,
      timezone: therapist.timezone,
      topics: therapist.therapistTopics.map(tt => tt.topic),
      modalities,
      sessionTypes: therapist.sessionTypes,
    };
  }

  async findSessionTypes(therapistId: string) {
    return this.prisma.sessionType.findMany({
      where: { therapistId },
      select: {
        id: true,
        name: true,
        durationMin: true,
        modality: true,
      },
      orderBy: {
        durationMin: 'asc',
      },
    });
  }

  async findAll() {
    const therapists = await this.prisma.therapist.findMany({
      select: {
        id: true,
        name: true,
        timezone: true,
        therapistTopics: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        sessionTypes: {
          select: {
            modality: true,
          },
        },
      },
    });

    return therapists.map(therapist => {
      const modalities = [
        ...new Set(therapist.sessionTypes.map(st => st.modality)),
      ];

      return {
        id: therapist.id,
        name: therapist.name,
        timezone: therapist.timezone,
        topics: therapist.therapistTopics.map(tt => tt.topic),
        modalities,
      };
    });
  }

  async findWithFilters(filters: FindTherapistsDto) {
    const {
      topicIds,
      requireAll,
      modality,
      limit = 10,
      offset = 0,
      weekStart,
      sessionTypeId,
      stepMin = 15,
      orderBy,
    } = filters;

    let therapists = await this.prisma.therapist.findMany({
      select: {
        id: true,
        name: true,
        timezone: true,
        therapistTopics: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        sessionTypes: {
          select: {
            modality: true,
          },
        },
      },
    });

    if (topicIds) {
      const topicIdsArray = topicIds.split(',').map(id => id.trim());

      therapists = therapists.filter(therapist => {
        const therapistTopicIds = therapist.therapistTopics.map(
          tt => tt.topic.id,
        );

        if (requireAll) {
          return topicIdsArray.every(topicId =>
            therapistTopicIds.includes(topicId),
          );
        } else {
          return topicIdsArray.some(topicId =>
            therapistTopicIds.includes(topicId),
          );
        }
      });
    }

    if (modality) {
      therapists = therapists.filter(therapist => {
        const therapistModalities = therapist.sessionTypes.map(
          st => st.modality,
        );
        return therapistModalities.includes(modality);
      });
    }

    let therapistsWithAvailability = therapists.map(therapist => {
      const modalities = [
        ...new Set(therapist.sessionTypes.map(st => st.modality)),
      ];

      return {
        id: therapist.id,
        name: therapist.name,
        timezone: therapist.timezone,
        topics: therapist.therapistTopics.map(tt => tt.topic),
        modalities,
        availabilitySummary: { freeSlotsCount: 0 },
      };
    });

    if (weekStart && sessionTypeId) {
      const sessionType = await this.prisma.sessionType.findUnique({
        where: { id: sessionTypeId },
        select: { durationMin: true, modality: true },
      });

      if (sessionType) {
        const availabilityPromises = therapistsWithAvailability.map(
          async therapist => {
            try {
              const availability = await this.getAvailability(
                therapist.id,
                sessionTypeId,
                weekStart,
                'UTC',
                stepMin,
              );

              const totalFreeSlots = Object.values(
                availability.availability,
              ).reduce(
                (total, windows) =>
                  total +
                  windows.reduce(
                    (windowTotal, window) =>
                      windowTotal + window.bookableStarts.length,
                    0,
                  ),
                0,
              );

              return {
                ...therapist,
                availabilitySummary: { freeSlotsCount: totalFreeSlots },
              };
            } catch {
              return {
                ...therapist,
                availabilitySummary: { freeSlotsCount: 0 },
              };
            }
          },
        );

        therapistsWithAvailability = await Promise.all(availabilityPromises);
      }
    }

    if (orderBy === 'scarcity') {
      therapistsWithAvailability.sort(
        (a, b) =>
          a.availabilitySummary.freeSlotsCount -
          b.availabilitySummary.freeSlotsCount,
      );
    }

    const paginatedTherapists = therapistsWithAvailability.slice(
      offset,
      offset + limit,
    );

    return paginatedTherapists;
  }

  async getAvailability(
    therapistId: string,
    sessionTypeId: string,
    weekStart: string,
    patientTz: string,
    stepMin: number = 15,
  ): Promise<AvailabilityResponse> {
    // Validar que sessionTypeId esté presente (los otros tienen valores por defecto)
    if (!sessionTypeId) {
      throw new Error('sessionTypeId is required');
    }

    const sessionType = await this.prisma.sessionType.findUnique({
      where: { id: sessionTypeId },
      select: { durationMin: true, modality: true },
    });

    if (!sessionType) {
      throw new Error('Session type not found');
    }

    const weeklyAvailability =
      await this.availabilityService.getWeeklyAvailability(
        therapistId,
        weekStart,
        sessionType.modality,
      );

    const existingSessions = await this.prisma.session.findMany({
      where: {
        therapistId,
        status: { not: 'CANCELED' },
      },
      select: {
        startUtc: true,
        endUtc: true,
      },
    });

    const existingSessionsFormatted = existingSessions.map(session => ({
      startUtc: session.startUtc.toISOString(),
      endUtc: session.endUtc.toISOString(),
    }));

    const availability: { [date: string]: any[] } = {};
    const today = DateTime.now().setZone(patientTz).startOf('day');

    for (const windows of Object.values(weeklyAvailability)) {
      for (const window of windows as any[]) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const date = window.date as string;
        const windowDate = DateTime.fromISO(date);

        // Solo incluir días futuros (hoy y posteriores)
        if (windowDate < today) {
          continue;
        }

        // Para hoy, solo incluir slots que sean al menos 2 horas después de la hora actual
        const now = DateTime.now().setZone(patientTz);
        const isToday = windowDate.hasSame(today, 'day');

        if (!availability[date as keyof typeof availability]) {
          availability[date as keyof typeof availability] = [];
        }

        const bookableSlots = this.generateBookableSlots(
          window as { startUtc: string; endUtc: string },
          sessionType.durationMin,
          sessionType.durationMin, // Usar la duración de la sesión como step
          existingSessionsFormatted,
          patientTz,
        );

        // Filtrar slots según la hora actual (si es hoy)
        const filteredSlots = bookableSlots.filter(slot => {
          if (isToday) {
            const slotStart = this.timeService.toTz(
              DateTime.fromISO(slot.startUtc),
              patientTz,
            );
            const minStartTime = now.plus({ hours: 2 }); // Mínimo 2 horas después de ahora

            return slotStart >= minStartTime;
          }
          return true; // Para otros días, incluir todos los slots
        });

        // Solo incluir slots disponibles
        if (filteredSlots.length > 0) {
          const slotsWithDate = filteredSlots.map(slot => {
            const startInPatientTz = this.timeService.toTz(
              DateTime.fromISO(slot.startUtc),
              patientTz,
            );
            const endInPatientTz = this.timeService.toTz(
              DateTime.fromISO(slot.endUtc),
              patientTz,
            );

            return {
              ...slot,
              date: date,
              startTime: startInPatientTz.toFormat('HH:mm'),
              endTime: endInPatientTz.toFormat('HH:mm'),
              id: `${date}_${startInPatientTz.toFormat('HH:mm')}_${endInPatientTz.toFormat('HH:mm')}`,
            };
          });

          availability[date as keyof typeof availability].push(
            ...slotsWithDate,
          );
        }
      }
    }

    return {
      therapistId,
      sessionTypeId,
      weekStart,
      patientTz,
      stepMin,
      availability,
    };
  }

  private generateBookableSlots(
    window: { startUtc: string; endUtc: string },
    sessionDuration: number,
    stepMin: number,
    existingSessions: { startUtc: string; endUtc: string }[],
    patientTz: string,
  ): BookableSlot[] {
    const windowStart = DateTime.fromISO(window.startUtc);
    const windowEnd = DateTime.fromISO(window.endUtc);
    const bookableSlots: BookableSlot[] = [];

    let currentStart = windowStart;
    while (currentStart.plus({ minutes: sessionDuration }) <= windowEnd) {
      const slotEnd = currentStart.plus({ minutes: sessionDuration });

      if (!this.hasOverlapInMemory(currentStart, slotEnd, existingSessions)) {
        const startInPatientTz = this.timeService.toTz(currentStart, patientTz);
        const endInPatientTz = this.timeService.toTz(slotEnd, patientTz);

        bookableSlots.push({
          startUtc: this.timeService.formatForResponse(currentStart, 'iso'),
          endUtc: this.timeService.formatForResponse(slotEnd, 'iso'),
          startInPatientTz: this.timeService.formatForResponse(
            startInPatientTz,
            'iso',
          ),
          endInPatientTz: this.timeService.formatForResponse(
            endInPatientTz,
            'iso',
          ),
        });
      }

      currentStart = currentStart.plus({ minutes: stepMin });
    }

    return bookableSlots;
  }

  async hasOverlap(
    therapistId: string,
    startUtc: string,
    endUtc: string,
  ): Promise<boolean> {
    const overlappingSessions = await this.prisma.session.findFirst({
      where: {
        therapistId,
        status: { not: 'CANCELED' },
        OR: [
          // Solapamiento exacto
          {
            startUtc: { equals: startUtc },
            endUtc: { equals: endUtc },
          },
          // Solapamiento parcial: sesión existente empieza antes y termina durante
          {
            startUtc: { lt: startUtc },
            endUtc: { gt: startUtc, lte: endUtc },
          },
          // Solapamiento parcial: sesión existente empieza durante y termina después
          {
            startUtc: { gte: startUtc, lt: endUtc },
            endUtc: { gt: endUtc },
          },
          // Solapamiento contenido: sesión existente contiene completamente el rango
          {
            startUtc: { lte: startUtc },
            endUtc: { gte: endUtc },
          },
          // Solapamiento contenido: rango contiene completamente la sesión existente
          {
            startUtc: { gte: startUtc },
            endUtc: { lte: endUtc },
          },
        ],
      },
    });

    return !!overlappingSessions;
  }

  private hasOverlapInMemory(
    slotStart: DateTime,
    slotEnd: DateTime,
    existingSessions: { startUtc: string; endUtc: string }[],
  ): boolean {
    return existingSessions.some(session => {
      const sessionStart = DateTime.fromISO(session.startUtc);
      const sessionEnd = DateTime.fromISO(session.endUtc);

      return (
        (slotStart < sessionEnd && slotEnd > sessionStart) ||
        (sessionStart < slotEnd && sessionEnd > slotStart)
      );
    });
  }
}
