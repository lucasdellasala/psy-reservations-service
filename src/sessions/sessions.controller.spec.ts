import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

describe('SessionsController', () => {
  let controller: SessionsController;
  let mockSessionsService: jest.Mocked<SessionsService>;

  beforeEach(async () => {
    const mockSessionsServiceObj = {
      createSession: jest.fn(),
      findOne: jest.fn(),
      cancelSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: mockSessionsServiceObj,
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    mockSessionsService = module.get(SessionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSession', () => {
    const createSessionDto: CreateSessionDto = {
      therapistId: 't1',
      sessionTypeId: 'st1',
      startUtc: '2025-07-29T20:00:00Z',
      patientId: 'user123',
      patientName: 'Lucas',
      patientEmail: 'lucas@mail.com',
      patientTz: 'America/Argentina/Buenos_Aires',
    };

    const validIdempotencyKey = '123e4567-e89b-12d3-a456-426614174000';

    it('should create a new session successfully', async () => {
      const newSession = {
        id: 'session-1',
        therapistId: 't1',
        sessionTypeId: 'st1',
        patientId: 'user123',
        patientName: 'Lucas',
        patientEmail: 'lucas@mail.com',
        startUtc: new Date('2025-07-29T20:00:00Z'),
        endUtc: new Date('2025-07-29T21:00:00Z'),
        patientTz: 'America/Argentina/Buenos_Aires',
        status: 'CONFIRMED' as const,
        idempotencyKey: validIdempotencyKey,
        createdAt: new Date(),
        canceledAt: null,
      };

      mockSessionsService.createSession.mockResolvedValue(newSession);

      const result = await controller.createSession(
        createSessionDto,
        validIdempotencyKey,
      );

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Session already exists',
        data: newSession,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSessionsService.createSession).toHaveBeenCalledWith(
        createSessionDto,
        validIdempotencyKey,
      );
    });

    it('should return existing session when idempotencyKey already exists', async () => {
      const existingSession = {
        id: 'session-1',
        therapistId: 't1',
        sessionTypeId: 'st1',
        patientId: 'user123',
        patientName: 'Lucas',
        patientEmail: 'lucas@mail.com',
        startUtc: new Date('2025-07-29T20:00:00Z'),
        endUtc: new Date('2025-07-29T21:00:00Z'),
        patientTz: 'America/Argentina/Buenos_Aires',
        status: 'CONFIRMED' as const,
        idempotencyKey: validIdempotencyKey,
        createdAt: new Date(),
        canceledAt: null,
      };

      mockSessionsService.createSession.mockResolvedValue(existingSession);

      const result = await controller.createSession(
        createSessionDto,
        validIdempotencyKey,
      );

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Session already exists',
        data: existingSession,
      });
    });

    it('should throw BadRequestException when Idempotency-Key header is missing', async () => {
      await expect(
        controller.createSession(createSessionDto, undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when Idempotency-Key is not a valid UUID', async () => {
      const invalidIdempotencyKey = 'invalid-uuid';

      await expect(
        controller.createSession(createSessionDto, invalidIdempotencyKey),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid UUID formats', async () => {
      const validUuids = [
        '123e4567-e89b-12d3-a456-426614174000',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      ];

      const newSession = {
        id: 'session-1',
        therapistId: 't1',
        sessionTypeId: 'st1',
        patientId: 'user123',
        patientName: 'Lucas',
        patientEmail: 'lucas@mail.com',
        startUtc: new Date('2025-07-29T20:00:00Z'),
        endUtc: new Date('2025-07-29T21:00:00Z'),
        patientTz: 'America/Argentina/Buenos_Aires',
        status: 'CONFIRMED' as const,
        idempotencyKey: validUuids[0],
        createdAt: new Date(),
        canceledAt: null,
      };

      mockSessionsService.createSession.mockResolvedValue(newSession);

      for (const uuid of validUuids) {
        await expect(
          controller.createSession(createSessionDto, uuid),
        ).resolves.toBeDefined();
      }
    });

    it('should reject invalid UUID formats', async () => {
      const invalidUuids = [
        'not-a-uuid',
        '123e4567-e89b-12d3-a456-42661417400', // Missing character
        '123e4567-e89b-12d3-a456-4266141740000', // Extra character
        '123e4567-e89b-12d3-a456-42661417400g', // Invalid character
      ];

      for (const uuid of invalidUuids) {
        await expect(
          controller.createSession(createSessionDto, uuid),
        ).rejects.toThrow(BadRequestException);
      }
    });
  });

  describe('findOne', () => {
    it('should return session successfully', async () => {
      const mockSession = {
        id: 'session-1',
        therapistId: 't1',
        sessionTypeId: 'st1',
        patientId: 'user123',
        patientName: 'Lucas',
        patientEmail: 'lucas@mail.com',
        startUtc: new Date('2025-07-29T20:00:00Z'),
        endUtc: new Date('2025-07-29T21:00:00Z'),
        patientTz: 'America/Argentina/Buenos_Aires',
        status: 'CONFIRMED' as const,
        idempotencyKey: 'test-key',
        createdAt: new Date(),
        canceledAt: null,
        startInPatientTz: '2025-07-29T17:00:00.000-03:00',
        endInPatientTz: '2025-07-29T18:00:00.000-03:00',
        sessionType: {
          name: '60 min session',
          durationMin: 60,
          modality: 'online' as const,
        },
      };

      mockSessionsService.findOne.mockResolvedValue(mockSession);

      const result = await controller.findOne('session-1');

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Session retrieved successfully',
        data: mockSession,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSessionsService.findOne).toHaveBeenCalledWith('session-1');
    });

    it('should throw NotFoundException when session does not exist', async () => {
      mockSessionsService.findOne.mockRejectedValue(
        new NotFoundException('Session not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelSession', () => {
    it('should cancel session successfully', async () => {
      const mockSession = {
        id: 'session-1',
        therapistId: 't1',
        sessionTypeId: 'st1',
        patientId: 'user123',
        patientName: 'Lucas',
        patientEmail: 'lucas@mail.com',
        startUtc: new Date('2025-07-29T20:00:00Z'),
        endUtc: new Date('2025-07-29T21:00:00Z'),
        patientTz: 'America/Argentina/Buenos_Aires',
        status: 'CANCELED' as const,
        idempotencyKey: 'test-key',
        createdAt: new Date(),
        canceledAt: new Date(),
      };

      mockSessionsService.cancelSession.mockResolvedValue(mockSession);

      const result = await controller.cancelSession('session-1');

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Session canceled successfully',
        data: mockSession,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockSessionsService.cancelSession).toHaveBeenCalledWith(
        'session-1',
      );
    });

    it('should return session unchanged if already canceled (idempotent)', async () => {
      const mockSession = {
        id: 'session-1',
        therapistId: 't1',
        sessionTypeId: 'st1',
        patientId: 'user123',
        patientName: 'Lucas',
        patientEmail: 'lucas@mail.com',
        startUtc: new Date('2025-07-29T20:00:00Z'),
        endUtc: new Date('2025-07-29T21:00:00Z'),
        patientTz: 'America/Argentina/Buenos_Aires',
        status: 'CANCELED' as const,
        idempotencyKey: 'test-key',
        createdAt: new Date(),
        canceledAt: new Date('2025-07-29T10:00:00Z'),
      };

      mockSessionsService.cancelSession.mockResolvedValue(mockSession);

      const result = await controller.cancelSession('session-1');

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Session canceled successfully',
        data: mockSession,
      });
    });

    it('should throw NotFoundException when session does not exist', async () => {
      mockSessionsService.cancelSession.mockRejectedValue(
        new NotFoundException('Session not found'),
      );

      await expect(controller.cancelSession('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
