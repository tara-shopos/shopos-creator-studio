import { mastra } from '@/mastra';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const RESOURCE_ID = 'chat-user';

export async function GET() {
    const memory = await mastra.getAgentById('weather-agent').getMemory();
    if (!memory) {
        return NextResponse.json({ threads: [] });
    }

    try {
        const result = await memory.listThreads({
            orderBy: { field: 'updatedAt', direction: 'DESC' },
            filter: { resourceId: RESOURCE_ID },
        });
        return NextResponse.json({ threads: result.threads });
    } catch {
        return NextResponse.json({ threads: [] });
    }
}

export async function POST() {
    const memory = await mastra.getAgentById('weather-agent').getMemory();
    if (!memory) {
        return NextResponse.json({ error: 'Memory not configured' }, { status: 500 });
    }

    const threadId = randomUUID();
    const thread = await memory.createThread({
        threadId,
        resourceId: RESOURCE_ID,
        title: 'New Chat',
    });

    return NextResponse.json({ thread });
}
