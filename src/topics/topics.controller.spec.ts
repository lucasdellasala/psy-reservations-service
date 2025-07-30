import { Test, TestingModule } from '@nestjs/testing';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';

describe('TopicsController', () => {
  let controller: TopicsController;

  const mockTopicsService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopicsController],
      providers: [
        {
          provide: TopicsService,
          useValue: mockTopicsService,
        },
      ],
    }).compile();

    controller = module.get<TopicsController>(TopicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all topics', async () => {
      const mockTopics = [
        { id: '1', name: 'Anxiety & Depression' },
        { id: '2', name: 'Couples Therapy' },
      ];

      mockTopicsService.findAll.mockResolvedValue(mockTopics);

      const result = await controller.findAll();

      expect(mockTopicsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockTopics);
    });

    it('should return empty array when no topics exist', async () => {
      mockTopicsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(mockTopicsService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
