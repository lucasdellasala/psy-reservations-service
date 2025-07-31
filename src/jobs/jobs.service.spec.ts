/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('JobsService', () => {
  let service: JobsService;
  let mockPrismaService: any;

  beforeEach(async () => {
    const mockPrismaServiceObj = {
      session: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: mockPrismaServiceObj,
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);

    mockPrismaService = module.get(PrismaService);

    // Mock Logger
    jest.spyOn(service['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cancelExpiredPendingSessions', () => {
    it('should cancel expired pending sessions successfully', async () => {
      const mockExpiredSessions = [
        {
          id: 'session-1',
          startUtc: new Date('2025-01-29T19:00:00Z'),
          patientName: 'Lucas',
        },
        {
          id: 'session-2',
          startUtc: new Date('2025-01-29T18:00:00Z'),
          patientName: 'María',
        },
      ];

      const mockUpdateResult = { count: 2 };

      mockPrismaService.session.findMany.mockResolvedValue(mockExpiredSessions);
      mockPrismaService.session.updateMany.mockResolvedValue(mockUpdateResult);

      await service.cancelExpiredPendingSessions();

      expect(mockPrismaService.session.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PENDING',
          startUtc: {
            lt: expect.any(Date),
          },
        },
        select: {
          id: true,
          startUtc: true,
          patientName: true,
        },
      });

      expect(mockPrismaService.session.updateMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['session-1', 'session-2'],
          },
        },
        data: {
          status: 'CANCELED',
          canceledAt: expect.any(Date),
        },
      });

      expect(service['logger'].log).toHaveBeenCalledWith(
        'Starting job to cancel expired pending sessions...',
      );
      expect(service['logger'].log).toHaveBeenCalledWith(
        'Successfully canceled 2 expired pending sessions',
      );
    });

    it('should log when no expired sessions are found', async () => {
      mockPrismaService.session.findMany.mockResolvedValue([]);

      await service.cancelExpiredPendingSessions();

      expect(mockPrismaService.session.findMany).toHaveBeenCalled();
      expect(mockPrismaService.session.updateMany).not.toHaveBeenCalled();
      expect(service['logger'].log).toHaveBeenCalledWith(
        'No expired pending sessions found',
      );
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.session.findMany.mockRejectedValue(error);

      await service.cancelExpiredPendingSessions();

      expect(service['logger'].error).toHaveBeenCalledWith(
        'Error occurred while canceling expired pending sessions',
        error.stack,
      );
    });

    it('should log details of each canceled session', async () => {
      const mockExpiredSessions = [
        {
          id: 'session-1',
          startUtc: new Date('2025-01-29T19:00:00Z'),
          patientName: 'Lucas',
        },
      ];

      const mockUpdateResult = { count: 1 };

      mockPrismaService.session.findMany.mockResolvedValue(mockExpiredSessions);
      mockPrismaService.session.updateMany.mockResolvedValue(mockUpdateResult);

      await service.cancelExpiredPendingSessions();

      expect(service['logger'].log).toHaveBeenCalledWith(
        expect.stringContaining(
          'Canceled session session-1 for patient Lucas (scheduled for',
        ),
      );
    });
  });
});
