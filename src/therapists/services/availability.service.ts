import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimeService } from '../../common/services/time.service';
import { DateTime } from 'luxon';

export interface AvailabilityWindow {
  id: string;
  weekday: number;
  startMin: number;
  endMin: number;
  modality: 'online' | 'in_person';
}

export interface ConcreteAvailabilityWindow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  startUtc: string;
  endUtc: string;
  duration: number;
  modality: 'online' | 'in_person';
}

export interface WeeklyAvailability {
  [weekday: number]: ConcreteAvailabilityWindow[];
}

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timeService: TimeService,
  ) {}

  async getWeeklyAvailability(
    therapistId: string,
    weekStart: string,
    modality: 'online' | 'in_person',
  ): Promise<WeeklyAvailability> {
    const therapist = await this.prisma.therapist.findUnique({
      where: { id: therapistId },
      select: { timezone: true },
    });

    if (!therapist) {
      throw new Error('Therapist not found');
    }

    const availabilityWindows = await this.prisma.availabilityWindow.findMany({
      where: {
        therapistId,
        modality,
      },
      orderBy: [{ weekday: 'asc' }, { startMin: 'asc' }],
    });

    return this.generateConcreteWindows(
      availabilityWindows,
      weekStart,
      therapist.timezone,
    );
  }

  private generateConcreteWindows(
    windows: AvailabilityWindow[],
    weekStart: string,
    therapistTz: string,
  ): WeeklyAvailability {
    const weeklyAvailability: WeeklyAvailability = {};

    for (const window of windows) {
      const { start, end } = this.timeService.mapAvailabilityToDateTime(
        window.weekday,
        window.startMin,
        window.endMin,
        weekStart,
        therapistTz,
      );

      const concreteWindow: ConcreteAvailabilityWindow = {
        id: window.id,
        date: start.toFormat('yyyy-MM-dd'),
        startTime: start.toFormat('HH:mm'),
        endTime: end.toFormat('HH:mm'),
        startUtc: this.timeService.formatForResponse(start, 'iso'),
        endUtc: this.timeService.formatForResponse(end, 'iso'),
        duration: end.diff(start, 'minutes').minutes,
        modality: window.modality,
      };

      if (!weeklyAvailability[window.weekday]) {
        weeklyAvailability[window.weekday] = [];
      }

      weeklyAvailability[window.weekday].push(concreteWindow);
    }

    return weeklyAvailability;
  }

  async getAvailableSlots(
    therapistId: string,
    weekStart: string,
    modality: 'online' | 'in_person',
  ): Promise<ConcreteAvailabilityWindow[]> {
    const weeklyAvailability = await this.getWeeklyAvailability(
      therapistId,
      weekStart,
      modality,
    );

    const allSlots: ConcreteAvailabilityWindow[] = [];

    for (const weekday in weeklyAvailability) {
      allSlots.push(...weeklyAvailability[parseInt(weekday)]);
    }

    return allSlots.sort((a, b) => {
      const dateA = DateTime.fromISO(a.date);
      const dateB = DateTime.fromISO(b.date);
      return dateA.toMillis() - dateB.toMillis();
    });
  }

  async getAvailabilityForDate(
    therapistId: string,
    date: string,
    modality: 'online' | 'in_person',
  ): Promise<ConcreteAvailabilityWindow[]> {
    const dateTime = DateTime.fromISO(date);
    const weekStart = dateTime.startOf('week').toFormat('yyyy-MM-dd');

    const weeklyAvailability = await this.getWeeklyAvailability(
      therapistId,
      weekStart,
      modality,
    );

    const weekday = dateTime.weekday % 7;
    return weeklyAvailability[weekday] || [];
  }

  async validateAvailabilityWindow(
    therapistId: string,
    date: string,
    startTime: string,
    endTime: string,
    modality: 'online' | 'in_person',
  ): Promise<boolean> {
    const availableSlots = await this.getAvailabilityForDate(
      therapistId,
      date,
      modality,
    );

    const requestedStart = DateTime.fromISO(`${date}T${startTime}`);
    const requestedEnd = DateTime.fromISO(`${date}T${endTime}`);

    return availableSlots.some(slot => {
      const slotStart = DateTime.fromISO(`${slot.date}T${slot.startTime}`);
      const slotEnd = DateTime.fromISO(`${slot.date}T${slot.endTime}`);

      return (
        requestedStart >= slotStart &&
        requestedEnd <= slotEnd &&
        requestedStart < requestedEnd
      );
    });
  }
}
