import { GuideHubLayout } from '@/components/hub/guide-hub-layout';

export const metadata = {
  openGraph: {
    images: [{ url: '/generated/hero-moissanite-guide.jpg', width: 1600, height: 1200 }],
  },
};

export default function MoissaniteGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuideHubLayout hubLabel="Moissanite guide" hubHref="/moissanite-guide">
      {children}
    </GuideHubLayout>
  );
}
