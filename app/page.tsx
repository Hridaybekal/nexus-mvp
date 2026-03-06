import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats, getRecentProjects, getAllUsers } from "@/lib/actions";
import DashboardClient from "@/components/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) redirect("/api/auth/signin");

  const [stats, projectData, allUsers] = await Promise.all([
    getDashboardStats(),
    getRecentProjects(),
    getAllUsers(),
  ]);

  return (
    <DashboardClient 
      userName={session.user.name || "User"} 
      userRole={(session.user as any).role} 
      stats={stats || { projectCount: 0, taskStats: { todo: 0, inProgress: 0, blocked: 0, done: 0 } }} 
      projects={projectData?.projects || []} 
      allUsers={allUsers || []}
    />
  );
}