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

  const demoUsers = [
    { email: "admin@planta.com", name: "Carla Méndez", role: "ADMINISTRADOR" as const, password: adminPassword, grantPlcAccess: true },
    { email: "soporte@planta.com", name: "Diego Fernández", role: "SOPORTE" as const, password: "soporte123", grantPlcAccess: true },
    { email: "consulta@planta.com", name: "Elena Rojas", role: "CONSULTA" as const, password: "consulta123", grantPlcAccess: false },
  ];

  for (const demoUser of demoUsers) {
    let user = await prisma.user.findUnique({ where: { email: demoUser.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: demoUser.name,
          email: demoUser.email,
          passwordHash: await bcrypt.hash(demoUser.password, 10),
          role: demoUser.role,
        },
      });
    }

    if (demoUser.grantPlcAccess) {
      await prisma.userDeviceAccess.upsert({
        where: { userId_nodeId: { userId: user.id, nodeId: plc.id } },
        update: {},
        create: { userId: user.id, nodeId: plc.id },
      });
    }
  }

  console.log("Seed completo.");
  console.log("Token del gateway (usar en el header x-agent-token):", gatewayToken);
  console.log("Logins de demostración:");
  for (const demoUser of demoUsers) {
    console.log(` - ${demoUser.role}: ${demoUser.email} / ${demoUser.password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
