import { GuideHubLayout } from '@/components/hub/guide-hub-layout';

export const metadata = {
  openGraph: {
    images: [{ url: '/generated/hero-bridal-guide.jpg', width: 1600, height: 1200 }],
  },
};

export default function BridalGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuideHubLayout hubLabel="Bridal guide" hubHref="/bridal-guide">
      {children}
    </GuideHubLayout>
  );
}
