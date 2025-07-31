import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { FindTherapistsDto, Modality } from './find-therapists.dto';

describe('FindTherapistsDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        topicIds: '1,2,3',
        requireAll: 'true',
        modality: 'online',
        limit: '10',
        offset: '0',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with empty object', async () => {
      const dto = plainToClass(FindTherapistsDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with partial data', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        topicIds: '1',
        modality: 'in_person',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid modality', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        modality: 'invalid',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEnum).toBeDefined();
    });

    it('should fail validation with invalid limit (negative)', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        limit: -1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation with invalid limit (zero)', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation with invalid offset (negative)', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        offset: -1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should pass validation with valid offset (zero)', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        offset: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with non-string topicIds', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        topicIds: 123,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should transform invalid string requireAll to false', () => {
      const dto = plainToClass(FindTherapistsDto, {
        requireAll: 'not-a-boolean',
      });

      expect(dto.requireAll).toBe(false);
    });

    it('should fail validation with non-number limit', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        limit: 'not-a-number',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });

    it('should fail validation with non-number offset', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        offset: 'not-a-number',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });
  });

  describe('transformation', () => {
    it('should transform string requireAll to boolean', () => {
      const dto = plainToClass(FindTherapistsDto, {
        requireAll: 'true',
      });

      expect(dto.requireAll).toBe(true);
    });

    it('should transform string requireAll false to boolean', () => {
      const dto = plainToClass(FindTherapistsDto, {
        requireAll: 'false',
      });

      expect(dto.requireAll).toBe(false);
    });

    it('should transform boolean requireAll correctly', () => {
      const dto = plainToClass(FindTherapistsDto, {
        requireAll: true,
      });

      expect(dto.requireAll).toBe(true);
    });

    it('should transform string limit to number', () => {
      const dto = plainToClass(FindTherapistsDto, {
        limit: '10',
      });

      expect(dto.limit).toBe(10);
    });

    it('should transform string offset to number', () => {
      const dto = plainToClass(FindTherapistsDto, {
        offset: '5',
      });

      expect(dto.offset).toBe(5);
    });

    it('should use default values when not provided', () => {
      const dto = plainToClass(FindTherapistsDto, {});

      expect(dto.limit).toBe(10);
      expect(dto.offset).toBe(0);
    });

    it('should preserve string values for topicIds and modality', () => {
      const dto = plainToClass(FindTherapistsDto, {
        topicIds: '1,2,3',
        modality: 'online',
      });

      expect(dto.topicIds).toBe('1,2,3');
      expect(dto.modality).toBe('online');
    });
  });

  describe('Modality enum', () => {
    it('should have correct enum values', () => {
      expect(Modality.ONLINE).toBe('online');
      expect(Modality.IN_PERSON).toBe('in_person');
    });

    it('should accept valid modality values', async () => {
      const dto1 = plainToClass(FindTherapistsDto, {
        modality: 'online',
      });
      const errors1 = await validate(dto1);
      expect(errors1).toHaveLength(0);

      const dto2 = plainToClass(FindTherapistsDto, {
        modality: 'in_person',
      });
      const errors2 = await validate(dto2);
      expect(errors2).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty topicIds string', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        topicIds: '',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle whitespace in topicIds', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        topicIds: ' 1 , 2 , 3 ',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle large numbers for limit and offset', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        limit: 1000,
        offset: 500,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should handle zero for limit (should fail)', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        limit: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });

    it('should handle zero for offset (should pass)', async () => {
      const dto = plainToClass(FindTherapistsDto, {
        offset: 0,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
