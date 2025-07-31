import { Test, TestingModule } from '@nestjs/testing';
import { DbService } from './db.service';
import { PrismaService } from './prisma.service';

describe('DbService', () => {
  let service: DbService;
  let mockPrismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrismaServiceObj = {
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbService,
        {
          provide: PrismaService,
          useValue: mockPrismaServiceObj,
        },
      ],
    }).compile();

    service = module.get<DbService>(DbService);
    mockPrismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('withTherapistLock', () => {
    it('should execute function within transaction with lock', async () => {
      const therapistId = 'therapist-123';
      const mockResult = { id: 'session-1', status: 'confirmed' };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockTransactionClient = {
        $executeRaw: jest.fn(),
        session: {
          create: jest.fn(),
        },
      } as any;

      mockPrismaService.$transaction.mockImplementation(async fn => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return await fn(mockTransactionClient);
      });

      const testFunction = jest.fn().mockResolvedValue(mockResult);

      const result = await service.withTherapistLock(therapistId, testFunction);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockTransactionClient.$executeRaw).toHaveBeenCalledWith(
        ['SELECT pg_advisory_xact_lock(', ')'],
        expect.any(Number),
      );
      expect(testFunction).toHaveBeenCalledWith(mockTransactionClient);
      expect(result).toEqual(mockResult);
    });

    it('should use consistent hash for same therapistId', async () => {
      const therapistId = 'therapist-123';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockTransactionClient = {
        $executeRaw: jest.fn(),
      } as any;

      mockPrismaService.$transaction.mockImplementation(async fn => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return await fn(mockTransactionClient);
      });

      const testFunction = jest.fn().mockResolvedValue({});

      await service.withTherapistLock(therapistId, testFunction);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const callArgs = mockTransactionClient.$executeRaw.mock.calls[0][0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(callArgs[0]).toContain('pg_advisory_xact_lock');

      // Verificar que el hash es consistente
      const hash1 = service['hashStringToNumber'](therapistId);
      const hash2 = service['hashStringToNumber'](therapistId);
      expect(hash1).toBe(hash2);
    });

    it('should use different hashes for different therapistIds', () => {
      const therapistId1 = 'therapist-123';
      const therapistId2 = 'therapist-456';

      const hash1 = service['hashStringToNumber'](therapistId1);
      const hash2 = service['hashStringToNumber'](therapistId2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle function errors and release lock', async () => {
      const therapistId = 'therapist-123';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockTransactionClient = {
        $executeRaw: jest.fn(),
      } as any;

      mockPrismaService.$transaction.mockImplementation(async fn => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return await fn(mockTransactionClient);
      });

      const testFunction = jest.fn().mockRejectedValue(new Error('Test error'));

      await expect(
        service.withTherapistLock(therapistId, testFunction),
      ).rejects.toThrow('Test error');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockTransactionClient.$executeRaw).toHaveBeenCalled();
    });

    it('should handle empty therapistId', async () => {
      const therapistId = '';
      const mockResult = { id: 'session-1' };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockTransactionClient = {
        $executeRaw: jest.fn(),
      } as any;

      mockPrismaService.$transaction.mockImplementation(async fn => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return await fn(mockTransactionClient);
      });

      const testFunction = jest.fn().mockResolvedValue(mockResult);

      const result = await service.withTherapistLock(therapistId, testFunction);

      expect(result).toEqual(mockResult);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockTransactionClient.$executeRaw).toHaveBeenCalled();
    });

    it('should handle special characters in therapistId', async () => {
      const therapistId = 'therapist-123!@#$%^&*()';
      const mockResult = { id: 'session-1' };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockTransactionClient = {
        $executeRaw: jest.fn(),
      } as any;

      mockPrismaService.$transaction.mockImplementation(async fn => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return await fn(mockTransactionClient);
      });

      const testFunction = jest.fn().mockResolvedValue(mockResult);

      const result = await service.withTherapistLock(therapistId, testFunction);

      expect(result).toEqual(mockResult);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockTransactionClient.$executeRaw).toHaveBeenCalled();
    });
  });

  describe('hashStringToNumber', () => {
    it('should generate consistent hashes for same input', () => {
      const input = 'test-string';
      const hash1 = service['hashStringToNumber'](input);
      const hash2 = service['hashStringToNumber'](input);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const input1 = 'test-string-1';
      const input2 = 'test-string-2';

      const hash1 = service['hashStringToNumber'](input1);
      const hash2 = service['hashStringToNumber'](input2);

      expect(hash1).not.toBe(hash2);
    });

    it('should return positive integers', () => {
      const inputs = ['test', 'therapist-123', 'empty', 'special!@#'];

      inputs.forEach(input => {
        const hash = service['hashStringToNumber'](input);
        expect(hash).toBeGreaterThan(0);
        expect(Number.isInteger(hash)).toBe(true);
      });
    });
  });
});
