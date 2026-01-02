import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppHome() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28 }}>Member App</h1>
      <p>Signed in as: {data.user.email}</p>
      <p>Next: show profile + membership tier + navigation.</p>
    </main>
  );
}
