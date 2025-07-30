export const TherapistsSwagger = {
  tags: 'therapists',
  getOne: {
    operation: { summary: 'Get therapist profile by ID' },
    param: { name: 'id', description: 'Therapist ID' },
    response: {
      status: 200,
      description: 'Therapist profile with topics',
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
      description: 'List of therapist session types',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            durationMin: { type: 'number' },
            priceMinor: { type: 'number' },
          },
        },
      },
    },
    notFound: { status: 404, description: 'Therapist not found' },
  },
};
