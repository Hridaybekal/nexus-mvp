import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // パスワードを暗号化
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // テストユーザーを作成
    const user = await prisma.user.create({
      data: {
        email: "h-bekal@jmc-ltd.co.com",
        name: "Hriday",
        password_hash: hashedPassword,
        role: "MANAGER"
      }
    });

    return NextResponse.json({ message: "テストユーザーの作成に成功しました！", user });
  } catch (error) {
    return NextResponse.json({ message: "すでにユーザーが存在するか、エラーが発生しました。" });
  }
}