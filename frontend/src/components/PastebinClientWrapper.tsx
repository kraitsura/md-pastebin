'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownPastebin from './MarkdownPastebin';

export default function PastebinClientWrapper({ initialPasteId }: { initialPasteId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!initialPasteId) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [initialPasteId, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <MarkdownPastebin initialPasteId={initialPasteId} />;
}