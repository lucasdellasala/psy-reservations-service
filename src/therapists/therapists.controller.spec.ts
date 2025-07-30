import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TherapistsController } from './therapists.controller';
import { TherapistsService } from './therapists.service';

describe('TherapistsController', () => {
  let controller: TherapistsController;

  const mockTherapistsService = {
    findOne: jest.fn(),
    findSessionTypes: jest.fn(),
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
    it('should return therapist profile with topics', async () => {
      const mockTherapist = {
        id: '1',
        name: 'Dr. María González',
        timezone: 'America/Argentina/Buenos_Aires',
        topics: [
          { id: '1', name: 'Anxiety & Depression' },
          { id: '2', name: 'Couples Therapy' },
        ],
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
    it('should return therapist session types', async () => {
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
});
