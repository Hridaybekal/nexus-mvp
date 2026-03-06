"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * 🚀 1. CREATE PROJECT (With Tasks & Assignments)
 */
// lib/actions.ts

export async function createProject(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const drive_url = formData.get("drive_url") as string;
    const memberIds = JSON.parse(formData.get("memberIds") as string || "[]");
    const tasks = JSON.parse(formData.get("tasks") as string || "[]");

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        drive_url,
        managerId: session.user.id,
        // 🛡️ Standard: Link real users in the DB
        members: {
          connect: memberIds.map((id: string) => ({ id }))
        },
        // 🛡️ Standard: Create nested tasks
        tasks: {
          create: tasks.map((t: any) => ({
            title: t.title,
            description: t.description,
            priority: t.priority || "MEDIUM",
            status: "TODO"
          }))
        }
      }
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create project" };
  }
}

export async function updateProject(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const drive_url = formData.get("drive_url") as string;
    const memberIds = JSON.parse(formData.get("memberIds") as string || "[]");

    await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        drive_url,
        members: {
          // 🛡️ Standard: This replaces the old team with the new selection
          set: memberIds.map((id: string) => ({ id }))
        }
      }
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    return { error: "Update failed" };
  }
}

/**
 * 📊 2. FETCH DASHBOARD STATS (For the Graph)
 */
export async function getDashboardStats() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // 👔 If Manager, see everything. 👷 If Employee, see only YOURS.
    const whereClause = userRole === "MANAGER" ? {} : {
      members: { some: { id: userId } }
    };

    const projectCount = await prisma.project.count({ where: whereClause });
    
    // Count tasks assigned specifically to this user
    const taskStats = {
      todo: await prisma.task.count({ where: { ...whereClause, status: "TODO" } }),
      inProgress: await prisma.task.count({ where: { ...whereClause, status: "IN_PROGRESS" } }),
      blocked: await prisma.task.count({ where: { ...whereClause, status: "BLOCKED" } }),
      done: await prisma.task.count({ where: { ...whereClause, status: "DONE" } }),
    };

    return { projectCount, taskStats };
  } catch (error) {
    console.error("Stats Error:", error);
    return { projectCount: 0, taskStats: { todo: 0, inProgress: 0, blocked: 0, done: 0 } };
  }
}

/**
 * 📂 3. FETCH RECENT PROJECTS (Now includes Tasks!)
 */
export async function getRecentProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        tasks: true, // 👈 This tells Prisma to fetch the tasks inside the project!
      }
    });
    return { projects };
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    return { projects: [] };
  }
}

/**
 * 📝 4. UPDATE FULL PROJECT (Now handles Members & New Tasks)
 */
// export async function updateProject(formData: FormData) {
//   try {
//     const id = formData.get("id") as string;
//     const name = formData.get("name") as string;
//     const description = formData.get("description") as string;
//     const drive_url = formData.get("drive_url") as string;
    
//     const membersRaw = formData.get("members") as string;
//     const newTasksRaw = formData.get("newTasks") as string;

//     // Update the core project & members
//     await prisma.project.update({
//       where: { id: id },
//       data: { 
//         name, 
//         description, 
//         drive_url,
//         teamNames: membersRaw || "[]"
//       }
//     });

//     // If the user added NEW tasks during Edit mode, save them!
//     if (newTasksRaw) {
//       const newTasks = JSON.parse(newTasksRaw);
//       const validTasks = newTasks
//         .filter((t: any) => t.title && t.title.trim() !== "")
//         .map((t: any) => ({
//           title: t.title,
//           description: t.description || null,
//           priority: t.priority || "MEDIUM",
//           status: "TODO",
//           dueDate: t.dueDate ? new Date(t.dueDate) : null,
//           projectId: id,
//         }));

//       if (validTasks.length > 0) {
//         await prisma.task.createMany({ data: validTasks });
//       }
//     }

//     revalidatePath("/projects");
//     revalidatePath("/");
//     return { success: true };
//   } catch (error) {
//     console.error("Update Error:", error);
//     return { error: "Failed to update project." };
//   }
// }

/**
 * ✅ 6. TOGGLE TASK STATUS (For the Progress Bar)
 */
export async function toggleTaskStatus(taskId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
    await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus }
    });
    
    revalidatePath("/projects");
    return { success: true, newStatus };
  } catch (error) {
    return { error: "Failed to update task." };
  }
}

/**
 * 🗑️ DELETE PROJECT
 */
export async function deleteProject(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  try {
    // 🛡️ SECURITY: Only delete if the project belongs to THIS manager
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        managerId: session.user.id 
      }
    });

    if (!project) return { error: "You do not have permission to delete this project." };

    await prisma.project.delete({ where: { id: projectId } });
    revalidatePath("/projects");
    return { success: true };
  } catch (e) {
    return { error: "Delete failed" };
  }
}
export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) return { error: "Missing fields" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password_hash: hashedPassword,
        role: "MEMBER", // 👈 EVERYONE starts as member. Change to MANAGER in Prisma Studio.
      },
    });

    return { success: true };
  } catch (error) {
    return { error: "Registration failed." };
  }
}

/**
 * 👥 7. FETCH ALL REGISTERED USERS
 * Used for the "Assign Members" dropdown in Project Management.
 */
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      orderBy: {
        name: 'asc'
      }
    });
    return users;
  } catch (error) {
    console.error("❌ Fetch Users Error:", error);
    return [];
  }
}

//to make the generated task using AI
// lib/actions.ts

export async function generateTasksFromAI(notes: string) {
  // 🚀 In the future, this is where you'd call Gemini API
  // For now, let's simulate a delay and return structured tasks
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  return [
    { title: "Review: " + notes.slice(0, 20) + "...", priority: "HIGH" },
    { title: "Draft follow-up document", priority: "MEDIUM" },
    { title: "Schedule team sync", priority: "LOW" }
  ];
}