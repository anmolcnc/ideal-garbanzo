import { generateToken, hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, teamCode } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Name, email and password are required",
        },
        { status: 400 },
      );
    }

    //Find exisiting user
    const exisitingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (exisitingUser) {
      return NextResponse.json(
        {
          error: "User already exists",
        },
        { status: 409 },
      );
    }

    let teamId: string | undefined;
    if (teamCode) {
      const team = await prisma.team.findUnique({
        where: { code: teamCode },
      });

      if (!team) {
        return NextResponse.json(
          {
            error: "Invalid team code",
          },
          { status: 400 },
        );
      }
      teamId = team.id;
    }
    const hashedPassword = await hashPassword(password);

    //First user become Admin, others become User
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? Role.ADMIN : Role.USER;
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        teamId,
      },
      include: {
        team: true,
      },
    });
    const token = generateToken(user.id);
    const response = NextResponse.json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        team: user.team,
        token,
      },
    });

    //set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json(
      {
        error: "Internal server error, Something went wrong.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
