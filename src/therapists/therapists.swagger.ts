export const TherapistsSwagger = {
  tags: 'therapists',
  getAll: {
    operation: { summary: 'Get therapists with optional filters' },
    response: {
      status: 200,
      description:
        'List of therapists with topics and modalities, filtered by criteria',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            timezone: { type: 'string' },
            topics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
            modalities: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['online', 'in_person'],
              },
            },
            availabilitySummary: {
              type: 'object',
              properties: {
                freeSlotsCount: { type: 'number' },
              },
            },
          },
        },
      },
    },
  },
  getOne: {
    operation: { summary: 'Get therapist profile by ID' },
    param: { name: 'id', description: 'Therapist ID' },
    response: {
      status: 200,
      description: 'Therapist profile with topics and modalities',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          timezone: { type: 'string' },
          topics: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
          modalities: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['online', 'in_person'],
            },
          },
        },
      },
    },
    notFound: { status: 404, description: 'Therapist not found' },
  },
  getSessionTypes: {
    operation: { summary: 'Get therapist session types' },
    param: { name: 'id', description: 'Therapist ID' },
    response: {
      status: 200,
      description: 'List of therapist session types with modality',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            durationMin: { type: 'number' },
            modality: {
              type: 'string',
              enum: ['online', 'in_person'],
            },
          },
        },
      },
    },
    notFound: { status: 404, description: 'Therapist not found' },
  },
};
