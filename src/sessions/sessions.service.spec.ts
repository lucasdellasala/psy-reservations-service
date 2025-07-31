/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { DbService } from '../prisma/db.service';
import { TherapistsService } from '../therapists/therapists.service';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  ConflictException,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { DateTime } from 'luxon';

describe('SessionsService', () => {
  let service: SessionsService;
  let mockPrismaService: any;
  let mockDbService: any;
  let mockTherapistsService: any;

  beforeEach(async () => {
    const mockPrismaServiceObj = {
      session: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      sessionType: {
        findUnique: jest.fn(),
      },
    };

    const mockDbServiceObj = {
      withTherapistLock: jest.fn(),
    };

    const mockTherapistsServiceObj = {
      hasOverlap: jest.fn(),
      getAvailability: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaServiceObj,
        },
        {
          provide: DbService,
          useValue: mockDbServiceObj,
        },
        {
          provide: TherapistsService,
          useValue: mockTherapistsServiceObj,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockPrismaService = module.get(PrismaService);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockDbService = module.get(DbService);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockTherapistsService = module.get(TherapistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

    const idempotencyKey = '123e4567-e89b-12d3-a456-426614174000';

    it('should return existing session if idempotencyKey already exists', async () => {
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
        status: 'CONFIRMED',
        idempotencyKey,
        createdAt: new Date(),
        canceledAt: null,
      };

      mockPrismaService.session.findFirst.mockResolvedValue(existingSession);

      const result = await service.createSession(
        createSessionDto,
        idempotencyKey,
      );

      expect(result).toEqual(existingSession);
      expect(mockPrismaService.session.findFirst).toHaveBeenCalledWith({
        where: { idempotencyKey },
      });
    });

    it('should create new session when idempotencyKey does not exist', async () => {
      const sessionType = {
        durationMin: 60,
        modality: 'online',
      };

      const mockAvailability = {
        therapistId: 't1',
        sessionTypeId: 'st1',
        weekStart: '2025-07-28',
        patientTz: 'UTC',
        stepMin: 15,
        availability: {
          '2025-07-29': [
            {
              startUtc: '2025-07-29T19:00:00Z',
              endUtc: '2025-07-29T21:00:00Z',
            },
          ],
        },
      };

      const newSession = {
        id: 'session-1',
        status: 'CONFIRMED',
        idempotencyKey,
      };

      mockPrismaService.session.findFirst.mockResolvedValue(null);
      mockPrismaService.sessionType.findUnique.mockResolvedValue(sessionType);
      mockTherapistsService.getAvailability.mockResolvedValue(mockAvailability);
      mockTherapistsService.hasOverlap.mockResolvedValue(false);
      mockDbService.withTherapistLock.mockImplementation(
        async (therapistId, fn) => {
          const mockTx = {
            session: {
              create: jest.fn().mockResolvedValue(newSession),
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return await fn(mockTx);
        },
      );

      const result = await service.createSession(
        createSessionDto,
        idempotencyKey,
      );

      expect(result).toEqual(newSession);
      expect(mockPrismaService.sessionType.findUnique).toHaveBeenCalledWith({
        where: { id: 'st1' },
        select: { durationMin: true, modality: true },
      });
    });

    it('should throw UnprocessableEntityException when session type not found', async () => {
      mockPrismaService.session.findFirst.mockResolvedValue(null);
      mockPrismaService.sessionType.findUnique.mockResolvedValue(null);

      await expect(
        service.createSession(createSessionDto, idempotencyKey),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException when session is OUT_OF_WINDOW', async () => {
      const sessionType = {
        durationMin: 60,
        modality: 'online',
      };

      const mockAvailability = {
        therapistId: 't1',
        sessionTypeId: 'st1',
        weekStart: '2025-07-28',
        patientTz: 'UTC',
        stepMin: 15,
        availability: {
          '2025-07-28': [], // No availability windows
        },
      };

      mockPrismaService.session.findFirst.mockResolvedValue(null);
      mockPrismaService.sessionType.findUnique.mockResolvedValue(sessionType);
      mockTherapistsService.getAvailability.mockResolvedValue(mockAvailability);

      await expect(
        service.createSession(createSessionDto, idempotencyKey),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw ConflictException when session slot is SLOT_TAKEN', async () => {
      const sessionType = {
        durationMin: 60,
        modality: 'online',
      };

      const mockAvailability = {
        therapistId: 't1',
        sessionTypeId: 'st1',
        weekStart: '2025-07-28',
        patientTz: 'UTC',
        stepMin: 15,
        availability: {
          '2025-07-29': [
            {
              startUtc: '2025-07-29T19:00:00Z',
              endUtc: '2025-07-29T21:00:00Z',
            },
          ],
        },
      };

      const newSession = {
        id: 'session-1',
        status: 'CONFIRMED',
        idempotencyKey,
      };

      mockPrismaService.session.findFirst.mockResolvedValue(null);
      mockPrismaService.sessionType.findUnique.mockResolvedValue(sessionType);
      mockTherapistsService.getAvailability.mockResolvedValue(mockAvailability);
      mockTherapistsService.hasOverlap.mockResolvedValue(true);
      mockDbService.withTherapistLock.mockImplementation(
        async (therapistId, fn) => {
          const mockTx = {
            session: {
              create: jest.fn().mockResolvedValue(newSession),
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return await fn(mockTx);
        },
      );

      await expect(
        service.createSession(createSessionDto, idempotencyKey),
      ).rejects.toThrow(ConflictException);
    });

    it('should calculate endUtc correctly based on durationMin', async () => {
      const sessionType = {
        durationMin: 90,
        modality: 'online',
      };

      const mockAvailability = {
        therapistId: 't1',
        sessionTypeId: 'st1',
        weekStart: '2025-07-28',
        patientTz: 'UTC',
        stepMin: 15,
        availability: {
          '2025-07-29': [
            {
              startUtc: '2025-07-29T19:00:00Z',
              endUtc: '2025-07-29T22:00:00Z',
            },
          ],
        },
      };

      const newSession = {
        id: 'session-1',
        status: 'CONFIRMED',
        idempotencyKey,
      };

      mockPrismaService.session.findFirst.mockResolvedValue(null);
      mockPrismaService.sessionType.findUnique.mockResolvedValue(sessionType);
      mockTherapistsService.getAvailability.mockResolvedValue(mockAvailability);
      mockTherapistsService.hasOverlap.mockResolvedValue(false);
      mockDbService.withTherapistLock.mockImplementation(
        async (therapistId, fn) => {
          const mockTx = {
            session: {
              create: jest.fn().mockResolvedValue(newSession),
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return await fn(mockTx);
        },
      );

      await service.createSession(createSessionDto, idempotencyKey);

      // Verificar que se calculó correctamente el endUtc
      const startDateTime = DateTime.fromISO('2025-07-29T20:00:00Z');
      const expectedEndDateTime = startDateTime.plus({ minutes: 90 });
      const expectedEndUtc = expectedEndDateTime.toISO() || '';

      expect(mockTherapistsService.hasOverlap).toHaveBeenCalledWith(
        't1',
        '2025-07-29T20:00:00Z',
        expectedEndUtc,
      );
    });
  });

  describe('findOne', () => {
    it('should return session with timezone-converted times', async () => {
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
        status: 'CONFIRMED',
        idempotencyKey: 'test-key',
        createdAt: new Date(),
        canceledAt: null,
        sessionType: {
          name: '60 min session',
          durationMin: 60,
          modality: 'online',
        },
      };

      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      const result = await service.findOne('session-1');

      expect(result).toHaveProperty('startInPatientTz');
      expect(result).toHaveProperty('endInPatientTz');
      expect(result.startInPatientTz).toContain('2025-07-29');
      expect(result.endInPatientTz).toContain('2025-07-29');
      expect(mockPrismaService.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        include: {
          sessionType: {
            select: {
              name: true,
              durationMin: true,
              modality: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException when session does not exist', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancelSession', () => {
    it('should cancel a session successfully', async () => {
      const mockSession = {
        id: 'session-1',
        status: 'CONFIRMED',
        canceledAt: null,
      };

      const updatedSession = {
        ...mockSession,
        status: 'CANCELED',
        canceledAt: new Date(),
      };

      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.session.update.mockResolvedValue(updatedSession);

      const result = await service.cancelSession('session-1');

      expect(result.status).toBe('CANCELED');
      expect(result.canceledAt).toBeDefined();
      expect(mockPrismaService.session.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          status: 'CANCELED',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          canceledAt: expect.any(Date),
        },
      });
    });

    it('should return session unchanged if already canceled (idempotent)', async () => {
      const mockSession = {
        id: 'session-1',
        status: 'CANCELED',
        canceledAt: new Date('2025-07-29T10:00:00Z'),
      };

      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      const result = await service.cancelSession('session-1');

      expect(result.status).toBe('CANCELED');
      expect(result.canceledAt).toEqual(new Date('2025-07-29T10:00:00Z'));
      expect(mockPrismaService.session.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when session does not exist', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await expect(service.cancelSession('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
