import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindTherapistsDto } from './dto/find-therapists.dto';

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

  async findWithFilters(filters: FindTherapistsDto) {
    const { topicIds, requireAll, modality, limit = 10, offset = 0 } = filters;

    let therapists = await this.prisma.therapist.findMany({
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

    if (topicIds) {
      const topicIdsArray = topicIds.split(',').map(id => id.trim());

      therapists = therapists.filter(therapist => {
        const therapistTopicIds = therapist.therapistTopics.map(
          tt => tt.topic.id,
        );

        if (requireAll) {
          return topicIdsArray.every(topicId =>
            therapistTopicIds.includes(topicId),
          );
        } else {
          return topicIdsArray.some(topicId =>
            therapistTopicIds.includes(topicId),
          );
        }
      });
    }

    if (modality) {
      therapists = therapists.filter(therapist => {
        const therapistModalities = therapist.sessionTypes.map(
          st => st.modality,
        );
        return therapistModalities.includes(modality);
      });
    }

    const paginatedTherapists = therapists.slice(offset, offset + limit);

    return paginatedTherapists.map(therapist => {
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
