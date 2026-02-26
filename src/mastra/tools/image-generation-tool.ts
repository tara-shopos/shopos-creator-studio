import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google } from '@ai-sdk/google';
import { generateImage } from 'ai';

export const imageGenerationTool = createTool({
  id: 'generate-image',
  description:
    'Generate an image using Gemini 2.5 Flash Image model. Provide a detailed prompt describing the image to create. Returns the image as base64-encoded PNG.',
  inputSchema: z.object({
    prompt: z.string().describe('Detailed description of the image to generate'),
    aspectRatio: z
      .enum(['1:1', '3:4', '4:3', '9:16', '16:9'])
      .default('1:1')
      .describe('Aspect ratio for the generated image'),
  }),
  outputSchema: z.object({
    base64: z.string().describe('Base64-encoded PNG image data'),
    mimeType: z.string().describe('MIME type of the generated image'),
  }),
  execute: async ({ prompt, aspectRatio }) => {
    const { image } = await generateImage({
      model: google.image('gemini-2.5-flash-image'),
      prompt,
      aspectRatio,
    });

    return {
      base64: image.base64,
      mimeType: 'image/png',
    };
  },
});
