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

/** Removes the phrase "Need assistance?" and anything after it, with a tidy trailing trim. Case-insensitive. */
export function clipAfterNeedAssistanceQuestion(text: string): string {
  const m = /\bneed assistance\?/i.exec(text);
  if (!m) return text;
  return text.slice(0, m.index).trimEnd();
}

const COLLECTION_BLURB_MAX = 180;

/**
 * Clamp a collection intro to a short excerpt. The curated intro is the
 * `custom.intro` metafield; when a collection lacks it the code falls back to the
 * full `description`, which can be a long SEO guide. Without clamping, that whole
 * wall renders under the title (the moissanite-necklace-nz case). Returns the
 * first sentence when short enough, else a word-boundary clamp with an ellipsis.
 */
export function clampCollectionBlurb(text: string): string {
  const t = text.trim();
  if (t.length <= COLLECTION_BLURB_MAX) return t;
  const firstSentence = /^.*?[.!?](?:\s|$)/.exec(t)?.[0]?.trim();
  if (firstSentence && firstSentence.length <= COLLECTION_BLURB_MAX) return firstSentence;
  const clipped = t.slice(0, COLLECTION_BLURB_MAX);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
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
