import React, { type ReactNode } from "react";
import { type Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Element } from "hast";

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  node?: Element;
  style?: React.CSSProperties;
}

const CodeBlock: Components['code'] = ({ 
  inline, 
  className, 
  children,
  style,
  ...props 
}: CodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  
  return !inline && match ? (
    <div className="rounded-md">
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code className={className} style={style} {...props}>
      {children}
    </code>
  );
};

export default CodeBlock;