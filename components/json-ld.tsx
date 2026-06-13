// Renders a schema.org JSON-LD block. Server component.
// Pass a plain schema object; it is serialised into a <script type="application/ld+json">.
// This is the Next.js App Router recommended pattern for structured data.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Schema is built from our own data, not user input, so this is safe.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
