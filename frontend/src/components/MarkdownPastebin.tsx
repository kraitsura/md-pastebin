'use client';

import React, { useState, useEffect, ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
	Copy,
	Download,
	Upload,
	Link as LinkIcon,
	ExternalLink,
	Eye,
	Edit,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { type Components } from "react-markdown";
import CodeBlock from "./markdown/CodeBlock";
import { apiConfig } from "@/config/api";

interface MarkdownPastebinProps {
	initialPasteId?: string;
}

interface PasteResponse {
	id: string;
	content: string;
}

interface PasteData {
	content: string;
}

const MarkdownComponents: Components = {
  code: CodeBlock,
  h1: ({children}) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
  h2: ({children}) => <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>,
  h3: ({children}) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
  ol: ({children, start}) => (
    <ol className="list-decimal list-outside mb-4 ml-6" style={{ counterReset: `list-item ${(start || 1) - 1}` }}>
      {children}
    </ol>
  ),
  ul: ({children}) => <ul className="list-disc list-outside mb-4 ml-6">{children}</ul>,
  li: ({children}) => (
    <li className="mb-4">
      {children}
    </li>
  ),
  pre: ({children}) => (
    <div className="not-prose">
      {children}
    </div>
  ),
  hr: () => <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />,
  p: ({children}) => <p className="mb-4">{children}</p>,
}

const MarkdownPastebin: React.FC<MarkdownPastebinProps> = ({
	initialPasteId,
}) => {
  const router = useRouter();
	const [content, setContent] = useState<string>("");
	const [copied, setCopied] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");
	const [pasteUrl, setPasteUrl] = useState<string>("");
	const [urlCopied, setUrlCopied] = useState<boolean>(false);
	const [activeTab, setActiveTab] = useState<string>("edit");
	const [isMarkdownFile, setIsMarkdownFile] = useState<boolean>(true);

	useEffect(() => {
		if (initialPasteId) {
			void loadPaste(initialPasteId);
			setPasteUrl(`${window.location.origin}/p/${initialPasteId}`);
		}
	}, [initialPasteId]);

	const loadPaste = async (id: string): Promise<void> => {
		try {
			setLoading(true);
			const response = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.getPaste(id)}`);

			if (!response.ok) {
				throw new Error(
					response.status === 404
						? "Paste not found"
						: "Failed to load paste"
				);
			}

			const data = (await response.json()) as PasteResponse;
			setContent(data.content);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
		} finally {
			setLoading(false);
		}
	};

  const createPaste = async (): Promise<void> => {
    if (!content.trim()) {
      setError("Content cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const pasteData: PasteData = { content };
      const response = await fetch(`${apiConfig.baseURL}${apiConfig.endpoints.createPaste}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pasteData),
      });

      if (!response.ok) {
        throw new Error("Failed to create paste");
      }

      const data = (await response.json()) as PasteResponse;
      const fullUrl = `${window.location.origin}/p/${data.id}`;
      setPasteUrl(fullUrl);

      router.push(`/p/${data.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };


	const handleCopy = async (
		text: string,
		setCopiedState: (value: boolean) => void
	): Promise<void> => {
		if (!navigator?.clipboard) {
			setError("Clipboard API not available");
			return;
		}

		try {
			await navigator.clipboard.writeText(text);
			setCopiedState(true);
			setTimeout(() => setCopiedState(false), 2000);
		} catch {
			setError("Failed to copy to clipboard");
		}
	};

	const handleDownload = (): void => {
		if (!content) {
			setError("No content to download");
			return;
		}

		try {
			const blob = new Blob([content], { type: "text/markdown" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `ai-context.${isMarkdownFile ? 'md' : 'txt'}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch {
			setError("Failed to download file");
		}
	};

	const handleUpload = (event: ChangeEvent<HTMLInputElement>): void => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setError("File size must be less than 5MB");
			return;
		}

		// Check if file is markdown
		const isMarkdown = file.name.toLowerCase().endsWith('.md');
		setIsMarkdownFile(isMarkdown);
		
		// If it's not a markdown file, switch to edit tab
		if (!isMarkdown && activeTab === 'preview') {
			setActiveTab('edit');
		}

		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => {
			const result = e.target?.result;
			if (typeof result === "string") {
				setContent(result);
			}
		};
		reader.onerror = () => {
			setError("Failed to read file");
		};
		reader.readAsText(file);
	};

	const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
		setContent(e.target.value);
		if (error) setError("");
	};

	const renderEditor = () => (
		<textarea
			className="w-full h-[32rem] p-4 font-mono text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
			value={content}
			onChange={handleContentChange}
			placeholder="Paste your AI context/prompt here..."
			disabled={loading}
			spellCheck={false}
		/>
	);

	return (
		<Card className="w-full bg-card text-card-foreground">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-lg font-semibold">
					Share AI Context
				</CardTitle>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleCopy(content, setCopied)}
						disabled={!content || loading}
						className="flex items-center gap-2"
					>
						<Copy className="h-4 w-4" />
						{copied ? "Copied!" : "Copy"}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleDownload}
						disabled={!content || loading}
						className="flex items-center gap-2"
					>
						<Download className="h-4 w-4" />
						Download
					</Button>
					<label>
						<Button
							variant="outline"
							size="sm"
							className="flex items-center gap-2"
							disabled={loading}
							onClick={() =>
								document.getElementById("file-upload")?.click()
							}
						>
							<Upload className="h-4 w-4" />
							Upload
						</Button>
						<input
							id="file-upload"
							type="file"
							accept=".md,.txt"
							className="hidden"
							onChange={handleUpload}
							disabled={loading}
						/>
					</label>
					<Button
						variant="default"
						size="sm"
						onClick={() => void createPaste()}
						disabled={loading || !content.trim()}
						className="flex items-center gap-2"
					>
						<LinkIcon className="h-4 w-4" />
						{loading ? "Creating..." : "Create Link"}
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<Alert variant="destructive">
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				{pasteUrl && (
					<Alert>
						<div className="flex items-center justify-between">
							<AlertDescription>
								<a
									href={pasteUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-primary hover:underline"
								>
									{pasteUrl}
									<ExternalLink className="h-4 w-4" />
								</a>
							</AlertDescription>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									handleCopy(pasteUrl, setUrlCopied)
								}
							>
								{urlCopied ? "Copied!" : "Copy URL"}
							</Button>
						</div>
					</Alert>
				)}
				{isMarkdownFile ? (
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger
								value="edit"
								className="flex items-center gap-2"
							>
								<Edit className="h-4 w-4" />
								Edit
							</TabsTrigger>
							<TabsTrigger
								value="preview"
								className="flex items-center gap-2"
							>
								<Eye className="h-4 w-4" />
								Preview
							</TabsTrigger>
						</TabsList>
						<TabsContent value="edit">
							{renderEditor()}
						</TabsContent>
						<TabsContent value="preview">
							<div className="w-full h-[32rem] p-4 overflow-auto rounded-md border border-input bg-background">
								<div className="prose prose-sm max-w-none dark:prose-invert">
									<ReactMarkdown
										remarkPlugins={[remarkGfm]}
										rehypePlugins={[rehypeRaw]}
										components={MarkdownComponents}
									>
										{content}
									</ReactMarkdown>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				) : (
					<div className="w-full">
						{renderEditor()}
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default MarkdownPastebin;