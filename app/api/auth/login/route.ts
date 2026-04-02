import { generateToken, verifyPasswod } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
        },
        { status: 400 },
      );
    }

    //Find exisiting user
    const userFromDb = await prisma.user.findUnique({
      where: { email },
      include : {
        team: true,
      }
    });
    if (!userFromDb) {
      return NextResponse.json(
        {
          error: "Email does not exist",
        },
        { status: 409 },
      );
    }

    const isPasswordValid = await verifyPasswod(
      password,
      userFromDb.password,
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "Invalid password",
        },
        { status: 401 },
      );
    }

    const token = generateToken(userFromDb.id);
    const response = NextResponse.json({
      message: "User logged in successfully",
      user: {
        id: userFromDb.id,
        name: userFromDb.name,
        email: userFromDb.email,
        role: userFromDb.role,
        teamId: userFromDb.teamId,
        team: userFromDb.team,
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
    console.error("Login failed", error);
    return NextResponse.json(
      {
        error: "Internal server error, Something went wrong.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
