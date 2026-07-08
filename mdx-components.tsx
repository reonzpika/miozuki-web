import type { MDXComponents } from 'mdx/types';
import type { ComponentPropsWithoutRef } from 'react';

/**
 * App Router requires this file for MDX. It styles the markdown elements in hub
 * articles (/moissanite-guide, /pearl-guide, /bridal-guide) to match the brand.
 * Custom components used inside the .mdx (HubFaq, HubCta) are imported directly
 * and style themselves.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (p: ComponentPropsWithoutRef<'h1'>) => (
      <h1 className="font-serif text-3xl leading-tight text-charcoal md:text-4xl mb-5" {...p} />
    ),
    h2: (p: ComponentPropsWithoutRef<'h2'>) => (
      <h2 className="font-serif text-2xl text-charcoal mt-10 mb-4" {...p} />
    ),
    h3: (p: ComponentPropsWithoutRef<'h3'>) => (
      <h3 className="font-medium text-charcoal mt-6 mb-2" {...p} />
    ),
    p: (p: ComponentPropsWithoutRef<'p'>) => (
      <p className="mb-4 text-[15px] leading-relaxed text-charcoal/80" {...p} />
    ),
    ul: (p: ComponentPropsWithoutRef<'ul'>) => (
      <ul className="mb-4 list-disc space-y-1 pl-5 text-[15px] text-charcoal/80" {...p} />
    ),
    ol: (p: ComponentPropsWithoutRef<'ol'>) => (
      <ol className="mb-4 list-decimal space-y-1 pl-5 text-[15px] text-charcoal/80" {...p} />
    ),
    li: (p: ComponentPropsWithoutRef<'li'>) => <li className="leading-relaxed" {...p} />,
    strong: (p: ComponentPropsWithoutRef<'strong'>) => (
      <strong className="font-medium text-charcoal" {...p} />
    ),
    a: (p: ComponentPropsWithoutRef<'a'>) => (
      <a className="text-burgundy underline underline-offset-2 transition-colors hover:text-burgundy/70" {...p} />
    ),
    table: (p: ComponentPropsWithoutRef<'table'>) => (
      <div className="mb-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-[14px]" {...p} />
      </div>
    ),
    thead: (p: ComponentPropsWithoutRef<'thead'>) => (
      <thead className="border-b border-charcoal/15 text-charcoal" {...p} />
    ),
    th: (p: ComponentPropsWithoutRef<'th'>) => (
      <th className="px-3 py-2 font-medium" {...p} />
    ),
    tbody: (p: ComponentPropsWithoutRef<'tbody'>) => (
      <tbody className="divide-y divide-charcoal/10" {...p} />
    ),
    td: (p: ComponentPropsWithoutRef<'td'>) => (
      <td className="px-3 py-2 align-top text-charcoal/80" {...p} />
    ),
    ...components,
  };
}
