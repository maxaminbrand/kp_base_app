export const runtime = "nodejs";

export default function OfflinePage() {
  return (
    <main className="mx-auto w-full max-w-md p-6">
      <h1 className="text-xl font-semibold">You&apos;re offline</h1>
      <p className="mt-2 text-sm text-muted-foreground">Check your connection and try again.</p>
    </main>
  );
}