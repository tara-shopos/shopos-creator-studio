import Link from "next/link";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
            <main className="flex flex-col items-center gap-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                    Shopos Creator Studio
                </h1>
                <p className="text-lg text-foreground/70 max-w-md">
                    AI-powered creator studio built with Mastra and Next.js
                </p>
                <Link
                    href="/chat"
                    className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    Open Chat →
                </Link>
            </main>
        </div>
    );
}
