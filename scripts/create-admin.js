const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "gestao@shopmotor.com.br";
  const password = "Shopmotor.0100";
  const name = "Gestão ShopMotor";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: "ADMIN", name },
    create: {
      email,
      passwordHash,
      name,
      role: "ADMIN",
      accountType: "PF",
    },
  });

  console.log("✅ Admin criado/atualizado:", user.email, "| role:", user.role);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
