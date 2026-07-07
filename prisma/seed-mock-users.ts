import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, RolUsuario } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seed Mocks: Creando usuarios de prueba...');

  const mockUserId1 = '123e4567-e89b-12d3-a456-426614174000';
  await prisma.usuario.upsert({
    where: { id: mockUserId1 },
    update: {},
    create: {
      id: mockUserId1,
      email: 'juan@mayoriza.com',
      nombre: 'Contador Juan (Mock 1)',
      rol: RolUsuario.CONTADOR,
    },
  });

  const mockUserId2 = '123e4567-e89b-12d3-a456-426614174001';
  await prisma.usuario.upsert({
    where: { id: mockUserId2 },
    update: {},
    create: {
      id: mockUserId2,
      email: 'maria@mayoriza.com',
      nombre: 'Contadora María (Mock 2)',
      rol: RolUsuario.CONTADOR,
      activo: false,
    },
  });

  const mockAdminId = '123e4567-e89b-12d3-a456-426614174002';
  await prisma.usuario.upsert({
    where: { id: mockAdminId },
    update: {},
    create: {
      id: mockAdminId,
      email: 'admin@mayoriza.com',
      nombre: 'Administrador (Mock)',
      rol: RolUsuario.ADMIN,
    },
  });

  console.log('Seed Mocks: Usuarios creados correctamente.');
}

main()
  .catch((e) => {
    console.error('Error durante la creación de usuarios mock:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
