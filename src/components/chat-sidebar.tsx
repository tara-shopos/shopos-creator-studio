'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    PanelLeftClose,
    PanelLeft,
    Plus,
    Trash2,
    MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Thread {
    id: string;
    title?: string;
    createdAt: string;
    updatedAt: string;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    currentThreadId: string | null;
    onSelectThread: (threadId: string) => void;
    onNewChat: () => void;
    refreshKey: number;
}

function formatRelativeTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
}

export function ChatSidebar({
    isOpen,
    onToggle,
    currentThreadId,
    onSelectThread,
    onNewChat,
    refreshKey,
}: ChatSidebarProps) {
    const [threads, setThreads] = useState<Thread[]>([]);

    const fetchThreads = useCallback(async () => {
        try {
            const res = await fetch('/api/threads');
            const data = await res.json();
            setThreads(data.threads || []);
        } catch {
            console.error('Failed to fetch threads');
        }
    }, []);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads, refreshKey]);

    const handleDelete = async (e: React.MouseEvent, threadId: string) => {
        e.stopPropagation();
        try {
            await fetch(`/api/threads/${threadId}`, { method: 'DELETE' });
            setThreads((prev) => prev.filter((t) => t.id !== threadId));
            if (currentThreadId === threadId) {
                onNewChat();
            }
        } catch {
            console.error('Failed to delete thread');
        }
    };

    return (
        <div className="relative flex h-full">
            <div
                className={cn(
                    'flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300',
                    isOpen ? 'w-72' : 'w-0 overflow-hidden border-r-0'
                )}
            >
                <div className="flex items-center justify-between p-3">
                    <h2 className="text-sm font-semibold truncate">
                        Chat History
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onToggle}
                    >
                        <PanelLeftClose className="size-4" />
                    </Button>
                </div>

                <div className="px-3 pb-3">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        size="sm"
                        onClick={onNewChat}
                    >
                        <Plus className="size-4" />
                        New Chat
                    </Button>
                </div>

                <Separator />

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {threads.length === 0 && (
                            <p className="px-2 py-4 text-xs text-muted-foreground text-center">
                                No conversations yet
                            </p>
                        )}
                        {threads.map((thread) => (
                            <button
                                key={thread.id}
                                onClick={() => onSelectThread(thread.id)}
                                className={cn(
                                    'group flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    currentThreadId === thread.id &&
                                        'bg-sidebar-accent text-sidebar-accent-foreground'
                                )}
                            >
                                <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm">
                                        {thread.title || 'New Chat'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatRelativeTime(
                                            thread.updatedAt || thread.createdAt
                                        )}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="opacity-0 group-hover:opacity-100 shrink-0"
                                    onClick={(e) =>
                                        handleDelete(e, thread.id)
                                    }
                                >
                                    <Trash2 className="size-3 text-muted-foreground" />
                                </Button>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {!isOpen && (
                <div className="flex flex-col gap-2 p-2 border-r border-sidebar-border bg-sidebar">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onToggle}
                    >
                        <PanelLeft className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onNewChat}
                    >
                        <Plus className="size-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
