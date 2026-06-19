import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Miozuki, Fine Jewellery',
    short_name: 'Miozuki',
    description:
      'Moissanite and pearl fine jewellery, ethically made and designed in New Zealand.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f3ef',
    theme_color: '#f5f3ef',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
