import ResetPasswordClient from "./reset-password-client";

export const runtime = "nodejs";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: { oobCode?: string };
}) {
  const oobCode = searchParams?.oobCode ?? "";
  return <ResetPasswordClient oobCode={oobCode} />;
}