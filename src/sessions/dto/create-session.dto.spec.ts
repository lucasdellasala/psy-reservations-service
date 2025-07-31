import { validate } from 'class-validator';
import { CreateSessionDto } from './create-session.dto';

describe('CreateSessionDto', () => {
  it('should be defined', () => {
    expect(CreateSessionDto).toBeDefined();
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = 't1';
      dto.sessionTypeId = 'st1';
      dto.startUtc = '2025-07-29T20:00:00Z';
      dto.patientId = 'user123';
      dto.patientName = 'Lucas';
      dto.patientEmail = 'lucas@mail.com';
      dto.patientTz = 'America/Argentina/Buenos_Aires';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing therapistId', async () => {
      const dto = new CreateSessionDto();
      dto.sessionTypeId = 'st1';
      dto.startUtc = '2025-07-29T20:00:00Z';
      dto.patientId = 'user123';
      dto.patientName = 'Lucas';
      dto.patientEmail = 'lucas@mail.com';
      dto.patientTz = 'America/Argentina/Buenos_Aires';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('therapistId');
    });

    it('should fail validation with missing sessionTypeId', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = 't1';
      dto.startUtc = '2025-07-29T20:00:00Z';
      dto.patientId = 'user123';
      dto.patientName = 'Lucas';
      dto.patientEmail = 'lucas@mail.com';
      dto.patientTz = 'America/Argentina/Buenos_Aires';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('sessionTypeId');
    });

    it('should fail validation with invalid startUtc format', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = 't1';
      dto.sessionTypeId = 'st1';
      dto.startUtc = 'invalid-date';
      dto.patientId = 'user123';
      dto.patientName = 'Lucas';
      dto.patientEmail = 'lucas@mail.com';
      dto.patientTz = 'America/Argentina/Buenos_Aires';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('startUtc');
    });

    it('should pass validation with valid ISO8601 startUtc', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = 't1';
      dto.sessionTypeId = 'st1';
      dto.startUtc = '2025-07-29T20:00:00.000Z';
      dto.patientId = 'user123';
      dto.patientName = 'Lucas';
      dto.patientEmail = 'lucas@mail.com';
      dto.patientTz = 'America/Argentina/Buenos_Aires';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing patientId', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = 't1';
      dto.sessionTypeId = 'st1';
      dto.startUtc = '2025-07-29T20:00:00Z';
      dto.patientName = 'Lucas';
      dto.patientEmail = 'lucas@mail.com';
      dto.patientTz = 'America/Argentina/Buenos_Aires';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('patientId');
    });

    it('should fail validation with missing patientName', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = 't1';
      dto.sessionTypeId = 'st1';
      dto.startUtc = '2025-07-29T20:00:00Z';
      dto.patientId = 'user123';
      dto.patientEmail = 'lucas@mail.com';
      dto.patientTz = 'America/Argentina/Buenos_Aires';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('patientName');
    });

    it('should fail validation with invalid patientEmail', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = 't1';
      dto.sessionTypeId = 'st1';
      dto.startUtc = '2025-07-29T20:00:00Z';
      dto.patientId = 'user123';
      dto.patientName = 'Lucas';
      dto.patientEmail = 'invalid-email';
      dto.patientTz = 'America/Argentina/Buenos_Aires';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('patientEmail');
    });

    it('should pass validation with valid email formats', async () => {
      const validEmails = [
        'lucas@mail.com',
        'test.user@example.org',
        'user+tag@domain.co.uk',
      ];

      for (const email of validEmails) {
        const dto = new CreateSessionDto();
        dto.therapistId = 't1';
        dto.sessionTypeId = 'st1';
        dto.startUtc = '2025-07-29T20:00:00Z';
        dto.patientId = 'user123';
        dto.patientName = 'Lucas';
        dto.patientEmail = email;
        dto.patientTz = 'America/Argentina/Buenos_Aires';

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation with missing patientTz', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = 't1';
      dto.sessionTypeId = 'st1';
      dto.startUtc = '2025-07-29T20:00:00Z';
      dto.patientId = 'user123';
      dto.patientName = 'Lucas';
      dto.patientEmail = 'lucas@mail.com';

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('patientTz');
    });

    it('should fail validation with empty strings', async () => {
      const dto = new CreateSessionDto();
      dto.therapistId = '';
      dto.sessionTypeId = '';
      dto.startUtc = '2025-07-29T20:00:00Z';
      dto.patientId = '';
      dto.patientName = '';
      dto.patientEmail = 'lucas@mail.com';
      dto.patientTz = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
