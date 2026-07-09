import { GuideHubLayout } from '@/components/hub/guide-hub-layout';

export const metadata = {
  openGraph: {
    images: [{ url: '/generated/hero-pearl-guide.jpg', width: 1600, height: 1200 }],
  },
};

export default function PearlGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuideHubLayout hubLabel="Pearl guide" hubHref="/pearl-guide">
      {children}
    </GuideHubLayout>
  );
}
