// app/p/[id]/page.tsx
import { Suspense } from 'react';
import PastebinClientWrapper from '@/components/PastebinClientWrapper';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PastePage({ params }: PageProps) {
  // Await the params since they're asynchronous in Next.js App Router
  const resolvedParams = await params;
  const pasteId = resolvedParams.id;

  if (!pasteId) {
    return (
      <div className="text-center p-4">
        <p>Invalid paste ID</p>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 md:p-8 gap-8">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold">AI Context Pastebin</h1>
      </header>

      <main className="flex justify-center w-full">
        <div className="w-full max-w-5xl">
          <Suspense fallback={<div>Loading...</div>}>
            <PastebinClientWrapper initialPasteId={pasteId} />
          </Suspense>
        </div>
      </main>

      <footer className="flex justify-center items-center p-4 text-sm text-muted-foreground">
        <p>AI Context Pastebin - Share your prompts easily</p>
      </footer>
    </div>
  );
}