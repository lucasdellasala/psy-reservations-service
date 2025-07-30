export const TopicsSwagger = {
  tags: 'topics',
  getAll: {
    operation: { summary: 'Get all topics' },
    response: {
      status: 200,
      description: 'List of all available topics',
      schema: {
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
};
