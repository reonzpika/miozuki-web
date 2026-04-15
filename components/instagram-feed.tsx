import { getInstagramPosts } from '@/lib/instagram/client';

// Instagram CDN URLs are signed and expire within ~1h. We route every image
// through /api/instagram/image which looks up a fresh media_url on the Graph
// API at request time, so cached pages never serve expired links.

export default async function InstagramFeed() {
  const posts = await getInstagramPosts(10);
  if (posts.length === 0) return null;

  return (
    <section className="bg-burgundy py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl md:text-3xl text-cream mb-2">
            Follow Miozuki
          </h2>
          <a
            href="https://www.instagram.com/miozukijewellery"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest uppercase text-cream/50 hover:text-cream/80 transition-colors"
          >
            @miozukijewellery
          </a>
        </div>

        {/* Grid — 2 col mobile, 3 col tablet, 5 col desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {posts.map((post) => {
            const src = `/api/instagram/image?id=${encodeURIComponent(post.id)}`;

            return (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden bg-burgundy/50"
                aria-label={post.caption?.slice(0, 80) ?? 'Instagram post'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={post.caption?.slice(0, 80) ?? ''}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Video indicator */}
                {post.media_type === 'VIDEO' && (
                  <div className="absolute top-2 right-2 bg-charcoal/60 rounded-full p-1">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="white">
                      <path d="M6 4l6 4-6 4V4z" />
                    </svg>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-300" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
