import { Module } from '@nestjs/common';
import { TherapistsController } from './therapists.controller';
import { TherapistsService } from './therapists.service';
import { AvailabilityService } from './services/availability.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [TherapistsController],
  providers: [TherapistsService, AvailabilityService],
  exports: [TherapistsService, AvailabilityService],
})
export class TherapistsModule {}
