import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main(): Promise<void> {
  const gatewayToken = process.env["SEED_GATEWAY_TOKEN"] ?? "dev-gateway-token-change-me";

  let gateway = await prisma.node.findUnique({ where: { agentToken: gatewayToken } });
  if (!gateway) {
    gateway = await prisma.node.create({
      data: {
        name: "Gateway IOT2040",
        type: "GATEWAY",
        ip: "192.168.2.1",
        agentToken: gatewayToken,
      },
    });
  }

  const plcIp = "192.168.2.10";
  const existingPlc = await prisma.node.findFirst({ where: { ip: plcIp } });
  if (!existingPlc) {
    await prisma.node.create({
      data: {
        name: "PLC S7-1200",
        type: "PLC",
        ip: plcIp,
        parentId: gateway.id,
      },
    });
  }

  console.log("Seed completo. Token del gateway (usar en el header x-agent-token):", gatewayToken);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
