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
        sessionTypes: {
          select: {
            modality: true,
          },
        },
      },
    });

    if (!therapist) {
      return null;
    }

    // Get distinct modalities from session types
    const modalities = [
      ...new Set(therapist.sessionTypes.map(st => st.modality)),
    ];

    // Transform therapistTopics to topics array
    return {
      id: therapist.id,
      name: therapist.name,
      timezone: therapist.timezone,
      topics: therapist.therapistTopics.map(tt => tt.topic),
      modalities,
    };
  }

  async findSessionTypes(therapistId: string) {
    return this.prisma.sessionType.findMany({
      where: { therapistId },
      select: {
        id: true,
        name: true,
        durationMin: true,
        modality: true,
      },
      orderBy: {
        durationMin: 'asc',
      },
    });
  }

  async findAll() {
    const therapists = await this.prisma.therapist.findMany({
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
        sessionTypes: {
          select: {
            modality: true,
          },
        },
      },
    });

    return therapists.map(therapist => {
      // Get distinct modalities from session types
      const modalities = [
        ...new Set(therapist.sessionTypes.map(st => st.modality)),
      ];

      return {
        id: therapist.id,
        name: therapist.name,
        timezone: therapist.timezone,
        topics: therapist.therapistTopics.map(tt => tt.topic),
        modalities,
      };
    });
  }
}
