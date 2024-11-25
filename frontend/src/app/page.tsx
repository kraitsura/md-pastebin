import MarkdownPastebin from "@/components/MarkdownPastebin";

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 md:p-8 gap-8">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold">AI Context Pastebin</h1>
        {/* You can add additional header elements here */}
      </header>

      <main className="flex justify-center w-full">
        <div className="w-full max-w-5xl">
          <MarkdownPastebin />
        </div>
      </main>

      <footer className="flex justify-center items-center p-4 text-sm text-muted-foreground">
        <p>AI Context Pastebin - Share your prompts easily</p>
      </footer>
    </div>
  );
}