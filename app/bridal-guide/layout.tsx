import { GuideHubLayout } from '@/components/hub/guide-hub-layout';

export default function BridalGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuideHubLayout hubLabel="Bridal guide" hubHref="/bridal-guide">
      {children}
    </GuideHubLayout>
  );
}
