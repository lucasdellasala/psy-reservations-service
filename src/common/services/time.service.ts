import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class TimeService {
  toUtc(isoStringOrLocal: string, tz: string): DateTime {
    const dt = DateTime.fromISO(isoStringOrLocal, { zone: tz });
    return dt.toUTC();
  }

  toTz(utc: string | DateTime, tz: string): DateTime {
    const dt = typeof utc === 'string' ? DateTime.fromISO(utc) : utc;
    return dt.setZone(tz);
  }

  mapAvailabilityToDateTime(
    weekday: number,
    startMin: number,
    endMin: number,
    weekStart: string,
    therapistTz: string,
  ): { start: DateTime; end: DateTime } {
    const weekStartDate = DateTime.fromISO(weekStart, { zone: therapistTz });
    const targetDate = weekStartDate.plus({ days: weekday });

    const start = targetDate.plus({ minutes: startMin });
    const end = targetDate.plus({ minutes: endMin });

    return { start, end };
  }

  formatForResponse(
    dt: DateTime,
    format: 'iso' | 'local' | 'short' = 'iso',
  ): string {
    switch (format) {
      case 'iso':
        return dt.toUTC().toISO() || '';
      case 'local':
        return dt.toLocaleString(DateTime.DATETIME_FULL);
      case 'short':
        return dt.toFormat('yyyy-MM-dd HH:mm');
      default:
        return dt.toUTC().toISO() || '';
    }
  }

  formatAvailabilityForResponse(
    start: DateTime,
    end: DateTime,
    format: 'iso' | 'local' | 'short' = 'iso',
  ): { start: string; end: string; duration: number } {
    return {
      start: this.formatForResponse(start, format),
      end: this.formatForResponse(end, format),
      duration: end.diff(start, 'minutes').minutes,
    };
  }

  isDST(dt: DateTime): boolean {
    return dt.isInDST;
  }

  getTimezoneOffset(tz: string): number {
    const now = DateTime.now().setZone(tz);
    return now.offset;
  }

  validateTimezone(tz: string): boolean {
    return DateTime.local().setZone(tz).isValid;
  }
}
