import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TimeService } from '../../common/services/time.service';
import { DateTime } from 'luxon';

describe('AvailabilityService', () => {
  let service: AvailabilityService;

  const mockPrismaService = {
    therapist: {
      findUnique: jest.fn(),
    },
    availabilityWindow: {
      findMany: jest.fn(),
    },
  };

  const mockTimeService = {
    mapAvailabilityToDateTime: jest.fn(),
    formatForResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TimeService,
          useValue: mockTimeService,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getWeeklyAvailability', () => {
    it('should return weekly availability for therapist', async () => {
      const therapistId = 'therapist-1';
      const weekStart = '2024-01-15';
      const modality = 'online';

      const mockTherapist = {
        timezone: 'America/New_York',
      };

      const mockWindows = [
        {
          id: 'window-1',
          weekday: 1,
          startMin: 540,
          endMin: 1020,
          modality: 'online',
        },
        {
          id: 'window-2',
          weekday: 2,
          startMin: 600,
          endMin: 1080,
          modality: 'online',
        },
      ];

      const mockStart1 = DateTime.fromISO('2024-01-16T09:00:00.000-05:00');
      const mockEnd1 = DateTime.fromISO('2024-01-16T17:00:00.000-05:00');
      const mockStart2 = DateTime.fromISO('2024-01-17T10:00:00.000-05:00');
      const mockEnd2 = DateTime.fromISO('2024-01-17T18:00:00.000-05:00');

      mockPrismaService.therapist.findUnique.mockResolvedValue(mockTherapist);
      mockPrismaService.availabilityWindow.findMany.mockResolvedValue(
        mockWindows,
      );
      mockTimeService.mapAvailabilityToDateTime
        .mockReturnValueOnce({ start: mockStart1, end: mockEnd1 })
        .mockReturnValueOnce({ start: mockStart2, end: mockEnd2 });
      mockTimeService.formatForResponse
        .mockReturnValueOnce('2024-01-16T14:00:00.000Z')
        .mockReturnValueOnce('2024-01-16T22:00:00.000Z')
        .mockReturnValueOnce('2024-01-17T15:00:00.000Z')
        .mockReturnValueOnce('2024-01-17T23:00:00.000Z');

      const result = await service.getWeeklyAvailability(
        therapistId,
        weekStart,
        modality,
      );

      expect(mockPrismaService.therapist.findUnique).toHaveBeenCalledWith({
        where: { id: therapistId },
        select: { timezone: true },
      });

      expect(
        mockPrismaService.availabilityWindow.findMany,
      ).toHaveBeenCalledWith({
        where: {
          therapistId,
          modality,
        },
        orderBy: {
          weekday: 'asc',
          startMin: 'asc',
        },
      });

      expect(result).toEqual({
        1: [
          {
            id: 'window-1',
            date: '2024-01-16',
            startTime: '11:00',
            endTime: '19:00',
            startUtc: '2024-01-16T14:00:00.000Z',
            endUtc: '2024-01-16T22:00:00.000Z',
            duration: 480,
            modality: 'online',
          },
        ],
        2: [
          {
            id: 'window-2',
            date: '2024-01-17',
            startTime: '12:00',
            endTime: '20:00',
            startUtc: '2024-01-17T15:00:00.000Z',
            endUtc: '2024-01-17T23:00:00.000Z',
            duration: 480,
            modality: 'online',
          },
        ],
      });
    });

    it('should throw error when therapist not found', async () => {
      const therapistId = 'invalid-therapist';
      const weekStart = '2024-01-15';
      const modality = 'online';

      mockPrismaService.therapist.findUnique.mockResolvedValue(null);

      await expect(
        service.getWeeklyAvailability(therapistId, weekStart, modality),
      ).rejects.toThrow('Therapist not found');
    });

    it('should handle empty availability windows', async () => {
      const therapistId = 'therapist-1';
      const weekStart = '2024-01-15';
      const modality = 'in_person';

      const mockTherapist = {
        timezone: 'America/New_York',
      };

      mockPrismaService.therapist.findUnique.mockResolvedValue(mockTherapist);
      mockPrismaService.availabilityWindow.findMany.mockResolvedValue([]);

      const result = await service.getWeeklyAvailability(
        therapistId,
        weekStart,
        modality,
      );

      expect(result).toEqual({});
    });
  });

  describe('getAvailableSlots', () => {
    it('should return all available slots sorted by date', async () => {
      const therapistId = 'therapist-1';
      const weekStart = '2024-01-15';
      const modality = 'online';

      const mockWeeklyAvailability = {
        1: [
          {
            id: 'window-1',
            date: '2024-01-16',
            startTime: '09:00',
            endTime: '17:00',
            startUtc: '2024-01-16T14:00:00.000Z',
            endUtc: '2024-01-16T22:00:00.000Z',
            duration: 480,
            modality: 'online' as const,
          },
        ],
        2: [
          {
            id: 'window-2',
            date: '2024-01-17',
            startTime: '10:00',
            endTime: '18:00',
            startUtc: '2024-01-17T15:00:00.000Z',
            endUtc: '2024-01-17T23:00:00.000Z',
            duration: 480,
            modality: 'online' as const,
          },
        ],
      };

      jest
        .spyOn(service, 'getWeeklyAvailability')
        .mockResolvedValue(mockWeeklyAvailability);

      const result = await service.getAvailableSlots(
        therapistId,
        weekStart,
        modality,
      );

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-16');
      expect(result[1].date).toBe('2024-01-17');
    });
  });

  describe('getAvailabilityForDate', () => {
    it('should return availability for specific date', async () => {
      const therapistId = 'therapist-1';
      const date = '2024-01-16';
      const modality = 'online';

      const mockWeeklyAvailability = {
        2: [
          {
            id: 'window-1',
            date: '2024-01-16',
            startTime: '09:00',
            endTime: '17:00',
            startUtc: '2024-01-16T14:00:00.000Z',
            endUtc: '2024-01-16T22:00:00.000Z',
            duration: 480,
            modality: 'online' as const,
          },
        ],
      };

      jest
        .spyOn(service, 'getWeeklyAvailability')
        .mockResolvedValue(mockWeeklyAvailability);

      const result = await service.getAvailabilityForDate(
        therapistId,
        date,
        modality,
      );

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-01-16');
    });

    it('should return empty array for date with no availability', async () => {
      const therapistId = 'therapist-1';
      const date = '2024-01-20';
      const modality = 'online';

      const mockWeeklyAvailability = {};

      jest
        .spyOn(service, 'getWeeklyAvailability')
        .mockResolvedValue(mockWeeklyAvailability);

      const result = await service.getAvailabilityForDate(
        therapistId,
        date,
        modality,
      );

      expect(result).toEqual([]);
    });
  });

  describe('validateAvailabilityWindow', () => {
    it('should validate available window', async () => {
      const therapistId = 'therapist-1';
      const date = '2024-01-16';
      const startTime = '10:00';
      const endTime = '11:00';
      const modality = 'online';

      const mockAvailableSlots = [
        {
          id: 'window-1',
          date: '2024-01-16',
          startTime: '09:00',
          endTime: '17:00',
          startUtc: '2024-01-16T14:00:00.000Z',
          endUtc: '2024-01-16T22:00:00.000Z',
          duration: 480,
          modality: 'online' as const,
        },
      ];

      jest
        .spyOn(service, 'getAvailabilityForDate')
        .mockResolvedValue(mockAvailableSlots);

      const result = await service.validateAvailabilityWindow(
        therapistId,
        date,
        startTime,
        endTime,
        modality,
      );

      expect(result).toBe(true);
    });

    it('should reject unavailable window', async () => {
      const therapistId = 'therapist-1';
      const date = '2024-01-16';
      const startTime = '18:00';
      const endTime = '19:00';
      const modality = 'online';

      const mockAvailableSlots = [
        {
          id: 'window-1',
          date: '2024-01-16',
          startTime: '09:00',
          endTime: '17:00',
          startUtc: '2024-01-16T14:00:00.000Z',
          endUtc: '2024-01-16T22:00:00.000Z',
          duration: 480,
          modality: 'online' as const,
        },
      ];

      jest
        .spyOn(service, 'getAvailabilityForDate')
        .mockResolvedValue(mockAvailableSlots);

      const result = await service.validateAvailabilityWindow(
        therapistId,
        date,
        startTime,
        endTime,
        modality,
      );

      expect(result).toBe(false);
    });

    it('should reject invalid time range', async () => {
      const therapistId = 'therapist-1';
      const date = '2024-01-16';
      const startTime = '17:00';
      const endTime = '16:00';
      const modality = 'online';

      const mockAvailableSlots = [
        {
          id: 'window-1',
          date: '2024-01-16',
          startTime: '09:00',
          endTime: '17:00',
          startUtc: '2024-01-16T14:00:00.000Z',
          endUtc: '2024-01-16T22:00:00.000Z',
          duration: 480,
          modality: 'online' as const,
        },
      ];

      jest
        .spyOn(service, 'getAvailabilityForDate')
        .mockResolvedValue(mockAvailableSlots);

      const result = await service.validateAvailabilityWindow(
        therapistId,
        date,
        startTime,
        endTime,
        modality,
      );

      expect(result).toBe(false);
    });
  });
});
