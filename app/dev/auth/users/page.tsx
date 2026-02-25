import { CreateUserForm } from "@/components/dev/create-user-form";

export default function DevAuthUsersPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-6">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create users, set role, and generate password reset links.
        </p>
      </div>

      <CreateUserForm />
    </div>
  );
}