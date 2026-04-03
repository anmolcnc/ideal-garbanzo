import { Role } from "@/app/types";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { hashPassword } from "@/app/lib/auth";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});

async function main(): Promise<void> {
  console.log("Seeding database...");
  //create teams
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: "Engineering",
        description: "Engineering team",
        code: "ENG",
      },
    }),
    prisma.team.create({
      data: {
        name: "Marketing",
        description: "Marketing team",
        code: "MKT",
      },
    }),
    prisma.team.create({
      data: {
        name: "Sales",
        description: "Sales team",
        code: "SAL",
      },
    }),
    prisma.team.create({
      data: {
        name: "Support",
        description: "Support team",
        code: "SUP",
      },
    }),
  ]);
  console.log(`Created ${teams.length} teams`);

  //create users
  const sampleUser = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      role: Role.MANAGER,
      team: teams[0],
    },
    {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: Role.USER,
      team: teams[1],
    },
    {
      name: "Jim Beam",
      email: "jim.beam@example.com",
      role: Role.ADMIN,
      team: teams[2],
    },
    {
      name: "Jill Johnson",
      email: "jill.johnson@example.com",
      role: Role.GUEST,
      team: teams[3],
    },
  ];
  for (const user of sampleUser) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: await hashPassword("password"),
        role: user.role,
        teamId: user.team.id,
      },
    });
  }

  console.log(`Created ${sampleUser.length} users`);
}

main()
  .catch((error) => {
    console.error("Error seeding database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
