import { listUsersAction, updateUserAction, type ListedUser } from "./actions";

function qs(value: string | null | undefined) {
  return (value ?? "").trim();
}

function formatTime(s: string | null | undefined) {
  if (!s) return "—";
  return s;
}

export default async function ManageUsersPage(props: {
  searchParams?: Promise<{ q?: string; pageToken?: string }>;
}) {
  const sp = (await props.searchParams) ?? {};
  const q = qs(sp.q);
  const pageToken = qs(sp.pageToken) || null;

  const { users, nextPageToken, mode } = await listUsersAction({
    q: q || null,
    pageToken: pageToken || null,
    limit: 25,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-6">
        <h1 className="text-xl font-semibold">Manage Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">List, search, and edit users (dev-only).</p>

        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" action="/dev/manage-users" method="get">
          <div className="flex-1">
            <label className="text-sm font-medium">Search (email or uid)</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="example@domain.com or uid"
              className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Search
            </button>
            <a
              href="/dev/manage-users"
              className="h-10 rounded-md border px-4 text-sm font-medium hover:bg-primary/10"
            >
              Clear
            </a>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div className="text-sm font-semibold">
            {mode === "search" ? "Search Results" : "Users"}
            <span className="ml-2 text-xs text-muted-foreground">({users.length})</span>
          </div>

          {mode === "list" ? (
            <div className="flex items-center gap-2">
              {pageToken ? (
                <a
                  href="/dev/manage-users"
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-primary/10"
                >
                  First page
                </a>
              ) : null}

              {nextPageToken ? (
                <a
                  href={`/dev/manage-users?pageToken=${encodeURIComponent(nextPageToken)}`}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Next
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-primary/5">
              <tr>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Disabled</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Last sign-in</th>
                <th className="px-5 py-3 font-medium">Save</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td className="px-5 py-6 text-muted-foreground" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => <UserRow key={u.uid} user={u} q={q} pageToken={pageToken} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserRow(props: { user: ListedUser; q: string; pageToken: string | null }) {
  const u = props.user;

  // Keep user on the same view after submit:
  const returnTo =
    props.q
      ? `/dev/manage-users?q=${encodeURIComponent(props.q)}`
      : props.pageToken
      ? `/dev/manage-users?pageToken=${encodeURIComponent(props.pageToken)}`
      : `/dev/manage-users`;

  return (
    <tr className="border-b last:border-b-0">
      <td className="px-5 py-4 align-top">
        <div className="font-medium">{u.email ?? "No email"}</div>
        <div className="mt-1 font-mono text-xs text-muted-foreground">{u.uid}</div>
      </td>

      <td className="px-5 py-4 align-top">
        <form action={updateUserAction} className="space-y-2">
          <input type="hidden" name="uid" value={u.uid} />
          <input type="hidden" name="returnTo" value={returnTo} />

          <select
            name="role"
            defaultValue={u.appRole === "unknown" ? "user" : u.appRole}
            className="h-10 w-full min-w-[160px] rounded-md border bg-background px-3 text-sm"
          >
            <option value="user">user</option>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
            <option value="owner">owner</option>
            <option value="dev">dev</option>
          </select>
      </form>
      </td>

      <td className="px-5 py-4 align-top">
        <form action={updateUserAction} className="flex items-center gap-2">
          <input type="hidden" name="uid" value={u.uid} />
          <input type="hidden" name="role" value={u.appRole === "unknown" ? "user" : u.appRole} />
          <input type="hidden" name="returnTo" value={returnTo} />

          <label className="flex items-center gap-2">
            <input name="disabled" type="checkbox" defaultChecked={u.disabled} className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">{u.disabled ? "Yes" : "No"}</span>
          </label>

          <button className="ml-auto rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Save
          </button>
        </form>
      </td>

      <td className="px-5 py-4 align-top text-muted-foreground">{formatTime(u.createdAt)}</td>
      <td className="px-5 py-4 align-top text-muted-foreground">{formatTime(u.lastSignInAt)}</td>

      <td className="px-5 py-4 align-top">
        <form action={updateUserAction} className="flex items-center gap-2">
          <input type="hidden" name="uid" value={u.uid} />
          <input type="hidden" name="role" value={u.appRole === "unknown" ? "user" : u.appRole} />
          <input type="hidden" name="disabled" value={u.disabled ? "on" : ""} />
          <input type="hidden" name="returnTo" value={returnTo} />

          <button className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-primary/10">
            Save role
          </button>
        </form>
      </td>
    </tr>
  );
}