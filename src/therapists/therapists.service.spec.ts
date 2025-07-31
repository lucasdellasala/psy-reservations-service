import { Test, TestingModule } from '@nestjs/testing';
import { TherapistsService } from './therapists.service';
import { PrismaService } from '../prisma/prisma.service';
import { AvailabilityService } from './services/availability.service';
import { TimeService } from '../common/services/time.service';
import { FindTherapistsDto, Modality } from './dto/find-therapists.dto';

describe('TherapistsService', () => {
  let service: TherapistsService;

  const mockPrismaService = {
    therapist: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    sessionType: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    session: {
      findMany: jest.fn(),
    },
  };

  const mockAvailabilityService = {
    getWeeklyAvailability: jest.fn(),
  };

  const mockTimeService = {
    toTz: jest.fn(),
    formatForResponse: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TherapistsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
        {
          provide: TimeService,
          useValue: mockTimeService,
        },
      ],
    }).compile();

    service = module.get<TherapistsService>(TherapistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return therapist with transformed topics and modalities', async () => {
      const mockTherapist = {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        therapistTopics: [
          { topic: { id: '1', name: 'Anxiety & Depression' } },
          { topic: { id: '2', name: 'Couples Therapy' } },
        ],
        sessionTypes: [{ modality: 'online' }, { modality: 'in_person' }],
      };

      const expectedResult = {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        topics: [
          { id: '1', name: 'Anxiety & Depression' },
          { id: '2', name: 'Couples Therapy' },
        ],
        modalities: ['online', 'in_person'],
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
          sessionTypes: {
            select: {
              modality: true,
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
          sessionTypes: {
            select: {
              modality: true,
            },
          },
        },
      });
      expect(result).toBeNull();
    });

    it('should handle therapist with no session types', async () => {
      const mockTherapist = {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        therapistTopics: [{ topic: { id: '1', name: 'Anxiety & Depression' } }],
        sessionTypes: [],
      };

      const expectedResult = {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        topics: [{ id: '1', name: 'Anxiety & Depression' }],
        modalities: [],
      };

      mockPrismaService.therapist.findUnique.mockResolvedValue(mockTherapist);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findSessionTypes', () => {
    it('should return session types with modality ordered by duration', async () => {
      const mockSessionTypes = [
        {
          id: '1',
          name: 'Initial Consultation',
          durationMin: 60,
          priceMinor: 5000,
          modality: 'online',
        },
        {
          id: '2',
          name: 'Extended Session',
          durationMin: 120,
          priceMinor: 9000,
          modality: 'in_person',
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
          modality: true,
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

  describe('findAll', () => {
    it('should return all therapists with topics and modalities', async () => {
      const mockTherapists = [
        {
          id: '1',
          name: 'Dr. María González',
          timezone: 'America/Argentina/Buenos_Aires',
          therapistTopics: [
            { topic: { id: '1', name: 'Anxiety & Depression' } },
          ],
          sessionTypes: [{ modality: 'online' }, { modality: 'in_person' }],
        },
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          timezone: 'America/New_York',
          therapistTopics: [{ topic: { id: '2', name: 'Trauma & PTSD' } }],
          sessionTypes: [{ modality: 'in_person' }],
        },
      ];

      const expectedResult = [
        {
          id: '1',
          name: 'Dr. María González',
          timezone: 'America/Argentina/Buenos_Aires',
          topics: [{ id: '1', name: 'Anxiety & Depression' }],
          modalities: ['online', 'in_person'],
        },
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          timezone: 'America/New_York',
          topics: [{ id: '2', name: 'Trauma & PTSD' }],
          modalities: ['in_person'],
        },
      ];

      mockPrismaService.therapist.findMany.mockResolvedValue(mockTherapists);

      const result = await service.findAll();

      expect(mockPrismaService.therapist.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findWithFilters', () => {
    const mockTherapists = [
      {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        therapistTopics: [
          { topic: { id: '1', name: 'Anxiety & Depression' } },
          { topic: { id: '2', name: 'Couples Therapy' } },
        ],
        sessionTypes: [{ modality: 'online' }, { modality: 'in_person' }],
      },
      {
        id: '2',
        name: 'Dr. Sarah Johnson',
        timezone: 'America/New_York',
        therapistTopics: [{ topic: { id: '2', name: 'Couples Therapy' } }],
        sessionTypes: [{ modality: 'in_person' }],
      },
      {
        id: '3',
        name: 'Dr. Carlos Rodríguez',
        timezone: 'Europe/Madrid',
        therapistTopics: [{ topic: { id: '3', name: 'Child & Adolescent' } }],
        sessionTypes: [{ modality: 'online' }],
      },
    ];

    beforeEach(() => {
      mockPrismaService.therapist.findMany.mockResolvedValue(mockTherapists);
    });

    it('should return all therapists when no filters applied', async () => {
      const filters: FindTherapistsDto = {};

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
      expect(result[2].id).toBe('3');
    });

    it('should filter by single topicId (OR logic)', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '1',
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by multiple topicIds (OR logic)', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '1,2',
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '2']);
    });

    it('should filter by multiple topicIds with requireAll=true (AND logic)', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '1,2',
        requireAll: true,
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by modality', async () => {
      const filters: FindTherapistsDto = {
        modality: Modality.ONLINE,
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '3']);
    });

    it('should filter by in_person modality', async () => {
      const filters: FindTherapistsDto = {
        modality: Modality.IN_PERSON,
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '2']);
    });

    it('should apply pagination', async () => {
      const filters: FindTherapistsDto = {
        limit: 2,
        offset: 0,
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should apply pagination with offset', async () => {
      const filters: FindTherapistsDto = {
        limit: 1,
        offset: 1,
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should combine topicIds and modality filters', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '2',
        modality: Modality.IN_PERSON,
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '2']);
    });

    it('should combine all filters with pagination', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '1,2',
        requireAll: true,
        modality: Modality.ONLINE,
        limit: 1,
        offset: 0,
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array when no therapists match filters', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '999',
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(0);
    });

    it('should handle empty topicIds string', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '',
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(3);
    });

    it('should handle topicIds with whitespace', async () => {
      const filters: FindTherapistsDto = {
        topicIds: ' 1 , 2 ',
      };

      const result = await service.findWithFilters(filters);

      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toEqual(['1', '2']);
    });
  });
});
