import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const firecrawlSearchTool = createTool({
  id: 'firecrawl-search',
  description:
    'Search the web using Firecrawl. Returns summarized results with titles, URLs, and content snippets. Use this to research brands, competitors, trends, or any web information.',
  inputSchema: z.object({
    query: z.string().describe('The search query to look up on the web'),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe('Maximum number of results to return (default: 5)'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        description: z.string(),
        markdown: z.string(),
      })
    ),
  }),
  execute: async ({ query, limit }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        limit: limit ?? 5,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Firecrawl search failed (${response.status}): ${errorBody}`
      );
    }

    const data = await response.json();

    const results = (data.data ?? []).map(
      (item: Record<string, unknown>) => ({
        title: (item.title as string) ?? '',
        url: (item.url as string) ?? '',
        description: (item.description as string) ?? '',
        markdown: (item.markdown as string) ?? '',
      })
    );

    return { results };
  },
});
