import { GuideHubLayout } from '@/components/hub/guide-hub-layout';

export default function MoissaniteGuideLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuideHubLayout hubLabel="Moissanite guide" hubHref="/moissanite-guide">
      {children}
    </GuideHubLayout>
  );
}
