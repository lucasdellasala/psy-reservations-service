import { Test, TestingModule } from '@nestjs/testing';
import { TherapistsService } from './therapists.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TherapistsService', () => {
  let service: TherapistsService;

  const mockPrismaService = {
    therapist: {
      findUnique: jest.fn(),
    },
    sessionType: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TherapistsService>(TherapistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return therapist with transformed topics', async () => {
      const mockTherapist = {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        therapistTopics: [
          { topic: { id: '1', name: 'Anxiety & Depression' } },
          { topic: { id: '2', name: 'Couples Therapy' } },
        ],
      };

      const expectedResult = {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        topics: [
          { id: '1', name: 'Anxiety & Depression' },
          { id: '2', name: 'Couples Therapy' },
        ],
      };

      mockPrismaService.therapist.findUnique.mockResolvedValue(mockTherapist);

      const result = await service.findOne('1');

      expect(mockPrismaService.therapist.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
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
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return null when therapist not found', async () => {
      mockPrismaService.therapist.findUnique.mockResolvedValue(null);

      const result = await service.findOne('invalid-id');

      expect(mockPrismaService.therapist.findUnique).toHaveBeenCalledWith({
        where: { id: 'invalid-id' },
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
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('findSessionTypes', () => {
    it('should return session types ordered by duration', async () => {
      const mockSessionTypes = [
        {
          id: '1',
          name: 'Initial Consultation',
          durationMin: 60,
          priceMinor: 5000,
        },
        {
          id: '2',
          name: 'Extended Session',
          durationMin: 120,
          priceMinor: 9000,
        },
      ];

      mockPrismaService.sessionType.findMany.mockResolvedValue(
        mockSessionTypes,
      );

      const result = await service.findSessionTypes('1');

      expect(mockPrismaService.sessionType.findMany).toHaveBeenCalledWith({
        where: { therapistId: '1' },
        select: {
          id: true,
          name: true,
          durationMin: true,
          priceMinor: true,
        },
        orderBy: {
          durationMin: 'asc',
        },
      });
      expect(result).toEqual(mockSessionTypes);
    });

    it('should return empty array when therapist has no session types', async () => {
      mockPrismaService.sessionType.findMany.mockResolvedValue([]);

      const result = await service.findSessionTypes('1');

      expect(mockPrismaService.sessionType.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
