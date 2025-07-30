import { Test, TestingModule } from '@nestjs/testing';
import { TopicsService } from './topics.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TopicsService', () => {
  let service: TopicsService;

  const mockPrismaService = {
    topic: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TopicsService>(TopicsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all topics ordered by name', async () => {
      const mockTopics = [
        { id: '1', name: 'Anxiety & Depression' },
        { id: '2', name: 'Couples Therapy' },
        { id: '3', name: 'Family Therapy' },
      ];

      mockPrismaService.topic.findMany.mockResolvedValue(mockTopics);

      const result = await service.findAll();

      expect(mockPrismaService.topic.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
      expect(result).toEqual(mockTopics);
    });

    it('should return empty array when no topics exist', async () => {
      mockPrismaService.topic.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockPrismaService.topic.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
