import { Prisma } from "@/app/generated/prisma/client";
import { getCurrentUser } from "@/app/lib/auth";
import { Role } from "@/app/types";
import { prisma } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        {
          error: "You are not authenticated",
        },
        { status: 401 },
      );
    }
    const searchParms = request.nextUrl.searchParams;
    const teamId = searchParms.get("teamId");
    const role = searchParms.get("role");

    //Build where clause based on user role
    const where: Prisma.UserWhereInput = {};
    if (user.role === Role.ADMIN) {
      where.role = {
        in: [Role.ADMIN, Role.MANAGER],
      };
    } else if (user.role === Role.MANAGER) {
      where.OR = [{ teamId: user.teamId }, { role: Role.USER }];
    } else {
      where.teamId = user.teamId;
      where.role = { not: Role.ADMIN };
    }

    //Aditional Filters
    if (teamId) {
      where.teamId = teamId;
    }
    if (role) {
      where.role = role as Role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      {
        message: "Users fetched successfully",
        users,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching users", error);
    return NextResponse.json(
      {
        error: "Internal server error, Something went wrong.",
      },
      { status: 500 },
    );
  }
}
