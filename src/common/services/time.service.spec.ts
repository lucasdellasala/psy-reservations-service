import { Test, TestingModule } from '@nestjs/testing';
import { TimeService } from './time.service';
import { DateTime } from 'luxon';

describe('TimeService', () => {
  let service: TimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeService],
    }).compile();

    service = module.get<TimeService>(TimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toUtc', () => {
    it('should convert local time to UTC', () => {
      const localTime = '2024-01-15T10:00:00';
      const tz = 'America/New_York';

      const result = service.toUtc(localTime, tz);

      expect(result.zoneName).toBe('UTC');
      expect(result.toISO()).toBe('2024-01-15T15:00:00.000Z');
    });

    it('should handle DST transition', () => {
      const localTime = '2024-03-10T02:00:00';
      const tz = 'America/New_York';

      const result = service.toUtc(localTime, tz);

      expect(result.zoneName).toBe('UTC');
    });

    it('should handle different timezone', () => {
      const localTime = '2024-01-15T10:00:00';
      const tz = 'Europe/Madrid';

      const result = service.toUtc(localTime, tz);

      expect(result.zoneName).toBe('UTC');
    });
  });

  describe('toTz', () => {
    it('should convert UTC to target timezone', () => {
      const utc = '2024-01-15T15:00:00.000Z';
      const tz = 'America/New_York';

      const result = service.toTz(utc, tz);

      expect(result.zoneName).toBe('America/New_York');
      expect(result.toISO()).toBe('2024-01-15T10:00:00.000-05:00');
    });

    it('should handle DateTime object input', () => {
      const utc = DateTime.fromISO('2024-01-15T15:00:00.000Z');
      const tz = 'Europe/Madrid';

      const result = service.toTz(utc, tz);

      expect(result.zoneName).toBe('Europe/Madrid');
    });

    it('should handle DST transition', () => {
      const utc = '2024-03-10T07:00:00.000Z';
      const tz = 'America/New_York';

      const result = service.toTz(utc, tz);

      expect(result.zoneName).toBe('America/New_York');
    });
  });

  describe('mapAvailabilityToDateTime', () => {
    it('should map availability to concrete dates', () => {
      const weekday = 1;
      const startMin = 540;
      const endMin = 1020;
      const weekStart = '2024-01-15';
      const therapistTz = 'America/New_York';

      const result = service.mapAvailabilityToDateTime(
        weekday,
        startMin,
        endMin,
        weekStart,
        therapistTz,
      );

      expect(result.start.zoneName).toBe('America/New_York');
      expect(result.end.zoneName).toBe('America/New_York');
      expect(result.start.weekday).toBe(2);
      expect(result.start.hour).toBe(9);
      expect(result.start.minute).toBe(0);
      expect(result.end.hour).toBe(17);
      expect(result.end.minute).toBe(0);
    });

    it('should handle different timezone', () => {
      const weekday = 3;
      const startMin = 600;
      const endMin = 1080;
      const weekStart = '2024-01-15';
      const therapistTz = 'Europe/Madrid';

      const result = service.mapAvailabilityToDateTime(
        weekday,
        startMin,
        endMin,
        weekStart,
        therapistTz,
      );

      expect(result.start.zoneName).toBe('Europe/Madrid');
      expect(result.end.zoneName).toBe('Europe/Madrid');
      expect(result.start.weekday).toBe(4);
    });

    it('should handle DST transition week', () => {
      const weekday = 0;
      const startMin = 540;
      const endMin = 1020;
      const weekStart = '2024-03-10';
      const therapistTz = 'America/New_York';

      const result = service.mapAvailabilityToDateTime(
        weekday,
        startMin,
        endMin,
        weekStart,
        therapistTz,
      );

      expect(result.start.zoneName).toBe('America/New_York');
      expect(result.end.zoneName).toBe('America/New_York');
    });
  });

  describe('formatForResponse', () => {
    it('should format as ISO', () => {
      const dt = DateTime.fromISO('2024-01-15T10:00:00.000-05:00');

      const result = service.formatForResponse(dt, 'iso');

      expect(result).toMatch(/^2024-01-15T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should format as local', () => {
      const dt = DateTime.fromISO('2024-01-15T10:00:00.000-05:00');

      const result = service.formatForResponse(dt, 'local');

      expect(result).toContain('2024');
    });

    it('should format as short', () => {
      const dt = DateTime.fromISO('2024-01-15T10:00:00.000-05:00');

      const result = service.formatForResponse(dt, 'short');

      expect(result).toMatch(/^2024-01-15 \d{2}:\d{2}$/);
    });

    it('should default to ISO format', () => {
      const dt = DateTime.fromISO('2024-01-15T10:00:00.000-05:00');

      const result = service.formatForResponse(dt);

      expect(result).toMatch(/^2024-01-15T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('formatAvailabilityForResponse', () => {
    it('should format availability with duration', () => {
      const start = DateTime.fromISO('2024-01-15T09:00:00.000-05:00');
      const end = DateTime.fromISO('2024-01-15T17:00:00.000-05:00');

      const result = service.formatAvailabilityForResponse(start, end, 'iso');

      expect(result.start).toMatch(/^2024-01-15T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.end).toMatch(/^2024-01-15T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result.duration).toBe(480);
    });

    it('should handle different format', () => {
      const start = DateTime.fromISO('2024-01-15T09:00:00.000-05:00');
      const end = DateTime.fromISO('2024-01-15T10:00:00.000-05:00');

      const result = service.formatAvailabilityForResponse(start, end, 'short');

      expect(result.start).toMatch(/^2024-01-15 \d{2}:\d{2}$/);
      expect(result.end).toMatch(/^2024-01-15 \d{2}:\d{2}$/);
      expect(result.duration).toBe(60);
    });
  });

  describe('isDST', () => {
    it('should detect DST in summer', () => {
      const summerDate = DateTime.fromISO('2024-07-15T10:00:00.000-04:00');

      const result = service.isDST(summerDate);

      expect(typeof result).toBe('boolean');
    });

    it('should detect non-DST in winter', () => {
      const winterDate = DateTime.fromISO('2024-01-15T10:00:00.000-05:00');

      const result = service.isDST(winterDate);

      expect(result).toBe(false);
    });

    it('should handle DST transition day', () => {
      const transitionDate = DateTime.fromISO('2024-03-10T02:00:00.000-05:00');

      const result = service.isDST(transitionDate);

      expect(typeof result).toBe('boolean');
    });
  });

  describe('getTimezoneOffset', () => {
    it('should return timezone offset', () => {
      const tz = 'America/New_York';

      const result = service.getTimezoneOffset(tz);

      expect(typeof result).toBe('number');
      expect(result).toBeLessThanOrEqual(0);
    });

    it('should handle different timezone', () => {
      const tz = 'Europe/Madrid';

      const result = service.getTimezoneOffset(tz);

      expect(typeof result).toBe('number');
    });
  });

  describe('validateTimezone', () => {
    it('should validate correct timezone', () => {
      const tz = 'America/New_York';

      const result = service.validateTimezone(tz);

      expect(result).toBe(true);
    });

    it('should reject invalid timezone', () => {
      const tz = 'Invalid/Timezone';

      const result = service.validateTimezone(tz);

      expect(result).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(service.validateTimezone('')).toBe(false);
      expect(service.validateTimezone('UTC')).toBe(true);
    });
  });
});
