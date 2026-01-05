import { redirect } from "next/navigation";
import { getUser } from "~/lib/supabase/server";
import { Header } from "~/components/layout/header";
import { AchievementCelebrator } from "~/features/achievements";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header userEmail={user.email ?? "User"} />
      <AchievementCelebrator>
        <div className="flex-1">{children}</div>
      </AchievementCelebrator>
    </div>
  );
}
