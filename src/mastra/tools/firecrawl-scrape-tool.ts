import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const firecrawlScrapeTool = createTool({
  id: 'firecrawl-scrape',
  description:
    'Scrape content from a specific URL using Firecrawl. Returns the page content as markdown. Use this to extract detailed information from a known webpage — brand pages, product pages, articles, etc.',
  inputSchema: z.object({
    url: z.string().url().describe('The URL of the page to scrape'),
    onlyMainContent: z
      .boolean()
      .optional()
      .default(true)
      .describe(
        'If true, returns only the main content (no nav/footer). Default: true'
      ),
  }),
  outputSchema: z.object({
    title: z.string(),
    url: z.string(),
    markdown: z.string(),
    description: z.string(),
  }),
  execute: async ({ url, onlyMainContent }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error('FIRECRAWL_API_KEY environment variable is not set');
    }

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: onlyMainContent ?? true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Firecrawl scrape failed (${response.status}): ${errorBody}`
      );
    }

    const data = await response.json();
    const result = data.data ?? {};

    return {
      title: (result.metadata?.title as string) ?? '',
      url: (result.metadata?.sourceURL as string) ?? url,
      markdown: (result.markdown as string) ?? '',
      description: (result.metadata?.description as string) ?? '',
    };
  },
});
