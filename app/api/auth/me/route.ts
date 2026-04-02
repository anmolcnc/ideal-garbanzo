import { getCurrentUser } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        {
          error: "You are not authenticated",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message: "User fetched successfully",
        user: currentUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching user", error);
    return NextResponse.json(
      {
        error: "Internal server error, Something went wrong.",
      },
      { status: 500 },
    );
  }
}
