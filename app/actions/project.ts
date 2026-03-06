"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProjectAction(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Name is required" };

  try {
    await prisma.project.create({
      data: {
        name,
        description,
        managerId: "system-generated-id", // スキーマの必須項目を補完
      },
    });

    revalidatePath("/"); 
    return { success: true };
  } catch (e) {
    return { error: "Failed to create project" };
  }
}