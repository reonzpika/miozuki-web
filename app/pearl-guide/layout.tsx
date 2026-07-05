import { GuideHubLayout } from '@/components/hub/guide-hub-layout';

export default function PearlGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuideHubLayout hubLabel="Pearl guide" hubHref="/pearl-guide">
      {children}
    </GuideHubLayout>
  );
}
