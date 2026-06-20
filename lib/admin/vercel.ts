// Reads recent production deployments from the Vercel API for the admin Home
// tab. Token-gated and graceful: if VERCEL_API_TOKEN / VERCEL_PROJECT_ID are
// not set, returns null and the UI shows a "connect Vercel" state instead of
// breaking.
//
// Env (set in .env.local and Vercel):
//   VERCEL_API_TOKEN   a read token from Vercel account settings > Tokens
//   VERCEL_PROJECT_ID  prj_... (already in .vercel/project.json)
//   VERCEL_TEAM_ID     team_... (already in .vercel/project.json)

export type AdminDeploy = {
  uid: string;
  state: string;
  created: number;
  commitMessage: string | null;
};

export async function getRecentDeployments(
  limit = 6,
): Promise<AdminDeploy[] | null> {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) return null;

  const url = new URL('https://api.vercel.com/v6/deployments');
  url.searchParams.set('projectId', projectId);
  url.searchParams.set('target', 'production');
  url.searchParams.set('limit', String(limit));
  if (teamId) url.searchParams.set('teamId', teamId);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const data: {
      deployments?: Array<{
        uid: string;
        state?: string;
        readyState?: string;
        created?: number;
        createdAt?: number;
        meta?: { githubCommitMessage?: string };
      }>;
    } = await res.json();
    return (data.deployments ?? []).map((d) => ({
      uid: d.uid,
      state: d.state ?? d.readyState ?? 'UNKNOWN',
      created: d.created ?? d.createdAt ?? 0,
      commitMessage: d.meta?.githubCommitMessage ?? null,
    }));
  } catch {
    return null;
  }
}
