'use client';

import '@/app/globals.css';
import { useEffect, useState, useCallback, useRef } from 'react';
import { DefaultChatTransport, ToolUIPart } from 'ai';
import { useChat } from '@ai-sdk/react';

import {
    PromptInput,
    PromptInputBody,
    PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';

import {
    Message,
    MessageContent,
    MessageResponse,
} from '@/components/ai-elements/message';

import {
    Tool,
    ToolHeader,
    ToolContent,
    ToolInput,
    ToolOutput,
} from '@/components/ai-elements/tool';

import { ChatSidebar } from '@/components/chat-sidebar';

const transport = new DefaultChatTransport({
    api: '/api/chat',
});

function Chat() {
    const [input, setInput] = useState('');
    const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);
    const threadIdRef = useRef<string | null>(null);

    const { messages, setMessages, sendMessage, status } = useChat({
        transport,
    });

    const loadThreadMessages = useCallback(
        async (threadId: string) => {
            try {
                const res = await fetch(`/api/threads/${threadId}`);
                const data = await res.json();
                setMessages([...data]);
            } catch {
                setMessages([]);
            }
        },
        [setMessages]
    );

    useEffect(() => {
        threadIdRef.current = currentThreadId;
    }, [currentThreadId]);

    useEffect(() => {
        if (currentThreadId) {
            loadThreadMessages(currentThreadId);
        }
    }, [currentThreadId, loadThreadMessages]);

    const handleNewChat = useCallback(() => {
        setCurrentThreadId(null);
        threadIdRef.current = null;
        setMessages([]);
    }, [setMessages]);

    const handleSelectThread = useCallback(
        (threadId: string) => {
            if (threadId !== threadIdRef.current) {
                setCurrentThreadId(threadId);
            }
        },
        []
    );

    const handleSubmit = async () => {
        if (!input.trim()) return;

        let threadId = threadIdRef.current;
        if (!threadId) {
            const res = await fetch('/api/threads', { method: 'POST' });
            const data = await res.json();
            threadId = data.thread.id;
            setCurrentThreadId(threadId);
            threadIdRef.current = threadId;
        }

        sendMessage({ text: input }, { body: { threadId } });
        setInput('');

        setTimeout(() => {
            setSidebarRefreshKey((k) => k + 1);
        }, 2000);
    };

    return (
        <div className="flex h-screen w-full">
            <ChatSidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen((o) => !o)}
                currentThreadId={currentThreadId}
                onSelectThread={handleSelectThread}
                onNewChat={handleNewChat}
                refreshKey={sidebarRefreshKey}
            />

            <div className="relative flex-1 h-full p-6">
                <div className="flex h-full flex-col">
                    <Conversation className="h-full">
                        <ConversationContent className="max-w-4xl mx-auto w-full">
                            {messages.map((message) => (
                                <div key={message.id} className="min-w-0 w-full">
                                    {message.parts?.map((part, i) => {
                                        if (part.type === 'text') {
                                            return (
                                                <Message
                                                    key={`${message.id}-${i}`}
                                                    from={message.role}>
                                                    <MessageContent>
                                                        <MessageResponse>{part.text}</MessageResponse>
                                                    </MessageContent>
                                                </Message>
                                            );
                                        }

                                        if (part.type?.startsWith('tool-')) {
                                            return (
                                                <div key={`${message.id}-${i}`} className="min-w-0 w-full max-w-full">
                                                    <Tool>
                                                        <ToolHeader
                                                            type={(part as ToolUIPart).type}
                                                            state={(part as ToolUIPart).state || 'output-available'}
                                                            className="cursor-pointer"
                                                        />
                                                        <ToolContent>
                                                            <ToolInput input={(part as ToolUIPart).input || {}} />
                                                            <ToolOutput
                                                                output={(part as ToolUIPart).output}
                                                                errorText={(part as ToolUIPart).errorText}
                                                            />
                                                        </ToolContent>
                                                    </Tool>
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}
                                </div>
                            ))}
                            <ConversationScrollButton />
                        </ConversationContent>
                    </Conversation>

                    <PromptInput onSubmit={handleSubmit} className="mt-20 max-w-4xl mx-auto w-full">
                        <PromptInputBody>
                            <PromptInputTextarea
                                onChange={(e) => setInput(e.target.value)}
                                className="md:leading-10"
                                value={input}
                                placeholder="Type your message..."
                                disabled={status !== 'ready'}
                            />
                        </PromptInputBody>
                    </PromptInput>
                </div>
            </div>
        </div>
    );
}

export default Chat;
