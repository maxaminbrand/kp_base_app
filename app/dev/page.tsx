export default function DevDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-6">
        <h1 className="text-xl font-semibold">Dev Dashboard</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
          Engineering + override tools only. Not an admin superset.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-semibold">Next up</div>
          <div className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
            Build the sidebar pages (Auth/session, Role manager, etc.) behind these links.
          </div>
        </div>
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-semibold">Sidebar behavior</div>
          <div className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
            Accordion (one open), icon-only collapse, smooth animation, persistent state, tooltips.
          </div>
        </div>
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-semibold">Guard</div>
          <div className="mt-2 text-sm text-[hsl(var(--muted-fg))]">
            Only <span className="font-medium">appRole=dev</span> can access this area.
          </div>
        </div>
      </div>
    </div>
  );
}