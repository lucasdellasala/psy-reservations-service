import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TherapistsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const therapist = await this.prisma.therapist.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        timezone: true,
        therapistTopics: {
          select: {
            topic: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!therapist) {
      return null;
    }

    // Transform therapistTopics to topics array
    return {
      id: therapist.id,
      name: therapist.name,
      timezone: therapist.timezone,
      topics: therapist.therapistTopics.map(tt => tt.topic),
    };
  }

  async findSessionTypes(therapistId: string) {
    return this.prisma.sessionType.findMany({
      where: { therapistId },
      select: {
        id: true,
        name: true,
        durationMin: true,
        priceMinor: true,
      },
      orderBy: {
        durationMin: 'asc',
      },
    });
  }
}
