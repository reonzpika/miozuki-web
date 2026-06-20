type SearchParams = Promise<{ error?: string; from?: string }>;

export const metadata = { title: 'Admin sign in', robots: { index: false } };

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error, from } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-serif text-4xl text-burgundy">Miozuki</div>
          <div className="text-[13px] tracking-[0.2em] uppercase text-graphite mt-1">
            admin
          </div>
        </div>
        <form
          action="/api/admin/login"
          method="post"
          className="bg-white-soft border border-border rounded-xl p-7"
        >
          {from ? <input type="hidden" name="from" value={from} /> : null}
          <label
            htmlFor="password"
            className="block text-base font-medium text-charcoal mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            required
            className="w-full border border-border rounded-lg px-3 py-2.5 bg-cream text-charcoal outline-none focus:border-burgundy"
          />
          {error ? (
            <p className="text-base text-burgundy mt-3">
              That password did not work. Try again.
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-5 w-full bg-burgundy text-white-soft rounded-lg py-2.5 font-medium hover:bg-accent-hover transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
