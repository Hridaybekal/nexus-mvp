import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats, getRecentProjects, getAllUsers } from "@/lib/actions";
import DashboardClient from "@/components/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) redirect("/api/auth/signin");

  // サーバー側で全てのデータを並列取得
  const [stats, projectData, allUsers] = await Promise.all([
    getDashboardStats(),
    getRecentProjects(),
    getAllUsers(),
  ]);

  return (
    <DashboardClient 
      userName={session.user.name} 
      userRole={(session.user as any).role} 
      stats={stats} 
      projects={projectData.projects || []} 
      allUsers={allUsers || []}
    />
  );
}