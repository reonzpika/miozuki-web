import type { ReactNode } from 'react';

interface RichTextNode {
  type: string;
  value?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  listType?: 'ordered' | 'unordered';
  level?: number;
  url?: string;
  target?: string;
  children?: RichTextNode[];
}

function renderNode(node: RichTextNode, index: number): ReactNode {
  switch (node.type) {
    case 'root':
      return node.children?.map((child, i) => renderNode(child, i));

    case 'paragraph': {
      const children = node.children?.map((child, i) => renderNode(child, i));
      return (
        <p key={index} className="mb-2 last:mb-0">
          {children}
        </p>
      );
    }

    case 'heading': {
      const children = node.children?.map((child, i) => renderNode(child, i));
      return (
        <p key={index} className="font-medium text-charcoal mb-1 mt-3 first:mt-0">
          {children}
        </p>
      );
    }

    case 'list': {
      const Tag = node.listType === 'ordered' ? 'ol' : 'ul';
      const listClass = node.listType === 'ordered' ? 'list-decimal pl-4' : 'list-disc pl-4';
      return (
        <Tag key={index} className={`${listClass} space-y-1 mb-2`}>
          {node.children?.map((child, i) => renderNode(child, i))}
        </Tag>
      );
    }

    case 'list-item': {
      const children = node.children?.map((child, i) => renderNode(child, i));
      return <li key={index}>{children}</li>;
    }

    case 'text': {
      if (!node.value) return null;
      let text: ReactNode = node.value;
      if (node.bold) text = <strong className="font-medium text-charcoal">{text}</strong>;
      if (node.italic) text = <em>{text}</em>;
      if (node.strikethrough) text = <s>{text}</s>;
      return <span key={index}>{text}</span>;
    }

    case 'link': {
      const children = node.children?.map((child, i) => renderNode(child, i));
      return (
        <a
          key={index}
          href={node.url}
          target={node.target}
          rel={node.target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-burgundy underline underline-offset-2 hover:text-burgundy/70 transition-colors"
        >
          {children}
        </a>
      );
    }

    default:
      return null;
  }
}

/** Extract plain text from a Shopify rich_text metafield JSON string. */
export function richTextToPlain(json: string): string {
  try {
    const root = JSON.parse(json) as RichTextNode;
    const collect = (node: RichTextNode): string => {
      if (node.type === 'text') return node.value ?? '';
      return node.children?.map(collect).join('') ?? '';
    };
    return collect(root).trim();
  } catch {
    return json;
  }
}

/** Render a Shopify rich_text metafield JSON string as styled JSX. */
export default function RichText({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  let root: RichTextNode;
  try {
    root = JSON.parse(value) as RichTextNode;
  } catch {
    return <p className={className}>{value}</p>;
  }

  return (
    <div className={className}>
      {root.children?.map((child, i) => renderNode(child, i))}
    </div>
  );
}
