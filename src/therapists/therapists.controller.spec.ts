import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TherapistsController } from './therapists.controller';
import { TherapistsService } from './therapists.service';
import { FindTherapistsDto, Modality } from './dto/find-therapists.dto';

describe('TherapistsController', () => {
  let controller: TherapistsController;

  const mockTherapistsService = {
    findOne: jest.fn(),
    findSessionTypes: jest.fn(),
    findWithFilters: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TherapistsController],
      providers: [
        {
          provide: TherapistsService,
          useValue: mockTherapistsService,
        },
      ],
    }).compile();

    controller = module.get<TherapistsController>(TherapistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return therapist profile with topics and modalities', async () => {
      const mockTherapist = {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        topics: [
          { id: '1', name: 'Anxiety & Depression' },
          { id: '2', name: 'Couples Therapy' },
        ],
        modalities: ['online', 'in_person'],
      };

      mockTherapistsService.findOne.mockResolvedValue(mockTherapist);

      const result = (await controller.findOne('1')) as typeof mockTherapist;

      expect(mockTherapistsService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTherapist);
    });

    it('should throw NotFoundException when therapist not found', async () => {
      mockTherapistsService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTherapistsService.findOne).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('findSessionTypes', () => {
    it('should return therapist session types with modality', async () => {
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

      mockTherapistsService.findSessionTypes.mockResolvedValue(
        mockSessionTypes,
      );

      const result = await controller.findSessionTypes('1');

      expect(mockTherapistsService.findSessionTypes).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockSessionTypes);
    });

    it('should throw NotFoundException when therapist has no session types', async () => {
      mockTherapistsService.findSessionTypes.mockResolvedValue([]);

      await expect(controller.findSessionTypes('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTherapistsService.findSessionTypes).toHaveBeenCalledWith(
        'invalid-id',
      );
    });
  });

  describe('findAll', () => {
    it('should return all therapists when no filters provided', async () => {
      const mockTherapists = [
        {
          id: '1',
          name: 'Dr. María González',
          timezone: 'America/Argentina/Buenos_Aires',
          topics: [
            { id: '1', name: 'Anxiety & Depression' },
            { id: '2', name: 'Couples Therapy' },
          ],
          modalities: ['online', 'in_person'],
        },
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          timezone: 'America/New_York',
          topics: [{ id: '2', name: 'Couples Therapy' }],
          modalities: ['in_person'],
        },
      ];

      mockTherapistsService.findWithFilters.mockResolvedValue(mockTherapists);

      const result = await controller.findAll({});

      expect(mockTherapistsService.findWithFilters).toHaveBeenCalledWith({});
      expect(result).toEqual(mockTherapists);
    });

    it('should pass filters to service when provided', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '1,2',
        requireAll: true,
        modality: Modality.ONLINE,
        limit: 5,
        offset: 0,
      };

      const mockTherapists = [
        {
          id: '1',
          name: 'Dr. María González',
          timezone: 'America/Argentina/Buenos_Aires',
          topics: [
            { id: '1', name: 'Anxiety & Depression' },
            { id: '2', name: 'Couples Therapy' },
          ],
          modalities: ['online', 'in_person'],
        },
      ];

      mockTherapistsService.findWithFilters.mockResolvedValue(mockTherapists);

      const result = await controller.findAll(filters);

      expect(mockTherapistsService.findWithFilters).toHaveBeenCalledWith(
        filters,
      );
      expect(result).toEqual(mockTherapists);
    });

    it('should handle empty filters object', async () => {
      const mockTherapists = [
        {
          id: '1',
          name: 'Dr. María González',
          timezone: 'America/Argentina/Buenos_Aires',
          topics: [{ id: '1', name: 'Anxiety & Depression' }],
          modalities: ['online'],
        },
      ];

      mockTherapistsService.findWithFilters.mockResolvedValue(mockTherapists);

      const result = await controller.findAll({});

      expect(mockTherapistsService.findWithFilters).toHaveBeenCalledWith({});
      expect(result).toEqual(mockTherapists);
    });

    it('should handle filters with only topicIds', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '1',
      };

      const mockTherapists = [
        {
          id: '1',
          name: 'Dr. María González',
          timezone: 'America/Argentina/Buenos_Aires',
          topics: [{ id: '1', name: 'Anxiety & Depression' }],
          modalities: ['online'],
        },
      ];

      mockTherapistsService.findWithFilters.mockResolvedValue(mockTherapists);

      const result = await controller.findAll(filters);

      expect(mockTherapistsService.findWithFilters).toHaveBeenCalledWith(
        filters,
      );
      expect(result).toEqual(mockTherapists);
    });

    it('should handle filters with only modality', async () => {
      const filters: FindTherapistsDto = {
        modality: Modality.IN_PERSON,
      };

      const mockTherapists = [
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          timezone: 'America/New_York',
          topics: [{ id: '2', name: 'Couples Therapy' }],
          modalities: ['in_person'],
        },
      ];

      mockTherapistsService.findWithFilters.mockResolvedValue(mockTherapists);

      const result = await controller.findAll(filters);

      expect(mockTherapistsService.findWithFilters).toHaveBeenCalledWith(
        filters,
      );
      expect(result).toEqual(mockTherapists);
    });

    it('should handle filters with only pagination', async () => {
      const filters: FindTherapistsDto = {
        limit: 1,
        offset: 1,
      };

      const mockTherapists = [
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          timezone: 'America/New_York',
          topics: [{ id: '2', name: 'Couples Therapy' }],
          modalities: ['in_person'],
        },
      ];

      mockTherapistsService.findWithFilters.mockResolvedValue(mockTherapists);

      const result = await controller.findAll(filters);

      expect(mockTherapistsService.findWithFilters).toHaveBeenCalledWith(
        filters,
      );
      expect(result).toEqual(mockTherapists);
    });

    it('should handle complex filters combination', async () => {
      const filters: FindTherapistsDto = {
        topicIds: '1,2',
        requireAll: true,
        modality: Modality.ONLINE,
        limit: 10,
        offset: 0,
      };

      const mockTherapists = [
        {
          id: '1',
          name: 'Dr. María González',
          timezone: 'America/Argentina/Buenos_Aires',
          topics: [
            { id: '1', name: 'Anxiety & Depression' },
            { id: '2', name: 'Couples Therapy' },
          ],
          modalities: ['online', 'in_person'],
        },
      ];

      mockTherapistsService.findWithFilters.mockResolvedValue(mockTherapists);

      const result = await controller.findAll(filters);

      expect(mockTherapistsService.findWithFilters).toHaveBeenCalledWith(
        filters,
      );
      expect(result).toEqual(mockTherapists);
    });
  });
});
