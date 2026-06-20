export const dynamic = 'force-static';

export default function AdminLessons() {
  return (
    <div>
      <h1 className="font-serif text-4xl text-charcoal mb-2">
        What you can do, and where
      </h1>
      <p className="text-[17px] text-graphite max-w-xl mb-7">
        Two places, two jobs. Get this right and you can run the whole site
        yourself.
      </p>

      {/* Split */}
      <div className="grid md:grid-cols-2 gap-4 mb-7">
        <div className="rounded-2xl border border-border p-6 bg-gradient-to-b from-[#fdfaf4] to-champagne">
          <div className="text-[15px] font-medium tracking-wide uppercase text-[#9a7b34] mb-1.5">
            ✎ Ask the AI in Cursor
          </div>
          <h2 className="font-serif text-2xl text-charcoal mb-4">
            Pages &amp; how the site looks
          </h2>
          <ul className="space-y-2 text-[17px] text-charcoal">
            {[
              'Wording on pages: About, FAQ, policies, guides',
              'Layout, spacing, colours, the way things look',
              'Add or swap images on pages and banners (not product or collection images)',
              'Add a whole new page or section',
              'Hero text and the homepage',
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="text-gold mt-0.5 text-[12px]">◆</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border p-6 bg-gradient-to-b from-[#fcf0ef] to-blush">
          <div className="text-[15px] font-medium tracking-wide uppercase text-burgundy mb-1.5">
            🛒 Edit in Shopify admin
          </div>
          <h2 className="font-serif text-2xl text-charcoal mb-4">
            Products &amp; what you sell
          </h2>
          <ul className="space-y-2 text-[17px] text-charcoal">
            {[
              'Product name, description and price',
              'Product images and photos',
              'Collections, their images and what is in them',
              'Blog and news posts, and their images',
              'Review text and photos live in Judge.me',
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <span className="text-burgundy mt-0.5 text-[12px]">◆</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick test */}
      <div className="rounded-xl bg-charcoal text-cream p-6 mb-7">
        <div className="text-[14px] tracking-[0.15em] uppercase text-gold mb-2">
          The quick test
        </div>
        <p className="text-[19px]">
          Is it a{' '}
          <span className="font-medium text-champagne">
            product, a collection, or a blog post
          </span>
          ? Go to Shopify. Is it{' '}
          <span className="font-medium text-champagne">
            a page of writing or how the site looks
          </span>
          ? Ask the AI in Cursor.
        </p>
      </div>

      {/* How to publish */}
      <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
        <h2 className="font-serif text-xl text-charcoal mb-1">How to publish</h2>
        <p className="text-base text-graphite mb-4">
          You do not press any buttons. The AI does it for you.
        </p>
        <ol className="space-y-2.5">
          {[
            'Tell the AI in Cursor what you want changed.',
            'Check it on your local preview until it looks right, on phone and computer width.',
            'The AI runs its checks and saves, then asks if you want to make it live.',
          ].map((t, i) => (
            <li key={t} className="flex gap-3.5 text-[17px] text-charcoal">
              <span className="flex-none w-6 h-6 rounded-full bg-burgundy text-white-soft text-[15px] font-medium flex items-center justify-center">
                {i + 1}
              </span>
              {t}
            </li>
          ))}
        </ol>
      </section>

      {/* If broken */}
      <section className="bg-white-soft border border-border rounded-xl p-6 mb-6">
        <h2 className="font-serif text-xl text-charcoal mb-1">
          If something looks wrong
        </h2>
        <p className="text-base text-graphite">
          Do not panic. Open Cursor and say &ldquo;put the site back&rdquo;. It
          undoes your last change and the site returns to how it was, live within
          a minute. If that does not work, message Ryo.
        </p>
      </section>

      {/* Infographic placeholder */}
      <section className="bg-white-soft border border-border rounded-xl p-6">
        <h2 className="font-serif text-xl text-charcoal mb-1">Visual guides</h2>
        <p className="text-base text-graphite mb-4">
          These become friendly infographics, made with the Nano-banana image
          setup.
        </p>
        <div className="rounded-xl border border-dashed border-gold bg-[#fdfaf3] p-8 text-center">
          <div className="text-3xl">📷</div>
          <div className="text-[#9a7b34] mt-1">Nano-banana infographic</div>
          <div className="text-[15px] text-graphite mt-1">
            &ldquo;Cursor vs Shopify&rdquo; one-glance picture
          </div>
        </div>
      </section>
    </div>
  );
}
