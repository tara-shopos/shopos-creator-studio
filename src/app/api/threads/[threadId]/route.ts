import { toAISdkV5Messages } from '@mastra/ai-sdk/ui';
import { mastra } from '@/mastra';
import { NextResponse } from 'next/server';

const RESOURCE_ID = 'chat-user';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ threadId: string }> }
) {
    const { threadId } = await params;
    const memory = await mastra.getAgentById('weather-agent').getMemory();
    if (!memory) {
        return NextResponse.json([]);
    }

    try {
        const response = await memory.recall({
            threadId,
            resourceId: RESOURCE_ID,
        });
        const uiMessages = toAISdkV5Messages(response?.messages || []);
        return NextResponse.json(uiMessages);
    } catch {
        return NextResponse.json([]);
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ threadId: string }> }
) {
    const { threadId } = await params;
    const memory = await mastra.getAgentById('weather-agent').getMemory();
    if (!memory) {
        return NextResponse.json({ error: 'Memory not configured' }, { status: 500 });
    }

    try {
        await memory.deleteThread(threadId);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
    }
}
