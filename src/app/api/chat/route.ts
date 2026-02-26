import { handleChatStream } from '@mastra/ai-sdk';
import { toAISdkV5Messages } from '@mastra/ai-sdk/ui';
import { createUIMessageStreamResponse } from 'ai';
import { mastra } from '@/mastra';
import { NextResponse } from 'next/server';

const RESOURCE_ID = 'chat-user';

export async function POST(req: Request) {
    const params = await req.json();
    const threadId = params.threadId;

    const stream = await handleChatStream({
        mastra,
        agentId: 'creative-director',
        params: {
            ...params,
            memory: {
                ...params.memory,
                thread: threadId,
                resource: RESOURCE_ID,
            },
        },
    });
    return createUIMessageStreamResponse({ stream });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
        return NextResponse.json([]);
    }

    const memory = await mastra.getAgentById('weather-agent').getMemory();
    let response = null;

    try {
        response = await memory?.recall({
            threadId,
            resourceId: RESOURCE_ID,
        });
    } catch {
        console.log('No previous messages found.');
    }

    const uiMessages = toAISdkV5Messages(response?.messages || []);
    return NextResponse.json(uiMessages);
}
