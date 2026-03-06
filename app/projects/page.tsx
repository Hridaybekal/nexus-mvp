import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecentProjects, getAllUsers } from "@/lib/actions";
import ProjectClientContent from "@/components/ProjectClientContent";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) redirect("/api/auth/signin");

  const [projectData, users] = await Promise.all([
    getRecentProjects(),
    getAllUsers()
  ]);

  return (
    <ProjectClientContent 
      initialProjects={projectData?.projects || []} 
      allUsers={users || []} 
      currentUser={session.user}
    />
  );
}