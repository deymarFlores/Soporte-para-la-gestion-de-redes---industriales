import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcrypt";

const pool = new pg.Pool({ connectionString: process.env["DATABASE_URL"] });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main(): Promise<void> {
  const gatewayToken = process.env["SEED_GATEWAY_TOKEN"] ?? "dev-gateway-token-change-me";
  const adminPassword = process.env["SEED_ADMIN_PASSWORD"] ?? "admin123";

  let site = await prisma.site.findFirst({ where: { name: "Planta Principal" } });
  if (!site) {
    site = await prisma.site.create({
      data: { name: "Planta Principal", location: "", description: "" },
    });
  }

  let gateway = await prisma.node.findUnique({ where: { agentToken: gatewayToken } });
  if (!gateway) {
    gateway = await prisma.node.create({
      data: {
        name: "Gateway IOT2040",
        type: "GATEWAY",
        ip: "192.168.2.1",
        agentToken: gatewayToken,
        siteId: site.id,
      },
    });
  } else if (!gateway.siteId) {
    gateway = await prisma.node.update({ where: { id: gateway.id }, data: { siteId: site.id } });
  }

  const plcIp = "192.168.2.10";
  let plc = await prisma.node.findFirst({ where: { ip: plcIp } });
  if (!plc) {
    plc = await prisma.node.create({
      data: {
        name: "PLC S7-1200",
        type: "PLC",
        ip: plcIp,
        parentId: gateway.id,
        siteId: site.id,
        remoteAccessEnabled: true,
      },
    });
  } else if (!plc.siteId || !plc.remoteAccessEnabled) {
    plc = await prisma.node.update({
      where: { id: plc.id },
      data: { siteId: site.id, remoteAccessEnabled: true },
    });
  }

  const existingSegment = await prisma.segment.findFirst({
    where: { originId: gateway.id, destinationId: plc.id },
  });
  if (!existingSegment) {
    await prisma.segment.create({
      data: {
        name: `${gateway.name} → ${plc.name}`,
        originId: gateway.id,
        destinationId: plc.id,
        connectionType: "Ethernet",
        monitoringMethod: "ICMP",
      },
    });
  }

  const adminEmail = "admin@planta.com";
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: "Carla Méndez",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: "ADMINISTRADOR",
      },
    });
  }

  await prisma.userDeviceAccess.upsert({
    where: { userId_nodeId: { userId: admin.id, nodeId: plc.id } },
    update: {},
    create: { userId: admin.id, nodeId: plc.id },
  });

  console.log("Seed completo.");
  console.log("Token del gateway (usar en el header x-agent-token):", gatewayToken);
  console.log("Login de administrador:", adminEmail, "/", adminPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
